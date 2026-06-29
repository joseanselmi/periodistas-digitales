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
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   HOTMART_WEBHOOK_TOKEN_CURSO  — token del webhook de Hotmart de ESTE producto
//   META_PIXEL_ID, META_CAPI_TOKEN — para enviar el evento Purchase a Meta CAPI
//   META_TEST_EVENT_CODE         — (opcional) para validar en "Probar eventos" sin compra real
//   LEADR_INTERNAL_API_URL       — https://www.leadr.cloud (CON www)
//   LEADR_INTERNAL_SECRET        — secret compartido con el endpoint de Leadr

const crypto = require('crypto')

const HOTMART_TOKEN = (process.env.HOTMART_WEBHOOK_TOKEN_CURSO || '').trim()
const TEST_EVENT_CODE = (process.env.META_TEST_EVENT_CODE || '').trim()
const PURCHASE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED']

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

  // 3. Solo procesar compras aprobadas/completas (curso = pago único)
  if (!PURCHASE_EVENTS.includes(event)) {
    return res.status(200).json({ ok: true, action: 'ignored', event })
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

  return res.status(200).json({
    ok: true,
    action: 'purchase_processed',
    email,
    leadr_bono: bonoOk,
  })
}
