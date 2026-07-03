// Sync del GASTO de Meta Ads → tabla `campanas` (Supabase periodistas-marketing).
// Equivalente serverless de ads-agent/meta-spend-sync.mjs, para correr desde el cron
// (api/recuperacion.js lo llama al inicio de su corrida diaria, junto a runHotmartSync).
// Detalle en ads-agent/ARQUITECTURA-DATOS.md.
//
// Trae los insights por anuncio (Marketing API), extrae la matrícula `src` (adN-angulo)
// del nombre del conjunto/anuncio, agrega por src y hace PATCH del gasto/CTR en la ficha
// de `campanas` (solo esas columnas; no pisa config ni decision). Solo actualiza fichas
// que ya existen. Best-effort: si algo falla, loguea y sigue — nunca tumba la recuperación.
//
// Env: META_ACCESS_TOKEN (con ads_read), META_AD_ACCOUNT_ID (con o sin "act_"),
//      SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Opcional: META_SPEND_PRESET (default maximum).

const API = 'https://graph.facebook.com/v21.0';
const TOKEN   = (process.env.META_ACCESS_TOKEN || '').trim();
const ACCOUNT = (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^act_/, '');
const PRESET  = (process.env.META_SPEND_PRESET || 'maximum').trim();
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// La matrícula adN-angulo dentro de un nombre de Meta ("ad1-fomo · 30-55 intereses").
const MATRICULA = /(ad\d+-[a-z0-9-]+?)(?=\s|·|$)/i;
function extraerSrc(...nombres) {
  for (const n of nombres) {
    const m = String(n || '').match(MATRICULA);
    if (m) return m[1].toLowerCase().replace(/-+$/, '');
  }
  return null;
}

async function fetchInsights() {
  const u = new URL(`${API}/act_${ACCOUNT}/insights`);
  u.searchParams.set('access_token', TOKEN);
  u.searchParams.set('level', 'ad');
  u.searchParams.set('date_preset', PRESET);
  u.searchParams.set('limit', '500');
  u.searchParams.set('fields', 'adset_name,ad_name,spend,impressions,clicks,reach,ctr,frequency');
  const r = await fetch(u.toString());
  const d = await r.json();
  if (d.error) throw new Error(`Meta API ${d.error.code}: ${d.error.message}`);
  return d.data || [];
}

function agruparPorSrc(rows) {
  const g = {};
  for (const r of rows) {
    const src = extraerSrc(r.adset_name, r.ad_name);
    if (!src) continue;
    const a = (g[src] = g[src] || { src, spend: 0, impressions: 0, clicks: 0, reach: 0 });
    a.spend += parseFloat(r.spend || 0);
    a.impressions += parseInt(r.impressions || 0);
    a.clicks += parseInt(r.clicks || 0);
    a.reach += parseInt(r.reach || 0);
  }
  return Object.values(g).map(a => ({
    src: a.src,
    gasto_usd: +a.spend.toFixed(2),
    impresiones: a.impressions,
    clics: a.clicks,
    ctr: a.impressions > 0 ? +(a.clicks / a.impressions * 100).toFixed(2) : null,
    frecuencia: a.reach > 0 ? +(a.impressions / a.reach).toFixed(2) : null,
  }));
}

async function patchCampana(src, campos) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/campanas?src=eq.${encodeURIComponent(src)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(campos),
  });
  const rows = await r.json().catch(() => []);
  if (!r.ok) { console.error(`[meta-spend] ${src} PATCH ${r.status} ${JSON.stringify(rows)}`); return 0; }
  return Array.isArray(rows) ? rows.length : 0;
}

// Gasto de Meta a NIVEL CUENTA por mes calendario (TODAS las campañas) → gastos_meta_mensual.
// Es lo que consume el P&L (línea "Meta Ads"): a diferencia de campanas (solo ads registrados
// y gasto lifetime), esto captura toda la cuenta y por mes real. time_increment=monthly da una
// fila por mes; re-correr actualiza el mes en curso (parcial). Best-effort.
async function fetchGastoMensual() {
  const u = new URL(`${API}/act_${ACCOUNT}/insights`);
  u.searchParams.set('access_token', TOKEN);
  u.searchParams.set('level', 'account');
  u.searchParams.set('fields', 'spend');
  u.searchParams.set('time_increment', 'monthly');
  u.searchParams.set('date_preset', 'maximum');
  u.searchParams.set('limit', '60');
  const r = await fetch(u.toString());
  const d = await r.json();
  if (d.error) throw new Error(`Meta API ${d.error.code}: ${d.error.message}`);
  // date_start puede no caer en día 1 (arranque de cuenta) → normalizo a primer día del mes.
  return (d.data || [])
    .map(x => ({ mes: `${String(x.date_start).slice(0, 7)}-01`, spend_usd: +parseFloat(x.spend || 0).toFixed(2) }))
    .filter(x => x.spend_usd > 0);
}

async function upsertGastoMensual(filas) {
  if (!filas.length) return 0;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/gastos_meta_mensual?on_conflict=mes`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(filas.map(f => ({ ...f, updated_at: new Date().toISOString() }))),
  });
  if (!r.ok) { console.error(`[meta-spend] gastos_meta_mensual upsert ${r.status} ${await r.text().catch(() => '')}`); return 0; }
  return filas.length;
}

// Devuelve un resumen (no lanza: best-effort). El cron lo loguea.
async function runMetaSpendSync() {
  if (!TOKEN || !ACCOUNT) return { skipped: 'faltan META_ACCESS_TOKEN / META_AD_ACCOUNT_ID' };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { skipped: 'falta Supabase' };

  const grupos = agruparPorSrc(await fetchInsights());
  const hoy = new Date().toISOString().slice(0, 10);
  let actualizadas = 0;
  const sinFicha = [];

  for (const g of grupos) {
    const n = await patchCampana(g.src, {
      gasto_usd: g.gasto_usd, impresiones: g.impresiones, clics: g.clics,
      ctr: g.ctr, frecuencia: g.frecuencia, ultimo_chequeo_en: hoy,
    });
    if (n > 0) actualizadas++; else sinFicha.push(g.src);
  }

  // Gasto mensual a nivel cuenta (para el P&L). No pisa lo de campanas (que sigue para CPA/ROAS).
  let mesesMensual = 0;
  try { mesesMensual = await upsertGastoMensual(await fetchGastoMensual()); }
  catch (e) { console.error('[meta-spend] mensual:', e.message); }

  return { anuncios: grupos.length, actualizadas, sin_ficha: sinFicha, meses_mensual: mesesMensual };
}

module.exports = { runMetaSpendSync };
