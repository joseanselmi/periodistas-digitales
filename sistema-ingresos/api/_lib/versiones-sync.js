// versiones-sync.js — actualiza las métricas de la VERSIÓN ACTIVA del checkout y de la landing.
// Corre a diario colgado del cron de recuperación (Hobby permite 2 crons y ya están usados).
//   - Checkout: mide la ventana [vigente_desde, ahora] contra la Sales History API de Hotmart
//     (curso solo, sin order bumps): llegaron/pagaron/abandonaron/completion/abandonos USD y PayPal.
//   - Landing: lo hace la función SQL sync_landing_versiones() (cuenta sesiones/clicks de events).
// SOLO LEE Hotmart/events y ESCRIBE en checkout_versiones / landing_versiones. No toca nada más.
// Env: HOTMART_BASIC, HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const OAUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history';
const SB_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SB_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const BASIC = process.env.HOTMART_BASIC, CID = process.env.HOTMART_CLIENT_ID, SEC = process.env.HOTMART_CLIENT_SECRET;

const PAID = ['APPROVED', 'COMPLETE'];
const ABANDON = ['CANCELLED', 'EXPIRED', 'OVERDUE', 'NO_FUNDS', 'BLOCKED'];

function sbHeaders(extra) { return { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...extra }; }
async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  if (!r.ok) throw new Error(`sbGet ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
async function sbPatch(table, id, fields) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(fields),
  });
  if (!r.ok) throw new Error(`sbPatch ${table} ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
async function sbRpc(fn) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: sbHeaders(), body: '{}' });
  if (!r.ok) throw new Error(`rpc ${fn} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function hmToken() {
  const r = await fetch(`${OAUTH_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(CID)}&client_secret=${encodeURIComponent(SEC)}`,
    { method: 'POST', headers: { Authorization: `Basic ${BASIC}`, 'Content-Type': 'application/json' } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Hotmart auth ${r.status}`);
  return d.access_token;
}
async function hmPull(token, status, startMs, endMs) {
  let pt = null, pages = 0, rows = [];
  do {
    const u = new URL(SALES_URL);
    u.searchParams.set('max_results', '100');
    u.searchParams.set('start_date', String(startMs));
    if (endMs) u.searchParams.set('end_date', String(endMs));
    u.searchParams.set('transaction_status', status);
    if (pt) u.searchParams.set('page_token', pt);
    const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) break;
    for (const it of (d.items || [])) {
      const prod = (it.product && it.product.name) || '';
      if (/Sistema de ingresos/i.test(prod)) rows.push(it.purchase || {});
    }
    pt = d.page_info && d.page_info.next_page_token; pages++;
  } while (pt && pages < 30);
  return rows;
}

async function runVersionesSync({ dry = false } = {}) {
  const out = { checkout: null, landing: null };

  // ── CHECKOUT: versión activa (vigente_hasta null) ──
  const cvs = await sbGet('checkout_versiones?activa=is.true&select=*&order=vigente_desde.desc&limit=1');
  const cv = cvs[0];
  if (cv) {
    const token = await hmToken();
    const startMs = Date.parse(cv.vigente_desde);
    const endMs = Date.now();
    const paid = [], aband = [];
    for (const s of PAID) paid.push(...await hmPull(token, s, startMs, endMs));
    for (const s of ABANDON) aband.push(...await hmPull(token, s, startMs, endMs));
    const llegaron = paid.length + aband.length;
    const completion = llegaron ? +(100 * paid.length / llegaron).toFixed(2) : 0;
    const usd = aband.filter(p => p.price && p.price.currency_code === 'USD').length;
    const usdPct = aband.length ? +(100 * usd / aband.length).toFixed(2) : 0;
    const paypal = aband.filter(p => p.payment && p.payment.type === 'PAYPAL').length;
    const dias = Math.max(1, (endMs - startMs) / 86400000);
    const ventasSem = +(paid.length / dias * 7).toFixed(2);
    const fields = {
      llegaron, pagaron: paid.length, abandonaron: aband.length, completion,
      abandonos_usd: usd, abandonos_usd_pct: usdPct, abandonos_paypal: paypal,
      ventas_por_semana: ventasSem,
      medido_desde: cv.vigente_desde.slice(0, 10),
      medido_hasta: new Date().toISOString().slice(0, 10),
    };
    if (!dry) await sbPatch('checkout_versiones', cv.id, fields);
    out.checkout = { version: cv.version, ...fields };
  }

  // ── LANDING: versión activa (todo en SQL) ──
  if (!dry) {
    const res = await sbRpc('sync_landing_versiones');
    out.landing = (res && res[0]) || null;
  } else {
    const lvs = await sbGet('landing_versiones?activa=is.true&select=version&limit=1');
    out.landing = { version: (lvs[0] && lvs[0].version) || null, dry: true };
  }

  return out;
}

module.exports = { runVersionesSync };
