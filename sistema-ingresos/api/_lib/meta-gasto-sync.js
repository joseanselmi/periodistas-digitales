// Sync del gasto de Meta POR DÍA y por CAMPAÑA → tabla `meta_gasto_diario`
// (Supabase periodistas-marketing). Equivalente serverless de
// ads-agent/scripts/datos/meta-gasto-sync.mjs. Lo llama api/recuperacion.js en su
// corrida diaria, junto a runMetaSpendSync y runMetaDailySync.
//
// POR QUÉ EXISTE (02/08/2026)
//
// Es el tercer sync de Meta, y cubre lo que los otros dos no ven:
//   · meta-spend-sync  → `campanas` + `gastos_meta_mensual`, solo anuncios con ficha
//   · meta-daily-sync  → `meta_insights_diario`, solo los que tienen matrícula adN-angulo
//   · este             → `meta_gasto_diario`, la CUENTA ENTERA, tenga ficha o no
//
// Sin él, el gasto que muestra el panel de campañas de Leadr depende de que alguien
// se acuerde de correr el script a mano. Nadie se acuerda: quedó congelado en la foto
// parcial del 31/07 a las 22:55, y el 02/08 el panel seguía diciendo $0,52 de gasto y
// $0,009 de costo por lead cuando lo real era $1,86 y $0,032. Un número viejo no se ve
// distinto de uno fresco — por eso esto tiene que correr solo.
//
// El script .mjs sigue existiendo para corridas manuales y para el histórico largo
// (`--dias 400`); acá se sincronizan los últimos META_GASTO_DIAS días (default 30),
// que es lo que mira el panel.
//
// Best-effort: si algo falla, loguea y sigue — nunca tumba la recuperación.
//
// Env: META_ACCESS_TOKEN (ads_read), META_AD_ACCOUNT_ID, SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY. Opcional: META_GASTO_DIAS.

const API = 'https://graph.facebook.com/v21.0';
const TOKEN   = (process.env.META_ACCESS_TOKEN || '').trim();
const ACCOUNT = (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^act_/, '');
const DIAS    = Number(process.env.META_GASTO_DIAS || 30);
const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

const dia = (d) => d.toISOString().slice(0, 10);

// El estado REAL de cada campaña. `status` dice lo que configuraste; el que manda es
// `effective_status`, que además mira si el conjunto o la cuenta la frenaron. Leer el
// equivocado hace decir "activo" de algo apagado.
async function estados() {
  const url = `${API}/act_${ACCOUNT}/campaigns?fields=name,effective_status&limit=200&access_token=${TOKEN}`;
  const j = await (await fetch(url)).json();
  if (j.error) throw new Error(`Meta ${j.error.code}: ${j.error.message}`);
  return new Map((j.data || []).map((c) => [c.id, c.effective_status]));
}

async function gastoDiario() {
  const desde = dia(new Date(Date.now() - DIAS * 86400e3));
  const hasta = dia(new Date());
  const filas = [];
  let url = `${API}/act_${ACCOUNT}/insights?level=campaign&time_increment=1`
    + `&time_range=${encodeURIComponent(JSON.stringify({ since: desde, until: hasta }))}`
    + `&fields=campaign_id,campaign_name,spend,impressions,actions&limit=500&access_token=${TOKEN}`;

  while (url) {
    const j = await (await fetch(url)).json();
    if (j.error) throw new Error(`Meta ${j.error.code}: ${j.error.message}`);
    for (const d of (j.data || [])) {
      const clics = (d.actions || []).find((a) => a.action_type === 'link_click');
      filas.push({
        fecha: d.date_start,
        meta_campana_id: d.campaign_id,
        meta_campana: d.campaign_name,
        spend_usd: Number(d.spend || 0),
        impresiones: Number(d.impressions || 0),
        link_clicks: Number((clics && clics.value) || 0),
      });
    }
    url = (j.paging && j.paging.next) || null;
  }
  return filas;
}

async function upsert(filas) {
  let n = 0;
  for (let i = 0; i < filas.length; i += 300) {
    const lote = filas.slice(i, i + 300).map((f) => ({ ...f, actualizado_en: new Date().toISOString() }));
    const r = await fetch(`${SUPABASE_URL}/rest/v1/meta_gasto_diario?on_conflict=fecha,meta_campana_id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(lote),
    });
    if (!r.ok) {
      console.error(`[meta-gasto] upsert ${r.status} ${await r.text().catch(() => '')}`);
      return n;
    }
    n += lote.length;
  }
  return n;
}

async function runMetaGastoSync() {
  if (!TOKEN || !ACCOUNT) return { skipped: 'faltan META_ACCESS_TOKEN / META_AD_ACCOUNT_ID' };
  if (!SUPABASE_URL || !SUPABASE_KEY) return { skipped: 'falta Supabase' };

  const [porId, filas] = await Promise.all([estados(), gastoDiario()]);
  for (const f of filas) f.estado = porId.get(f.meta_campana_id) || null;

  const n = await upsert(filas);
  const total = filas.reduce((s, f) => s + f.spend_usd, 0);
  // Las campañas que Meta ya no lista (borradas) igual dejaron gasto: quedan avisadas
  // en el log, que es donde alguien las puede ver sin tener que salir a buscarlas.
  const huerfanas = [...new Set(filas.filter(f => !porId.has(f.meta_campana_id)).map(f => f.meta_campana))];
  if (huerfanas.length) console.warn(`[meta-gasto] gastaron pero Meta ya no las lista: ${huerfanas.join(', ')}`);

  return { dias: DIAS, filas: filas.length, upsert: n, gasto_usd: +total.toFixed(2), huerfanas: huerfanas.length };
}

module.exports = { runMetaGastoSync };
