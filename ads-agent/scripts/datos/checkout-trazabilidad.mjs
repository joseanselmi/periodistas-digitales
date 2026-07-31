/**
 * checkout-trazabilidad.mjs — mide el embudo de checkout del CURSO desde la API de Hotmart,
 * para un rango de fechas. Sirve para comparar ANTES vs DESPUÉS de un cambio (ej. PayPal OFF 17/07).
 *
 *   node --env-file=.env.local scripts/datos/checkout-trazabilidad.mjs --desde=2026-06-29 --hasta=2026-07-17
 *   node --env-file=.env.local scripts/datos/checkout-trazabilidad.mjs --desde=2026-07-17            # hasta hoy
 *
 * Es SOLO LECTURA (no escribe nada). Cuenta, curso solo (sin order bumps):
 *   - cuántas transacciones llegaron al checkout, cuántas pagaron, cuántas abandonaron
 *   - completion % (pagaron / llegaron)
 *   - desglose por método de pago y moneda, separando PAGARON vs ABANDONARON
 * Así se ve, después de apagar PayPal, si bajan los abandonos en USD y sube el completion.
 */

const OAUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const SALES_URL = 'https://developers.hotmart.com/payments/api/v1/sales/history';
const BASIC = process.env.HOTMART_BASIC, CID = process.env.HOTMART_CLIENT_ID, SEC = process.env.HOTMART_CLIENT_SECRET;
if (!BASIC || !CID || !SEC) { console.error('❌ Faltan credenciales HOTMART_* en .env.local'); process.exit(1); }

const args = process.argv.slice(2);
const arg = (k, def) => { const a = args.find(x => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : def; };
const DESDE = arg('desde', '2026-06-29');
const HASTA = arg('hasta', null); // null = sin tope (hasta hoy)
const startMs = new Date(DESDE).getTime();
const endMs = HASTA ? new Date(HASTA).getTime() + 86400000 : null; // +1 día para incluir el día "hasta"

const PAID = ['APPROVED', 'COMPLETE'];
const ABANDON = ['CANCELLED', 'EXPIRED', 'OVERDUE', 'NO_FUNDS', 'BLOCKED'];

async function token() {
  const r = await fetch(`${OAUTH_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(CID)}&client_secret=${encodeURIComponent(SEC)}`,
    { method: 'POST', headers: { Authorization: `Basic ${BASIC}`, 'Content-Type': 'application/json' } });
  const d = await r.json(); if (!d.access_token) { console.error('❌ Auth Hotmart falló', JSON.stringify(d)); process.exit(1); }
  return d.access_token;
}
async function pull(tok, status) {
  let pt = null, pages = 0, rows = [];
  do {
    const u = new URL(SALES_URL);
    u.searchParams.set('max_results', '100');
    u.searchParams.set('start_date', String(startMs));
    if (endMs) u.searchParams.set('end_date', String(endMs));
    u.searchParams.set('transaction_status', status);
    if (pt) u.searchParams.set('page_token', pt);
    const r = await fetch(u, { headers: { Authorization: `Bearer ${tok}` } });
    const d = await r.json(); if (!r.ok) break;
    for (const it of (d.items || [])) {
      const prod = (it.product && it.product.name) || '';
      if (/Sistema de ingresos/i.test(prod)) rows.push(it.purchase || {});
    }
    pt = d.page_info && d.page_info.next_page_token; pages++;
  } while (pt && pages < 30);
  return rows;
}
const tally = rows => {
  const t = {};
  for (const p of rows) {
    const m = (p.payment && p.payment.type) || '(sin método)';
    const cur = (p.price && p.price.currency_code) || '?';
    const k = `${m} [${cur}]`; t[k] = (t[k] || 0) + 1;
  }
  return t;
};

const tok = await token();
const paid = [], aband = [];
for (const s of PAID) paid.push(...await pull(tok, s));
for (const s of ABANDON) aband.push(...await pull(tok, s));

const llegaron = paid.length + aband.length;
const completion = llegaron ? (100 * paid.length / llegaron) : 0;
const usdAband = aband.filter(p => (p.price && p.price.currency_code) === 'USD').length;
const paypalAband = aband.filter(p => (p.payment && p.payment.type) === 'PAYPAL').length;

console.log(`\n📈 CHECKOUT CURSO — ${DESDE} → ${HASTA || 'hoy'} (Hotmart, solo curso, sin OB)\n`);
console.log(`   Llegaron al checkout:  ${llegaron}`);
console.log(`   Pagaron:               ${paid.length}`);
console.log(`   Abandonaron:           ${aband.length}`);
console.log(`   Completion:            ${completion.toFixed(1)}%`);
console.log(`   Abandonos en USD:      ${usdAband}  (${aband.length ? (100 * usdAband / aband.length).toFixed(0) : 0}% de los abandonos)`);
console.log(`   Abandonos por PayPal:  ${paypalAband}`);
console.log(`\n   PAGARON — método [moneda]:`); console.table(tally(paid));
console.log(`   ABANDONARON — método [moneda]:`); console.table(tally(aband));
console.log('   (SOLO LECTURA — no escribe nada. Comparar contra el baseline en tabla checkout_cambios.)');
