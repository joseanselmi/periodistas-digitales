// Webhook de compra de Hotmart para el curso "Sistema de Ingresos Diarios".
//
// Este es el backend PROPIO del curso (Vercel Function bajo el proyecto
// sistema-ingresos-landing). Reemplaza la dependencia que antes tenía el curso
// del webhook de Leadr: ahora el curso procesa su propia compra y, para el bono
// de "1 mes gratis de Leadr", llama a la API interna de Leadr
// (POST /api/internal/course-access) en vez de compartir código o base de datos.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   HOTMART_WEBHOOK_TOKEN_CURSO  — token del webhook de Hotmart de ESTE producto
//   META_PIXEL_ID, META_CAPI_TOKEN — para enviar el evento Purchase a Meta CAPI
//   LEADR_INTERNAL_API_URL       — https://www.leadr.cloud (CON www)
//   LEADR_INTERNAL_SECRET        — secret compartido con el endpoint de Leadr

const crypto = require('crypto')

const HOTMART_TOKEN = (process.env.HOTMART_WEBHOOK_TOKEN_CURSO || '').trim()
const PURCHASE_EVENTS = ['PURCHASE_COMPLETE', 'PURCHASE_APPROVED']

async function sendPurchaseToMeta(email, value, currency) {
  try {
    const hashedEmail = crypto.createHash('sha256').update(email).digest('hex')
    await fetch(
      `https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              event_source_url: 'https://sistemadeingresosdiariosia.com',
              action_source: 'website',
              user_data: { em: hashedEmail },
              custom_data: { value, currency },
            },
          ],
        }),
      }
    )
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

  const event = body.event || (body.data && body.data.purchase && body.data.purchase.status)
  if (!event) {
    return res.status(400).json({ error: 'No event' })
  }

  const email = (
    (body.data && body.data.buyer && body.data.buyer.email) ||
    (body.buyer && body.buyer.email) ||
    (body.data && body.data.purchase && body.data.purchase.buyer && body.data.purchase.buyer.email) ||
    ''
  )
    .toLowerCase()
    .trim()

  if (!email) {
    return res.status(400).json({ error: 'No email in payload' })
  }

  // 3. Solo procesar compras aprobadas/completas (curso = pago único)
  if (!PURCHASE_EVENTS.includes(event)) {
    return res.status(200).json({ ok: true, action: 'ignored', event })
  }

  const purchaseValue =
    (body.data && body.data.purchase && body.data.purchase.price && body.data.purchase.price.value) ?? 27
  const purchaseCurrency =
    (body.data && body.data.purchase && body.data.purchase.price && body.data.purchase.price.currency_value) ||
    'USD'

  await sendPurchaseToMeta(email, purchaseValue, purchaseCurrency)
  const bonoOk = await grantLeadrAccess(email)

  return res.status(200).json({
    ok: true,
    action: 'purchase_processed',
    email,
    leadr_bono: bonoOk,
  })
}
