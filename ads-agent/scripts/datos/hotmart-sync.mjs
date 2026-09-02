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
 *  3. Captura de RECHAZOS de tarjeta (tarjeta Trello #36): el webhook de Hotmart
 *     NO notifica un rechazo de tarjeta en el momento (no existe evento/status
 *     "declined" en el webhook; el informe "Motivos de rechazo de la tarjeta" es
 *     solo un panel). Pero la Sales History API SÍ los devuelve con estados
 *     NO_FUNDS / BLOCKED / CANCELLED / EXPIRED / OVERDUE. Este script los trae y
 *     los inserta en `clientes_potenciales` como `pago_rechazado` → el motor de
 *     recuperación (sistema-ingresos/api/recuperacion.js) los agarra en su cron
 *     diario y les manda `recup_rechazo_1` solo. Así los rechazos "entran solos"
 *     igual que los carritos abandonados. Solo se capturan los recientes (ventana
 *     configurable) para no reactivar rechazos viejos.
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
 *   node scripts/datos/hotmart-sync.mjs                 → ventas (histórico) + rechazos recientes
 *   node scripts/datos/hotmart-sync.mjs --dry-run       → solo reporta, no escribe nada
 *   node scripts/datos/hotmart-sync.mjs --since 2026-06-01   → ventas: solo desde esa fecha
 *   node scripts/datos/hotmart-sync.mjs --rechazos-dias 7    → rechazos: ventana de captura (default 3)
 *   node scripts/datos/hotmart-sync.mjs --no-rechazos        → salta la captura de rechazos (#36)
 *   node scripts/datos/hotmart-sync.mjs --solo-rechazos      → solo captura rechazos (no toca ventas)
 *
 * NOTA: construido contra la API pública de Hotmart (Payments/Sales History v1).
 * Si algún endpoint/campo cambió, se ajusta acá — la primera corrida con
 * credenciales reales confirma el mapeo (igual guardamos el JSON crudo en `payload`).
 */

import dotenv from 'dotenv'
dotenv.config({ path: new URL('../../.env.local', import.meta.url) })

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
const USERS_URL     = 'https://developers.hotmart.com/payments/api/v1/sales/users'        // datos del comprador (tel, dirección, doc)
const COMM_URL      = 'https://developers.hotmart.com/payments/api/v1/sales/commissions'   // valor en USD (bruto vía exchange + neto del productor)

// Solo estas cuentan como venta concretada (mismo criterio que el webhook:
// reembolsos/chargebacks NO son ventas vigentes → no entran a `ventas`).
const SALE_STATUSES = ['APPROVED', 'COMPLETE']

// Emails a excluir (compras/pruebas del propio productor). No son ventas reales de
// cliente ni gente a recuperar. Configurable con HOTMART_EXCLUDE_EMAILS (coma-separado).
const EXCLUDE_EMAILS = (process.env.HOTMART_EXCLUDE_EMAILS || 'joseanselmi27@gmail.com')
  .toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
const isExcluded = email => EXCLUDE_EMAILS.includes(String(email || '').toLowerCase())

// Opcional: restringir a ciertos productos (lista de ids coma-separada). Vacío = TODOS
// los productos de la cuenta (default — así el cross-sell/recomendador también se cuenta).
const ONLY_PRODUCTS = (process.env.HOTMART_ONLY_PRODUCTS || '')
  .split(',').map(s => s.trim()).filter(Boolean)
const productoOk = id => ONLY_PRODUCTS.length === 0 || ONLY_PRODUCTS.includes(String(id))

// Rechazos recuperables (tarjeta #36). Mismo criterio que classifyPotencial() del
// webhook: intentó pagar y no se concretó. Un rechazo de tarjeta cae en NO_FUNDS
// (sin fondos) o BLOCKED (banco/antifraude); CANCELLED/EXPIRED/OVERDUE cubren pagos
// no concretados por otras vías. NO se incluyen REFUNDED/CHARGEBACK/PROTESTED (ésos
// SÍ compraron = ex-clientes) ni los estados "en curso" (WAITING_PAYMENT,
// PRINTED_BILLET, PROCESSING_TRANSACTION, UNDER_ANALISYS, STARTED, PRE_ORDER):
// a ésos no hay que decirles todavía "tu pago no se procesó".
const RECHAZO_STATUSES = ['NO_FUNDS', 'BLOCKED', 'CANCELLED', 'EXPIRED', 'OVERDUE']

// ─── Flags ───────────────────────────────────────────────────────────────────
const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const sinceIdx = args.indexOf('--since')
const SINCE = sinceIdx !== -1 ? args[sinceIdx + 1] : null

// Rechazos: solo se capturan los de los últimos N días (default 3), para no
// reactivar rechazos viejos de golpe cuando corre el primer backfill.
const NO_RECHAZOS   = args.includes('--no-rechazos')
const SOLO_RECHAZOS = args.includes('--solo-rechazos')
const rDiasIdx = args.indexOf('--rechazos-dias')
const RECHAZO_DIAS = rDiasIdx !== -1 ? Math.max(1, Number(args[rDiasIdx + 1]) || 3) : 3

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
// Trae TODOS los productos de la cuenta (curso + order bumps + upsells + lo que venda
// el recomendador/cross-sell de Hotmart), NO solo el curso: esas ventas del cross-sell
// puede que ni pasen por el webhook, así que la API es la única forma segura de contarlas.
// Cada fila guarda su producto_id/producto, así en Metabase se filtra por producto.
// (Se puede restringir con HOTMART_ONLY_PRODUCTS = lista de ids coma-separada.)
async function fetchAllSales(token) {
  const items = []
  let pageToken = null
  do {
    const url = new URL(SALES_URL)
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
    producto_id: pick(product.id),   // para distinguir curso vs upsells/cross-sells en Metabase
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

// ─── 6) Enriquecer con datos del comprador (sales/users) + USD (sales/commissions) ──
// El endpoint sales/history NO trae ni teléfono/dirección ni el monto en USD. Los
// pedimos por transacción: users → tel/país/ciudad/provincia/CP/documento del BUYER;
// commissions → comisión neta del productor en USD + exchange_rate para calcular el
// bruto (valor_local × exchange ≈ precio del curso en USD). Best-effort: si algo
// falla, devuelve lo que pudo (no rompe).
async function enrichFromHotmart(token, transaction, valorLocal) {
  const H = { Authorization: `Bearer ${token}` }
  const out = {}
  try {
    const uR = await fetch(`${USERS_URL}?transaction=${encodeURIComponent(transaction)}`, { headers: H })
    if (uR.ok) {
      const u = await uR.json()
      const buyer = ((u.items?.[0]?.users) || []).find(x => String(x.role).toUpperCase() === 'BUYER')?.user || {}
      const a = buyer.address || {}
      out.telefono      = onlyDigits(pick(buyer.cellphone, buyer.phone))
      out.pais          = pick(a.country)
      out.ciudad        = pick(a.city)
      out.provincia     = pick(a.state)
      out.codigo_postal = pick(a.zip_code)
      out.documento     = pick(buyer.documents?.[0]?.value)
    }
  } catch { /* best-effort */ }
  try {
    const cR = await fetch(`${COMM_URL}?transaction=${encodeURIComponent(transaction)}`, { headers: H })
    if (cR.ok) {
      const c = await cR.json()
      const it = c.items?.[0] || {}
      const prod = (it.commissions || []).find(x => String(x.source).toUpperCase() === 'PRODUCER')?.commission
      if (prod && prod.currency_code === 'USD') out.comision_usd = prod.value
      const exch = it.exchange_rate_currency_payout
      if (exch && valorLocal != null) out.valor_usd = Math.round(Number(valorLocal) * Number(exch) * 100) / 100
    }
  } catch { /* best-effort */ }
  Object.keys(out).forEach(k => (out[k] === undefined || out[k] === '') && delete out[k])
  return out
}

// Filas de `ventas` a las que todavía les falta algo que sólo está en la API de
// Hotmart: el monto en USD y los datos del comprador (documento y dirección).
//
// ⚠️ LA CONDICIÓN ES `enriquecido_en`, NO `valor_usd`. Colgaba de `valor_usd`, y
// el 02/09/2026 el webhook (`sistema-ingresos/api/hotmart.js`) empezó a calcular
// el importe solo desde `data.commissions`. Con la condición vieja, una venta
// nueva ya nunca entraba acá y los datos del comprador no se completaban NUNCA.
//
// ⚠️ Este archivo es una SEGUNDA COPIA de la misma lógica: la que corre de verdad
// todos los días es `sistema-ingresos/api/_lib/hotmart-sync.js`. Ésta es la
// versión de consola, para correrla a mano. Si se toca una, hay que tocar la
// otra — mientras sigan siendo dos.
async function fetchVentasSinUsd() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?select=transaction_id,dedup_key,valor&or=(valor_usd.is.null,enriquecido_en.is.null)&limit=100000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) die(`No pude leer ventas a enriquecer (HTTP ${res.status}): ${await res.text()}`)
  return res.json()
}

// PATCH: escribe SOLO los campos de enriquecimiento en la fila (por dedup_key). No
// toca src/fbp/evento_hotmart/etc. — así completa tanto filas del webhook como del sync.
async function patchEnrichment(dedupKey, fields) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?dedup_key=eq.${encodeURIComponent(dedupKey)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json', Prefer: 'return=minimal',
    },
    body: JSON.stringify(fields),
  })
  if (!res.ok) console.warn(`   ⚠️  No pude enriquecer ${dedupKey} (HTTP ${res.status})`)
  return res.ok
}

