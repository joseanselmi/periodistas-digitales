// Webhook de compra de Hotmart para el curso "Sistema de Ingresos Diarios".
//
// Este es el backend PROPIO del curso (Vercel Function bajo el proyecto
// sistema-ingresos-landing). Reemplaza la dependencia que antes tenía el curso
// del webhook de Leadr: ahora el curso procesa su propia compra y, para el bono
// de "1 mes gratis de Leadr", llama a la API interna de Leadr
// (POST /api/internal/course-access) en vez de compartir código o base de datos.
//
// Tracking (ver sistema-ingresos/TRACKING.md): el evento Purchase se manda a Meta
// por la Conversions API con el máximo de datos disponibles para subir el Event
// Match Quality:
//   · PII hasheada (SHA-256): email, teléfono, nombre, apellido, ciudad, CP, país.
//   · fbp/fbc: la cookie de Facebook que la landing empaqueta dentro de `sck`.
//   · content_ids: marca la compra como la del CURSO (este pixel lo comparten
//     Leadr y otros sitios → así se puede crear una conversión personalizada que
//     optimice SOLO compras del curso).
//   · event_id: id de transacción de Hotmart → deduplica reintentos del webhook.
//
// Clientes potenciales (ver ARQUITECTURA-DATOS.md): además de la compra, este
// webhook registra a quien entró al checkout y NO compró — carrito abandonado o
// pago rechazado — en la tabla `clientes_potenciales` de la base de marketing
// (Supabase periodistas-marketing), para poder recuperarlos después por mail/WhatsApp.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   HOTMART_WEBHOOK_TOKEN_CURSO  — token del webhook de Hotmart de ESTE producto
//   META_PIXEL_ID, META_CAPI_TOKEN — para enviar el evento Purchase a Meta CAPI
//   META_TEST_EVENT_CODE         — (opcional) para validar en "Probar eventos" sin compra real
//   LEADR_INTERNAL_API_URL       — https://www.leadr.cloud (CON www)
//   LEADR_INTERNAL_SECRET        — secret compartido con el endpoint de Leadr
//   SUPABASE_URL                 — https://wxyimqkjlwfncvzozpjy.supabase.co (base de marketing)
//   SUPABASE_SERVICE_ROLE_KEY    — service_role key de esa base (secreta; escribe saltando RLS)

const crypto = require('crypto')

const HOTMART_TOKEN = (process.env.HOTMART_WEBHOOK_TOKEN_CURSO || '').trim()
const TEST_EVENT_CODE = (process.env.META_TEST_EVENT_CODE || '').trim()
const PURCHASE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED']

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '')
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

// Recuperación instantánea por WhatsApp (tarjeta #34). Gateada por RECUP_ENABLED:
// mientras no sea "1", el webhook solo guarda el cliente potencial (no manda nada).
const RECUP_ENABLED = (process.env.RECUP_ENABLED || '').trim()
const { normalizePhone, sendRecupTemplate, TEMPLATES } = require('./_lib/wa')

// Eventos de Hotmart que NUNCA son "cliente potencial" (esa gente SÍ compró):
// reembolsos, contracargos y las propias compras aprobadas. Se excluyen explícito
// para no ensuciar la tabla de recuperación con ex-clientes.
const NO_POTENCIAL_EVENTS = [
  'PURCHASE_COMPLETE', 'PURCHASE_APPROVED',
  'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_PROTEST',
]

const CONTENT_ID = 'curso-sistema-ingresos'
const CONTENT_NAME = 'Sistema de Ingresos Diarios para Periodistas'

// SHA-256 en minúsculas y sin espacios — formato que Meta exige para PII.
function sha256(value) {
  const v = String(value == null ? '' : value).trim().toLowerCase()
  if (!v) return undefined
  return crypto.createHash('sha256').update(v).digest('hex')
}

