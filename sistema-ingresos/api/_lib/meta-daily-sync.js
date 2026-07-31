// Sync de métricas de Meta Ads POR DÍA y por anuncio → tabla `meta_insights_diario`
// (Supabase periodistas-marketing). Equivalente serverless de ads-agent/scripts/datos/meta-daily-sync.mjs.
// Lo llama api/recuperacion.js en su corrida diaria, junto a runMetaSpendSync.
// Detalle en ads-agent/docs/ARQUITECTURA-DATOS.md y ads-agent/docs/AGENTES-AUTONOMOS.md.
//
// PARA QUÉ: la rutina autónoma de Mateo (nube, sin egress) no puede pegarle a Meta; lee las
// métricas por día de esta tabla. Es el complemento "por día" de meta-spend-sync (acumulado).
// TIMEZONE: Meta reporta en el timezone de la cuenta (ARG) → `fecha` = día argentino.
// MÉTRICAS (las que pidió Jose): gasto, CTR de enlace (link_clicks/impresiones), pagos
// iniciados (initiate checkout), ventas (purchase). Guarda crudos para calcular % en el reporte.
// Best-effort: si algo falla, loguea y sigue — nunca tumba la recuperación.
//
// Env: META_ACCESS_TOKEN (ads_read), META_AD_ACCOUNT_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Opcional: META_DAILY_PRESET (default last_14d).

const API = 'https://graph.facebook.com/v21.0';
const TOKEN   = (process.env.META_ACCESS_TOKEN || '').trim();
const ACCOUNT = (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^act_/, '');
const PRESET  = (process.env.META_DAILY_PRESET || 'last_14d').trim();
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const MATRICULA = /(ad\d+-[a-z0-9-]+?)(?=\s|·|$)/i;
function extraerSrc(...nombres) {
  for (const n of nombres) {
    const m = String(n || '').match(MATRICULA);
    if (m) return m[1].toLowerCase().replace(/-+$/, '');
  }
  return null;
}

function sumAction(actions, ...types) {
  let s = 0;
  for (const t of types) {
    const a = (actions || []).find(x => x.action_type === t);
    if (a) s += Number(a.value || 0);
  }
  return s;
}

async function fetchDaily() {
  const rows = [];
  const u = new URL(`${API}/act_${ACCOUNT}/insights`);
  u.searchParams.set('access_token', TOKEN);
  u.searchParams.set('level', 'ad');
  u.searchParams.set('time_increment', '1');
  u.searchParams.set('date_preset', PRESET);
  u.searchParams.set('limit', '500');
  u.searchParams.set('fields', 'adset_name,ad_name,spend,impressions,inline_link_clicks,actions,date_start');
  let next = u.toString();
  while (next) {
    const r = await fetch(next);
    const d = await r.json();
    if (d.error) throw new Error(`Meta API ${d.error.code}: ${d.error.message}`);
    rows.push(...(d.data || []));
    next = d.paging && d.paging.next ? d.paging.next : null;
  }
  return rows;
}

function agrupar(rows) {
  const g = {};
  for (const r of rows) {
    const src = extraerSrc(r.adset_name, r.ad_name);
    if (!src) continue;
    const k = `${r.date_start}|${src}`;
    const a = (g[k] = g[k] || {
      fecha: r.date_start, src, spend_usd: 0, impresiones: 0, link_clicks: 0,
      landing_views: 0, pagos_iniciados: 0, compras: 0,
    });
    a.spend_usd += parseFloat(r.spend || 0);
    a.impresiones += parseInt(r.impressions || 0);
    a.link_clicks += parseInt(r.inline_link_clicks || 0);
    a.landing_views += sumAction(r.actions, 'landing_page_view');
    a.pagos_iniciados += sumAction(r.actions, 'offsite_conversion.fb_pixel_initiate_checkout', 'initiate_checkout');
    a.compras += sumAction(r.actions, 'offsite_conversion.fb_pixel_purchase', 'purchase', 'onsite_web_purchase');
  }
  return Object.values(g).map(a => ({ ...a, spend_usd: +a.spend_usd.toFixed(2) }));
}

async function upsert(filas) {
  if (!filas.length) return 0;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/meta_insights_diario?on_conflict=fecha,src`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(filas.map(f => ({ ...f, actualizado_en: new Date().toISOString() }))),
  });
  if (!r.ok) { console.error(`[meta-daily] upsert ${r.status} ${await r.text().catch(() => '')}`); return 0; }
  return filas.length;
}

// Best-effort (no lanza fuera de fetch/parse; el cron loguea el resumen).
async function runMetaDailySync() {
  if (!TOKEN || !ACCOUNT) return { skipped: 'faltan META_ACCESS_TOKEN / META_AD_ACCOUNT_ID' };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { skipped: 'falta Supabase' };
  const filas = agrupar(await fetchDaily());
  const n = await upsert(filas);
  return { filas: filas.length, upsert: n };
}

module.exports = { runMetaDailySync };
