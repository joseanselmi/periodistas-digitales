/**
 * hotmart-sync.mjs — Sincroniza las ventas del curso desde la API de Hotmart
 * hacia la tabla `ventas` (Supabase periodistas-marketing).
 *
 * PARA QUÉ:
 *  1. Backfill: trae TODAS las ventas históricas (incluidas las que ocurrieron
 *     antes de que el webhook guardara en `ventas`).
 *  2. Reconciliación: cada vez que corre, compara lo que hay en Hotmart contra
 *     lo que hay en la tabla e inserta SOLO las que faltan. No pisa las filas que
 *     ya cargó el webhook, y NO re-dispara Meta ni el bono de Leadr (solo lee de
 *     Hotmart y escribe en la base). Ideal para un cron diario que garantice que
 *     no se escape ninguna venta aunque el webhook falle un día.
 *
 * CÓMO OBTENER LAS CREDENCIALES DE HOTMART (las genera Jose una sola vez):
 *   Hotmart → Herramientas → "Credenciales para API" (o "API e Integraciones").
 *   Crear una credencial y copiar los 3 valores: Client ID, Client Secret y el
 *   token "Basic" que Hotmart muestra ya armado. Pegarlos en ads-agent/.env.local:
 *     HOTMART_CLIENT_ID=...
 *     HOTMART_CLIENT_SECRET=...
 *     HOTMART_BASIC=...            (el string que va después de "Basic " )
 *   (Opcional) HOTMART_PRODUCT_ID=7966973   ← el curso; ya viene por default.
 *   Y las de la base (mismas que usa el webhook en Vercel):
 *     SUPABASE_URL=https://wxyimqkjlwfncvzozpjy.supabase.co
 *     SUPABASE_SERVICE_ROLE_KEY=...   (service_role; escribe saltando RLS)
 *
 * USO:
 *   node hotmart-sync.mjs                 → trae todo el histórico y carga las que falten
 *   node hotmart-sync.mjs --dry-run       → solo reporta, no escribe nada
 *   node hotmart-sync.mjs --since 2026-06-01   → solo desde esa fecha
 *
 * NOTA: construido contra la API pública de Hotmart (Payments/Sales History v1).
 * Si algún endpoint/campo cambió, se ajusta acá — la primera corrida con
 * credenciales reales confirma el mapeo (igual guardamos el JSON crudo en `payload`).
 */

import 'dotenv/config'

// ─── Config ─────────────────────────────────────────────────────────────────
const CLIENT_ID     = (process.env.HOTMART_CLIENT_ID || '').trim()
const CLIENT_SECRET = (process.env.HOTMART_CLIENT_SECRET || '').trim()
const BASIC         = (process.env.HOTMART_BASIC || '').trim()
const PRODUCT_ID    = (process.env.HOTMART_PRODUCT_ID || '7966973').trim()

const SUPABASE_URL  = (process.env.SUPABASE_URL || 'https://wxyimqkjlwfncvzozpjy.supabase.co').trim().replace(/\/$/, '')
const SUPABASE_KEY  = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

// Endpoints de Hotmart (Payments API v1).
const OAUTH_URL     = 'https://api-sec-vlc.hotmart.com/security/oauth/token'
const SALES_URL     = 'https://developers.hotmart.com/payments/api/v1/sales/history'

// Solo estas cuentan como venta concretada (mismo criterio que el webhook:
// reembolsos/chargebacks NO son ventas vigentes → no entran a `ventas`).
const SALE_STATUSES = ['APPROVED', 'COMPLETE']

// ─── Flags ───────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const sinceIdx = args.indexOf('--since')
const SINCE = sinceIdx !== -1 ? args[sinceIdx + 1] : null

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pick(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return undefined
}
function toIso(v) {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  const d = Number.isFinite(n) ? new Date(n > 1e12 ? n : n * 1000) : new Date(v)
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}
function onlyDigits(...parts) {
  const d = parts.map(p => (p == null ? '' : String(p))).join('').replace(/\D/g, '')
  return d || undefined
}
function die(msg) { console.error(`\n❌ ${msg}\n`); process.exit(1) }

// ─── 1) Autenticación OAuth (client_credentials) ──────────────────────────────
async function getAccessToken() {
  const url = `${OAUTH_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(CLIENT_ID)}&client_secret=${encodeURIComponent(CLIENT_SECRET)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${BASIC}`, 'Content-Type': 'application/json' },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    die(`No pude autenticar contra Hotmart (HTTP ${res.status}). Respuesta: ${JSON.stringify(data)}\n   → Revisá HOTMART_CLIENT_ID / HOTMART_CLIENT_SECRET / HOTMART_BASIC en .env.local`)
  }
  return data.access_token
}

// ─── 2) Traer todas las ventas (paginado) ─────────────────────────────────────
async function fetchAllSales(token) {
  const items = []
  let pageToken = null
  do {
    const url = new URL(SALES_URL)
    url.searchParams.set('product_id', PRODUCT_ID)
    url.searchParams.set('max_results', '100')
    if (SINCE) url.searchParams.set('start_date', String(new Date(SINCE).getTime()))
    if (pageToken) url.searchParams.set('page_token', pageToken)

    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) die(`Error trayendo ventas (HTTP ${res.status}): ${JSON.stringify(data)}`)

    for (const it of (data.items || [])) items.push(it)
    pageToken = data.page_info && data.page_info.next_page_token
  } while (pageToken)
  return items
}