// Teléfono: solo dígitos (idealmente con código de país), después hash.
function hashPhone(ddi, phone) {
  const digits = `${ddi || ''}${phone || ''}`.replace(/\D/g, '')
  if (!digits) return undefined
  return crypto.createHash('sha256').update(digits).digest('hex')
}

// Lee el primer valor presente entre varias rutas posibles del payload
// (Hotmart varía la forma del JSON según el tipo de evento/versión).
function pick(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return undefined
}

// La landing empaqueta fbp/fbc dentro de sck: "b2~fbp:<...>~fbc:<...>".
// El delimitador "~" no aparece en los valores de fbp/fbc (son [A-Za-z0-9_.-]).
function parseSck(sck) {
  const out = { fbp: '', fbc: '' }
  if (!sck) return out
  for (const part of String(sck).split('~')) {
    if (part.startsWith('fbp:')) out.fbp = part.slice(4)
    else if (part.startsWith('fbc:')) out.fbc = part.slice(4)
  }
  return out
}

function buildUserData(buyer, address, fb) {
  const fullName = String(buyer.name || '').trim()
  const firstName = fullName.split(/\s+/)[0]
  const lastName = fullName.split(/\s+/).slice(1).join(' ')

  const ud = {
    em: sha256(buyer.email),
    ph: hashPhone(buyer.ddi, buyer.phone),
    fn: sha256(firstName),
    ln: sha256(lastName),
    ct: sha256(address.city),
    zp: sha256(address.zip),
    // country: Meta lo quiere como ISO-2 en minúscula; si Hotmart manda el nombre
    // completo igual lo hasheamos (mejor algo que nada), pero ver TRACKING.md.
    country: sha256(address.country),
  }
  // fbp/fbc van EN CRUDO (no se hashean).
  if (fb.fbp) ud.fbp = fb.fbp
  if (fb.fbc) ud.fbc = fb.fbc

  Object.keys(ud).forEach(k => ud[k] === undefined && delete ud[k])
  return ud
}

async function sendPurchaseToMeta({ userData, value, currency, eventId }) {
  try {
    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || undefined,
          event_source_url: 'https://sistemadeingresosdiariosia.com',
          action_source: 'website',
          user_data: userData,
          custom_data: {
            value,
            currency,
            content_ids: [CONTENT_ID],
            content_name: CONTENT_NAME,
            content_type: 'product',
          },
        },
      ],
    }
    if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    if (!res.ok) {
      console.error('[curso webhook] Meta CAPI HTTP', res.status, await res.text())
    }
  } catch (e) {
    console.error('[curso webhook] error Meta CAPI:', e)
  }
}

// Otorga el bono de 1 mes de Leadr llamando a la API interna de Leadr.
// No falla el webhook si Leadr no responde — se registra y se sigue (Hotmart
// no debe reintentar indefinidamente por un problema transitorio de Leadr).
async function grantLeadrAccess(email) {
  try {
    const res = await fetch(`${process.env.LEADR_INTERNAL_API_URL}/api/internal/course-access`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LEADR_INTERNAL_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, days: 30, source: 'curso-sistema-ingresos' }),
    })
    if (!res.ok) {
      console.error('[curso webhook] Leadr course-access HTTP', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('[curso webhook] error llamando a Leadr:', e)
    return false
  }
}

// Convierte cualquier fecha de Hotmart (epoch en seg o ms, o string ISO) a ISO-8601.
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