// Enriquece todas las ventas que aún no tienen USD (con datos del comprador + USD).
async function enrichVentas(token) {
  const pend = await fetchVentasSinUsd()
  if (!pend.length) { console.log('   ✨ Enriquecimiento: todas las ventas ya tienen USD/datos de cliente.'); return }
  console.log(`   ✨ Enriqueciendo ${pend.length} venta(s) con USD + datos del comprador...`)
  let ok = 0
  for (const row of pend) {
    if (!row.transaction_id) continue
    const extra = await enrichFromHotmart(token, row.transaction_id, row.valor)
    // La marca se escribe SIEMPRE, aunque la API no haya devuelto nada: Hotmart
    // manda `document: ""` para muchos compradores, y sin marca esas ventas se
    // volverían a consultar en cada corrida para siempre.
    extra.enriquecido_en = new Date().toISOString()
    if (!DRY_RUN) { if (await patchEnrichment(row.dedup_key, extra)) ok++ }
    else { console.log(`      (dry-run) ${row.transaction_id} → ${JSON.stringify(extra)}`) }
  }
  if (!DRY_RUN) console.log(`   ✅ Enriquecidas ${ok}/${pend.length} ventas.`)
}

// ══════════════════════════════════════════════════════════════════════════════
// RECHAZOS (tarjeta #36) — captura pagos rechazados → tabla clientes_potenciales
// ══════════════════════════════════════════════════════════════════════════════

