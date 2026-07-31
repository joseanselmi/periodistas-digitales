// Sync de Hotmart → Supabase, para correr desde el cron (api/recuperacion.js lo llama
// al inicio de su corrida diaria). Equivalente serverless de ads-agent/scripts/datos/hotmart-sync.mjs
// (la versión CLI). Detalle en ads-agent/docs/ARQUITECTURA-DATOS.md.
//
// Hace dos cosas, best-effort (si algo falla, loguea y sigue — nunca tumba la recuperación):
//   1. RECONCILIA VENTAS: trae TODOS los productos de la cuenta (curso + upsells + lo que
//      venda el cross-sell/recomendador de Hotmart, que quizá ni pasa por el webhook),
//      inserta en `ventas` las que falten (enriquecidas con USD + datos del comprador), y
//      completa las filas del webhook que aún no tengan USD.
//   2. CAPTURA RECHAZOS: los pagos rechazados recientes → `clientes_potenciales` como
//      `pago_rechazado` (con teléfono, para que la recuperación pueda escribirles).
//
// Env: HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET, HOTMART_BASIC, SUPABASE_URL,
//      SUPABASE_SERVICE_ROLE_KEY. Opcionales: HOTMART_EXCLUDE_EMAILS (default el mail de
//      Jose), HOTMART_ONLY_PRODUCTS (lista de ids; vacío = todos), HOTMART_RECHAZO_DIAS (3).

const OAUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history';
const USERS_URL = 'https://developers.hotmart.com/payments/api/v1/sales/users';
const COMM_URL  = 'https://developers.hotmart.com/payments/api/v1/sales/commissions';

const SALE_STATUSES    = ['APPROVED', 'COMPLETE'];
const RECHAZO_STATUSES = ['NO_FUNDS', 'BLOCKED', 'CANCELLED', 'EXPIRED', 'OVERDUE'];

const SUPABASE_URL  = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_KEY  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const CLIENT_ID     = (process.env.HOTMART_CLIENT_ID || '').trim();
const CLIENT_SECRET = (process.env.HOTMART_CLIENT_SECRET || '').trim();
const BASIC         = (process.env.HOTMART_BASIC || '').trim();
const EXCLUDE_EMAILS = (process.env.HOTMART_EXCLUDE_EMAILS || 'joseanselmi27@gmail.com')
  .toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const ONLY_PRODUCTS = (process.env.HOTMART_ONLY_PRODUCTS || '')
  .split(',').map(s => s.trim()).filter(Boolean);
const RECHAZO_DIAS  = Math.max(1, Number(process.env.HOTMART_RECHAZO_DIAS) || 3);

const pick = (...v) => { for (const x of v) if (x != null && x !== '') return x; return undefined; };
const toIso = v => { if (v == null || v === '') return undefined; const n = Number(v); const d = Number.isFinite(n) ? new Date(n > 1e12 ? n : n * 1000) : new Date(v); return isNaN(d.getTime()) ? undefined : d.toISOString(); };
const onlyDigits = (...p) => { const d = p.map(x => x == null ? '' : String(x)).join('').replace(/\D/g, ''); return d || undefined; };
const isExcluded = email => EXCLUDE_EMAILS.includes(String(email || '').toLowerCase());
const productoOk = id => ONLY_PRODUCTS.length === 0 || ONLY_PRODUCTS.includes(String(id));