// Decide si un evento que NO es compra representa un "cliente potencial" y de qué
// tipo. Mapeo best-effort según el webhook v2 de Hotmart — CONFIRMAR contra el
// `raw payload` real en los logs de Vercel la primera vez que llegue cada evento
// (el payload crudo se guarda en la columna `payload`, así que una mala
// clasificación es recuperable y ajustable después sin perder datos).
function classifyPotencial(event, purchase) {
  const e = String(event || '').toUpperCase()
  if (NO_POTENCIAL_EVENTS.includes(e)) return null

  const status = String((purchase && purchase.status) || '').toUpperCase()

  // Abandono de carrito: entró al checkout y se fue sin terminar.
  if (e === 'PURCHASE_OUT_OF_SHOPPING_CART' || e.includes('ABANDON')) {
    return 'carrito_abandonado'
  }
  // Pago rechazado / no concretado: intentó pagar y no se aprobó (tarjeta
  // rechazada, sin fondos, boleto/pix vencido, compra cancelada sin aprobar).
  if (
    e === 'PURCHASE_EXPIRED' ||
    e === 'PURCHASE_CANCELED' ||
    ['EXPIRED', 'CANCELLED', 'NO_FUNDS', 'BLOCKED', 'DENIED', 'REFUSED', 'REJECTED'].includes(status)
  ) {
    return 'pago_rechazado'
  }
  return null
}

// Recuperación INSTANTÁNEA: manda el 1er WhatsApp apenas entra el cliente potencial.
// Gateada por RECUP_ENABLED (apagada = no manda). Idempotente: "reserva" el envío con
// un PATCH condicional (solo si paso_recuperacion sigue en 0), así un reintento del
// webhook no duplica el mensaje. Si el envío falla, revierte para que el cron reintente.
async function instantRecup({ tipo, dedupKey, telefono, nombre }) {
  if (RECUP_ENABLED !== '1') return false
  const to = normalizePhone(telefono)
  const tmpl = TEMPLATES[tipo] && TEMPLATES[tipo][1]
  if (!to || to.length < 8 || !tmpl) return false

  const sbHead = (extra) => ({
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  })
  const key = encodeURIComponent(dedupKey)
  try {
    const claim = await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?dedup_key=eq.${key}&paso_recuperacion=eq.0`, {
      method: 'PATCH',
      headers: sbHead({ Prefer: 'return=representation' }),
      body: JSON.stringify({ estado_recuperacion: 'contactado', paso_recuperacion: 1, ultimo_contacto_en: new Date().toISOString() }),
    })
    const claimed = await claim.json().catch(() => [])
    if (!Array.isArray(claimed) || claimed.length === 0) return false // ya estaba contactado

    const sent = await sendRecupTemplate({ to, tmpl, nombre })
    if (sent.ok) return true

    // Envío falló → revertir para que el cron reintente el paso 1 más tarde.
    await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?dedup_key=eq.${key}`, {
      method: 'PATCH',
      headers: sbHead({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ estado_recuperacion: 'pendiente', paso_recuperacion: 0, ultimo_contacto_en: null }),
    }).catch(() => {})
    console.error('[curso webhook] WA instant fallo', sent.status, JSON.stringify(sent.body))
    return false
  } catch (e) {
    console.error('[curso webhook] error en recuperación instantánea:', e)
    return false
  }
}