// Trae las transacciones rechazadas de los últimos RECHAZO_DIAS días. Pide cada
// estado por separado con el filtro `transaction_status` (el pull "todo" del
// backfill filtra a APPROVED/COMPLETE, así que acá vamos explícito para asegurar
// que la API los devuelva). Si algún estado no existe/da error, se saltea (no
// rompe): guardamos igual el JSON crudo en `payload`, así el mapeo se ajusta
// después sin perder datos. Confirmar el nombre del param en la 1ª corrida real.
async function fetchRechazos(token) {
  const startMs = Date.now() - RECHAZO_DIAS * 86400000
  const byTx = new Map()
  for (const status of RECHAZO_STATUSES) {
    let pageToken = null
    do {
      const url = new URL(SALES_URL)
      url.searchParams.set('product_id', PRODUCT_ID)
      url.searchParams.set('max_results', '100')
      url.searchParams.set('transaction_status', status)
      url.searchParams.set('start_date', String(startMs))
      if (pageToken) url.searchParams.set('page_token', pageToken)

      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.warn(`   ⚠️  Rechazos: estado ${status} devolvió HTTP ${res.status} — se saltea. ${JSON.stringify(data).slice(0, 200)}`)
        break
      }
      for (const it of (data.items || [])) {
        const tx = pick((it.purchase || {}).transaction, it.transaction)
        if (tx) byTx.set(String(tx), it) // dedup por transacción entre estados
      }
      pageToken = data.page_info && data.page_info.next_page_token
    } while (pageToken)
  }
  return [...byTx.values()]
}