async function getToken() {
  const url = `${OAUTH_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`;
  const r = await fetch(url, { method: 'POST', headers: { Authorization: `Basic ${BASIC}`, 'Content-Type': 'application/json' } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Hotmart auth ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
  return d.access_token;
}

async function hmList(url, token, { status = null } = {}) {
  const items = [];
  let page = null;
  do {
    const u = new URL(url);
    u.searchParams.set('max_results', '100');
    if (status) u.searchParams.set('transaction_status', status);
    if (page) u.searchParams.set('page_token', page);
    const r = await fetch(u.toString(), { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`Hotmart ${url} ${r.status}: ${JSON.stringify(d).slice(0, 200)}`);
    for (const it of (d.items || [])) items.push(it);
    page = d.page_info && d.page_info.next_page_token;
  } while (page);
  return items;
}

// Datos del comprador (rol BUYER): teléfono, país, ciudad, provincia, CP, documento.
async function enrichBuyer(token, tx) {
  try {
    const r = await fetch(`${USERS_URL}?transaction=${encodeURIComponent(tx)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return {};
    const d = await r.json();
    const b = ((d.items?.[0]?.users) || []).find(x => String(x.role).toUpperCase() === 'BUYER')?.user || {};
    const a = b.address || {};
    return {
      telefono: onlyDigits(pick(b.cellphone, b.phone)),
      pais: pick(a.country), ciudad: pick(a.city), provincia: pick(a.state),
      codigo_postal: pick(a.zip_code), documento: pick(b.documents?.[0]?.value),
    };
  } catch { return {}; }
}

// USD: comisión neta del productor + bruto (local × exchange_rate_currency_payout).
async function enrichUsd(token, tx, valorLocal) {
  try {
    const r = await fetch(`${COMM_URL}?transaction=${encodeURIComponent(tx)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return {};
    const it = (await r.json()).items?.[0] || {};
    const prod = (it.commissions || []).find(x => String(x.source).toUpperCase() === 'PRODUCER')?.commission;
    const out = {};
    if (prod && prod.currency_code === 'USD') out.comision_usd = prod.value;
    if (it.exchange_rate_currency_payout && valorLocal != null) out.valor_usd = Math.round(Number(valorLocal) * Number(it.exchange_rate_currency_payout) * 100) / 100;
    return out;
  } catch { return {}; }
}

function baseFields(item) {
  const p = item.purchase || {}, b = item.buyer || {}, pr = item.product || {}, pc = p.price || {}, t = p.tracking || {};
  return {
    tx: pick(p.transaction, item.transaction),
    email: String(b.email || '').toLowerCase().trim() || undefined,
    nombre: pick(b.name, b.first_name && `${b.first_name} ${b.last_name || ''}`.trim()),
    producto: pick(pr.name), producto_id: pick(pr.id),
    valor: pick(pc.value, p.full_price && p.full_price.value),
    moneda: pick(pc.currency_value, pc.currency_code, 'USD'),
    src: pick(t.source, t.src),
    utm_source: pick(t.utm_source), utm_medium: pick(t.utm_medium), utm_campaign: pick(t.utm_campaign),
    status: String(p.status || '').toUpperCase(),
    ocurrido: toIso(pick(p.approved_date, p.order_date, p.date)),
  };
}

function clean(o) { Object.keys(o).forEach(k => (o[k] === undefined || o[k] === '') && delete o[k]); return o; }

function sbHeaders(extra) { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...extra }; }
async function sbSelect(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  if (!r.ok) throw new Error(`Supabase select ${path} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function sbInsert(table, rows) {
  if (!rows.length) return 0;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=dedup_key`, {
    method: 'POST', headers: sbHeaders({ Prefer: 'resolution=ignore-duplicates,return=minimal' }), body: JSON.stringify(rows),
  });
  if (!r.ok) throw new Error(`Supabase insert ${table} ${r.status}: ${await r.text()}`);
  return rows.length;
}
async function sbPatch(table, dedupKey, fields) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?dedup_key=eq.${encodeURIComponent(dedupKey)}`, {
    method: 'PATCH', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(fields),
  });
  return r.ok;
}

async function runHotmartSync() {
  if (!CLIENT_ID || !CLIENT_SECRET || !BASIC || !SUPABASE_KEY) return { skipped: 'faltan credenciales de Hotmart/Supabase' };
  const token = await getToken();
  const out = { ventas_nuevas: 0, ventas_enriquecidas: 0, rechazos_nuevos: 0 };

  // ── 1) VENTAS ──
  const raw = await hmList(SALES_URL, token);
  const sales = raw.filter(it => SALE_STATUSES.includes(String((it.purchase || {}).status || '').toUpperCase()));
  const existingV = new Set((await sbSelect('ventas?select=transaction_id&limit=100000')).map(r => r.transaction_id).filter(Boolean));

  for (const it of sales) {
    const f = baseFields(it);
    if (!f.tx || isExcluded(f.email) || !productoOk(f.producto_id) || existingV.has(f.tx)) continue;
    const [buyer, usd] = await Promise.all([enrichBuyer(token, f.tx), enrichUsd(token, f.tx, f.valor)]);
    const rec = clean({
      email: f.email, nombre: f.nombre, producto: f.producto, producto_id: f.producto_id,
      valor: f.valor, moneda: f.moneda, ...usd, ...buyer,
      evento_hotmart: `API_SYNC:${f.status || 'SALE'}`, transaction_id: f.tx,
      src: f.src, utm_source: f.utm_source, utm_medium: f.utm_medium, utm_campaign: f.utm_campaign,
      ocurrido_en: f.ocurrido, dedup_key: `hotmart:${f.tx}`,
    });
    try { out.ventas_nuevas += await sbInsert('ventas', [rec]); } catch (e) { console.error('sync venta', f.tx, e.message); }
  }

  // Completar filas del webhook que aún no tengan USD.
  try {
    const pend = await sbSelect('ventas?select=transaction_id,dedup_key,valor&valor_usd=is.null&limit=100000');
    for (const row of pend) {
      if (!row.transaction_id) continue;
      const [buyer, usd] = await Promise.all([enrichBuyer(token, row.transaction_id), enrichUsd(token, row.transaction_id, row.valor)]);
      const extra = clean({ ...usd, ...buyer });
      if (Object.keys(extra).length && await sbPatch('ventas', row.dedup_key, extra)) out.ventas_enriquecidas++;
    }
  } catch (e) { console.error('sync enrich', e.message); }

  // ── 2) RECHAZOS → clientes_potenciales ──
  try {
    const startMs = Date.now() - RECHAZO_DIAS * 86400000;
    const byTx = new Map();
    for (const status of RECHAZO_STATUSES) {
      let items = [];
      try {
        const u = new URL(SALES_URL);
        u.searchParams.set('max_results', '100'); u.searchParams.set('transaction_status', status); u.searchParams.set('start_date', String(startMs));
        const r = await fetch(u.toString(), { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) items = (await r.json()).items || [];
      } catch { /* saltea ese estado */ }
      for (const it of items) { const tx = pick((it.purchase || {}).transaction, it.transaction); if (tx) byTx.set(String(tx), it); }
    }
    // Dedup por PERSONA, no por transacción: un rechazo por email = UN contacto de
    // recuperación (evita spamear a quien reintentó 9 veces, como pasó con Nelson).
    // Nos quedamos con el intento más reciente por email; saltamos a quien ya está en
    // clientes_potenciales o ya compró (está en `ventas`). dedup_key = `rechazo:<email>`.
    const existingEmails = new Set((await sbSelect('clientes_potenciales?select=email&limit=100000')).map(r => String(r.email || '').toLowerCase()).filter(Boolean));
    const ventasEmails   = new Set((await sbSelect('ventas?select=email&limit=100000')).map(r => String(r.email || '').toLowerCase()).filter(Boolean));
    const latestByEmail = new Map();
    for (const it of byTx.values()) {
      const f = baseFields(it);
      if (!f.tx || !f.email || isExcluded(f.email)) continue;
      const prev = latestByEmail.get(f.email);
      if (!prev || new Date(f.ocurrido || 0) > new Date(prev.ocurrido || 0)) latestByEmail.set(f.email, f);
    }
    const toInsert = [];
    for (const [email, f] of latestByEmail) {
      if (existingEmails.has(email) || ventasEmails.has(email)) continue;
      const buyer = await enrichBuyer(token, f.tx); // teléfono para poder recuperarlo
      toInsert.push(clean({
        tipo: 'pago_rechazado', email: f.email, nombre: f.nombre, telefono: buyer.telefono,
        producto: f.producto, valor: f.valor, moneda: f.moneda,
        evento_hotmart: `API_SYNC:${f.status || 'RECHAZO'}`, motivo_rechazo: f.status,
        transaction_id: f.tx, src: f.src, ocurrido_en: f.ocurrido, dedup_key: `rechazo:${email}`,
      }));
    }
    out.rechazos_nuevos = await sbInsert('clientes_potenciales', toInsert);
  } catch (e) { console.error('sync rechazos', e.message); }

  return out;
}

module.exports = { runHotmartSync };