// Inserta (o actualiza, idempotente) el cliente potencial en la base de marketing.
// No hace fallar el webhook si Supabase no responde: loguea y sigue devolviendo 200
// para que Hotmart no reintente en loop por un problema transitorio.
async function savePotencial({ tipo, event, email, buyerRaw, data, purchase, body }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[curso webhook] Supabase sin configurar (falta SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) — no se guarda el cliente potencial')
    return false
  }

  const tracking = purchase.tracking || data.tracking || {}
  const sck = pick(tracking.source_sck, tracking.sck, body.sck)
  const fb = parseSck(sck)

  const product = data.product || {}
  const transaction = pick(purchase.transaction, data.transaction)

  // Clave de idempotencia: por transacción si existe; si no (abandono sin
  // transacción), por tipo+email+producto → reintentos actualizan la misma fila.
  const productKey = String(pick(product.id, product.ucode, product.name, 'curso'))
  const dedupKey = transaction ? `hotmart:${transaction}` : `${tipo}:${email}:${productKey}`

  const record = {
    tipo,
    email,
    nombre: pick(buyerRaw.name, buyerRaw.first_name && `${buyerRaw.first_name} ${buyerRaw.last_name || ''}`.trim()),
    telefono: onlyDigits(pick(buyerRaw.phone_local_code, buyerRaw.ddi), pick(buyerRaw.checkout_phone, buyerRaw.phone)),
    producto: pick(product.name, CONTENT_NAME),
    valor: pick(purchase.price && purchase.price.value, purchase.full_price && purchase.full_price.value),
    moneda: pick(purchase.price && purchase.price.currency_value, 'USD'),
    evento_hotmart: event,
    motivo_rechazo:
      tipo === 'pago_rechazado'
        ? pick(purchase.status, purchase.payment && (purchase.payment.refusal_reason || purchase.payment.type))
        : undefined,
    transaction_id: transaction,
    src: pick(tracking.source, tracking.src),
    fbp: fb.fbp || undefined,
    fbc: fb.fbc || undefined,
    utm_source: pick(tracking.utm_source),
    utm_medium: pick(tracking.utm_medium),
    utm_campaign: pick(tracking.utm_campaign),
    // estado_recuperacion NO se setea acá: la columna tiene default 'pendiente' para
    // filas nuevas, y así un reintento del webhook (upsert) no pisa el estado si la
    // persona ya fue contactada.
    ocurrido_en: toIso(pick(body.creation_date, purchase.order_date, purchase.date)),
    dedup_key: dedupKey,
    payload: body,
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/clientes_potenciales?on_conflict=dedup_key`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(record),
    })
    if (!res.ok) {
      console.error('[curso webhook] Supabase insert HTTP', res.status, await res.text())
      return { saved: false, waSent: false }
    }
    // Guardado OK → intentar la recuperación instantánea por WhatsApp (best-effort).
    const waSent = await instantRecup({ tipo, dedupKey, telefono: record.telefono, nombre: record.nombre })
    return { saved: true, waSent }
  } catch (e) {
    console.error('[curso webhook] error guardando cliente potencial:', e)
    return { saved: false, waSent: false }
  }
}

// Registra la venta confirmada en la tabla `ventas` de la base de marketing.
// Mismo criterio que savePotencial: best-effort, no hace fallar el webhook si
// Supabase no responde (loguea y sigue). Idempotente por transacción (dedup_key)
// → si Hotmart manda PURCHASE_APPROVED y luego PURCHASE_COMPLETE de la misma
// compra, se actualiza la MISMA fila en vez de duplicar la venta.
async function saveVenta({ event, email, buyerRaw, address, data, purchase, tracking, fb, value, currency, transaction, bonoOk, body }) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[curso webhook] Supabase sin configurar — no se guarda la venta')
    return false
  }

  const product = data.product || {}
  const productKey = String(pick(product.id, product.ucode, product.name, 'curso'))
  const dedupKey = transaction ? `hotmart:${transaction}` : `venta:${email}:${productKey}`

  const afiliado = pick(data.affiliate, purchase.affiliate)

  const record = {
    email,
    nombre: pick(buyerRaw.name, buyerRaw.first_name && `${buyerRaw.first_name} ${buyerRaw.last_name || ''}`.trim()),
    telefono: onlyDigits(pick(buyerRaw.phone_local_code, buyerRaw.ddi), pick(buyerRaw.checkout_phone, buyerRaw.phone)),
    producto: pick(product.name, CONTENT_NAME),
    producto_id: pick(product.id),
    valor: value,
    moneda: currency,
    evento_hotmart: event,
    transaction_id: transaction,
    src: pick(tracking.source, tracking.src),
    fbp: fb.fbp || undefined,
    fbc: fb.fbc || undefined,
    utm_source: pick(tracking.utm_source),
    utm_medium: pick(tracking.utm_medium),
    utm_campaign: pick(tracking.utm_campaign),
    pais: pick(address.country_iso, data.checkout_country && data.checkout_country.iso, address.country),
    es_afiliado: typeof afiliado === 'boolean' ? afiliado : undefined,
    leadr_bono_otorgado: bonoOk,
    ocurrido_en: toIso(pick(purchase.approved_date, purchase.order_date, purchase.date, body.creation_date)),
    dedup_key: dedupKey,
    payload: body,
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ventas?on_conflict=dedup_key`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(record),
    })
    if (!res.ok) {
      console.error('[curso webhook] Supabase insert venta HTTP', res.status, await res.text())
      return false
    }
    return true
  } catch (e) {
    console.error('[curso webhook] error guardando la venta:', e)
    return false
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Verificar firma de Hotmart (webhook v2.0 manda el hottok en el header
  // x-hotmart-hottok; es el token único de la cuenta de Hotmart)
  const token = (req.headers['x-hotmart-hottok'] || '').trim()
  if (!HOTMART_TOKEN || token !== HOTMART_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 2. Parsear payload (Vercel ya parsea JSON, pero por robustez aceptamos string)
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  body = body || {}
  console.log('[curso webhook] raw payload:', JSON.stringify(body))

  const data = body.data || {}
  const purchase = data.purchase || {}

  const event = body.event || purchase.status
  if (!event) {
    return res.status(400).json({ error: 'No event' })
  }

  const buyerRaw = data.buyer || body.buyer || purchase.buyer || {}
  const email = String(pick(buyerRaw.email, '') || '').toLowerCase().trim()

  if (!email) {
    return res.status(400).json({ error: 'No email in payload' })
  }

  // 3. Bifurcar según el evento:
  //    · compra aprobada/completa      → Meta CAPI + bono Leadr (sigue abajo)
  //    · carrito abandonado / rechazado → registrar cliente potencial y terminar
  //    · cualquier otra cosa            → ignorar
  if (!PURCHASE_EVENTS.includes(event)) {
    const tipo = classifyPotencial(event, purchase)
    if (!tipo) {
      return res.status(200).json({ ok: true, action: 'ignored', event })
    }
    const r = await savePotencial({ tipo, event, email, buyerRaw, data, purchase, body })
    return res.status(200).json({ ok: true, action: 'cliente_potencial', tipo, saved: r.saved, wa_instantaneo: r.waSent })
  }

  // 4. Reunir todo para el evento de Meta.
  const address = buyerRaw.address || {}
  const buyer = {
    email,
    name: pick(buyerRaw.name, buyerRaw.first_name && `${buyerRaw.first_name} ${buyerRaw.last_name || ''}`),
    phone: pick(buyerRaw.checkout_phone, buyerRaw.phone),
    ddi: pick(buyerRaw.phone_local_code, buyerRaw.ddi),
  }
  const addr = {
    city: pick(address.city),
    zip: pick(address.zip_code, address.zipcode, address.zip),
    country: pick(address.country_iso, address.country),
  }

  const tracking = purchase.tracking || data.tracking || {}
  const sck = pick(tracking.source_sck, tracking.sck, body.sck)
  const fb = parseSck(sck)

  const value = pick(purchase.price && purchase.price.value, purchase.full_price && purchase.full_price.value, 27)
  const currency = pick(purchase.price && purchase.price.currency_value, 'USD')
  const eventId = pick(purchase.transaction, purchase.order_date && `${email}-${purchase.order_date}`)

  await sendPurchaseToMeta({
    userData: buildUserData(buyer, addr, fb),
    value,
    currency,
    eventId,
  })
  const bonoOk = await grantLeadrAccess(email)

  // Registrar la venta en la base de marketing (para conteo de ventas,
  // facturación y atribución por anuncio). Best-effort: no bloquea la respuesta.
  const ventaGuardada = await saveVenta({
    event, email, buyerRaw, address, data, purchase,
    tracking, fb, value, currency,
    transaction: purchase.transaction,
    bonoOk, body,
  })

  return res.status(200).json({
    ok: true,
    action: 'purchase_processed',
    email,
    leadr_bono: bonoOk,
    venta_guardada: ventaGuardada,
  })
}