// ─── 3) Mapear un item de Hotmart → fila de `ventas` ──────────────────────────
function mapToVenta(item) {
  const purchase = item.purchase || {}
  const buyer    = item.buyer || {}
  const product  = item.product || {}
  const price    = purchase.price || {}
  const tracking = purchase.tracking || {}
  const status   = String(purchase.status || '').toUpperCase()
  const transaction = pick(purchase.transaction, item.transaction)

  // Afiliado: si alguna comisión tiene source AFFILIATE.
  const commissions = purchase.commissions || item.commissions || []
  const esAfiliado = Array.isArray(commissions)
    ? commissions.some(c => String(c.source || '').toUpperCase() === 'AFFILIATE') || undefined
    : undefined

  const record = {
    email: String(buyer.email || '').toLowerCase().trim() || undefined,
    nombre: pick(buyer.name, buyer.first_name && `${buyer.first_name} ${buyer.last_name || ''}`.trim()),
    telefono: onlyDigits(buyer.phone_local_code, pick(buyer.checkout_phone, buyer.phone)),
    producto: pick(product.name, 'Sistema de Ingresos Diarios para Periodistas'),
    valor: pick(price.value, purchase.full_price && purchase.full_price.value),
    moneda: pick(price.currency_value, price.currency_code, 'USD'),
    evento_hotmart: `API_SYNC:${status || 'SALE'}`,   // marca que la fila vino del sync, no del webhook live
    transaction_id: transaction,
    src: pick(tracking.source, tracking.src),
    utm_source: pick(tracking.utm_source),
    utm_medium: pick(tracking.utm_medium),
    utm_campaign: pick(tracking.utm_campaign),
    pais: pick(buyer.address && (buyer.address.country_iso || buyer.address.country), purchase.checkout_country && purchase.checkout_country.iso),
    es_afiliado: typeof esAfiliado === 'boolean' ? esAfiliado : undefined,
    ocurrido_en: toIso(pick(purchase.approved_date, purchase.order_date, purchase.date)),
    dedup_key: transaction ? `hotmart:${transaction}` : undefined,
    payload: item,
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])
  return record
}

// ─── 4) Leer transaction_ids ya presentes en la tabla ─────────────────────────
async function fetchExistingTx() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=transaction_id&limit=100000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) die(`No pude leer la tabla ventas (HTTP ${res.status}): ${await res.text()}`)
  const rows = await res.json()
  return new Set(rows.map(r => r.transaction_id).filter(Boolean))
}

// ─── 5) Insertar las que faltan ───────────────────────────────────────────────
async function insertVentas(records) {
  if (!records.length) return 0
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?on_conflict=dedup_key`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      // ignore-duplicates: si dos corridas se pisan, no rompe ni duplica.
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(records),
  })
  if (!res.ok) die(`Error insertando ventas (HTTP ${res.status}): ${await res.text()}`)
  return records.length
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('\n🔄 HOTMART SYNC → tabla ventas')
if (DRY_RUN) console.log('   (modo --dry-run: no se escribe nada)')

if (!CLIENT_ID || !CLIENT_SECRET || !BASIC)
  die('Faltan credenciales de Hotmart. Cargá HOTMART_CLIENT_ID, HOTMART_CLIENT_SECRET y HOTMART_BASIC en ads-agent/.env.local (ver instrucciones arriba en este archivo).')
if (!SUPABASE_KEY)
  die('Falta SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (la service_role de periodistas-marketing).')

const token = await getAccessToken()
console.log('   ✅ Autenticado con Hotmart')

const raw = await fetchAllSales(token)
console.log(`   📥 Hotmart devolvió ${raw.length} transacciones${SINCE ? ` (desde ${SINCE})` : ''}`)

// Solo ventas concretadas.
const sales = raw.filter(it => SALE_STATUSES.includes(String((it.purchase || {}).status || '').toUpperCase()))
console.log(`   🧾 De esas, ${sales.length} son ventas (${SALE_STATUSES.join('/')})`)

const existing = await fetchExistingTx()
const records = sales.map(mapToVenta).filter(r => r.transaction_id)
const missing = records.filter(r => !existing.has(r.transaction_id))

console.log(`   📊 Ya en la tabla: ${sales.length - missing.length} · Faltan: ${missing.length}`)

if (missing.length && !DRY_RUN) {
  const n = await insertVentas(missing)
  console.log(`   ✅ Insertadas ${n} ventas nuevas en la tabla`)
} else if (missing.length) {
  console.log('   (dry-run) Se insertarían:')
  missing.slice(0, 20).forEach(r => console.log(`      · ${r.ocurrido_en?.slice(0,10)} | ${r.email} | ${r.moneda} ${r.valor} | src=${r.src || '—'} | ${r.transaction_id}`))
} else {
  console.log('   ✅ Nada que hacer: la tabla ya está al día con Hotmart.')
}

console.log('─'.repeat(60))