// Mapea una transacción rechazada de Hotmart → fila de `clientes_potenciales`.
// Espeja lo que arma savePotencial() en el webhook, para que una fila cargada por
// el sync sea indistinguible (y recuperable) de una que hubiera entrado sola.
function mapToPotencial(item) {
  const purchase = item.purchase || {}
  const buyer    = item.buyer || {}
  const product  = item.product || {}
  const price    = purchase.price || {}
  const tracking = purchase.tracking || {}
  const status   = String(purchase.status || '').toUpperCase()
  const transaction = pick(purchase.transaction, item.transaction)

  const record = {
    tipo: 'pago_rechazado',
    email: String(buyer.email || '').toLowerCase().trim() || undefined,
    nombre: pick(buyer.name, buyer.first_name && `${buyer.first_name} ${buyer.last_name || ''}`.trim()),
    telefono: onlyDigits(buyer.phone_local_code, pick(buyer.checkout_phone, buyer.phone)),
    producto: pick(product.name, 'Sistema de Ingresos Diarios para Periodistas'),
    valor: pick(price.value, purchase.full_price && purchase.full_price.value),
    moneda: pick(price.currency_value, price.currency_code, 'USD'),
    evento_hotmart: `API_SYNC:${status || 'RECHAZO'}`,   // marca que vino del sync, no del webhook
    motivo_rechazo: status || undefined,
    transaction_id: transaction,
    src: pick(tracking.source, tracking.src),
    utm_source: pick(tracking.utm_source),
    utm_medium: pick(tracking.utm_medium),
    utm_campaign: pick(tracking.utm_campaign),
    ocurrido_en: toIso(pick(purchase.order_date, purchase.date, purchase.approved_date)),
    // estado_recuperacion NO se setea: la columna tiene default 'pendiente', así el
    // cron de recuperación la agarra y manda recup_rechazo_1 (paso 1, minHoras 0).
    dedup_key: transaction ? `hotmart:${transaction}` : undefined,
    payload: item,
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])
  return record
}

// transaction_ids ya presentes en clientes_potenciales (para reportar cuántos faltan).
async function fetchExistingPotencialTx() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?select=transaction_id&limit=100000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  })
  if (!res.ok) die(`No pude leer clientes_potenciales (HTTP ${res.status}): ${await res.text()}`)
  const rows = await res.json()
  return new Set(rows.map(r => r.transaction_id).filter(Boolean))
}

async function insertPotenciales(records) {
  if (!records.length) return 0
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?on_conflict=dedup_key`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      // ignore-duplicates: nunca pisa una fila ya capturada (no reinicia su estado
      // de recuperación si ya fue contactada/recuperada).
      Prefer: 'resolution=ignore-duplicates,return=minimal',
    },
    body: JSON.stringify(records),
  })
  if (!res.ok) die(`Error insertando rechazos (HTTP ${res.status}): ${await res.text()}`)
  return records.length
}

// Corre la captura de rechazos. Aislada en su propio try/catch: si algo falla acá,
// NO tumba el sync de ventas (que ya corrió antes).
async function syncRechazos(token) {
  try {
    const raw = await fetchRechazos(token)
    console.log(`   📥 Rechazos (últimos ${RECHAZO_DIAS} días): Hotmart devolvió ${raw.length} transacciones`)

    const existing = await fetchExistingPotencialTx()
    const records = raw.map(mapToPotencial).filter(r => r.transaction_id && r.email && !isExcluded(r.email))
    const missing = records.filter(r => !existing.has(r.transaction_id))
    console.log(`   📊 Rechazos ya en la tabla: ${records.length - missing.length} · Faltan: ${missing.length}`)

    if (missing.length && !DRY_RUN) {
      const n = await insertPotenciales(missing)
      console.log(`   ✅ Insertados ${n} rechazos en clientes_potenciales (los agarra el cron de recuperación)`)
    } else if (missing.length) {
      console.log('   (dry-run) Se insertarían como pago_rechazado:')
      missing.slice(0, 20).forEach(r => console.log(`      · ${r.ocurrido_en?.slice(0, 10)} | ${r.email} | ${r.motivo_rechazo} | tel=${r.telefono || 'SIN TEL'} | ${r.transaction_id}`))
    } else {
      console.log('   ✅ Rechazos: nada nuevo que capturar.')
    }
  } catch (e) {
    console.error(`   ⚠️  Falló la captura de rechazos (el sync de ventas no se afecta): ${e.message}`)
  }
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

// ── Ventas (histórico + reconciliación) ──
if (!SOLO_RECHAZOS) {
  const raw = await fetchAllSales(token)
  console.log(`   📥 Hotmart devolvió ${raw.length} transacciones${SINCE ? ` (desde ${SINCE})` : ''}`)

  // Solo ventas concretadas.
  const sales = raw.filter(it => SALE_STATUSES.includes(String((it.purchase || {}).status || '').toUpperCase()))
  console.log(`   🧾 De esas, ${sales.length} son ventas (${SALE_STATUSES.join('/')})`)

  const existing = await fetchExistingTx()
  const records = sales.map(mapToVenta).filter(r => r.transaction_id && !isExcluded(r.email) && productoOk(r.producto_id))
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

  // Enriquecer con USD + datos del comprador (completa también las filas del webhook).
  await enrichVentas(token)
}

// ── Rechazos → clientes_potenciales (tarjeta #36) ──
if (!NO_RECHAZOS) {
  await syncRechazos(token)
}

console.log('─'.repeat(60))
