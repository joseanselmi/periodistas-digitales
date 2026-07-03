// Ingesta de eventos de tracking (tabla `events` de la base de marketing).
//
// Lo llama el beacon del navegador (sistema-ingresos/track.js) en cada pageview y
// clic de checkout de las landings. Es un endpoint PÚBLICO (no lleva secreto: lo
// dispara el visitante desde el navegador) — mismo criterio que un pixel de analytics.
// Best-effort y liviano: responde 204 y nunca frena la navegación del usuario.
//
// El funnel_step NO se resuelve acá: el beacon manda funnel+step por slug en el body
// y un trigger en Postgres (events_resolve_step) los mapea a los FKs en el insert.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   SUPABASE_URL               — base de marketing
//   SUPABASE_SERVICE_ROLE_KEY  — service_role (escribe saltando RLS)

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '')
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

// Solo aceptamos beacons de nuestras propias landings (anti-spam básico). Si el
// Origin/Referer no es de casa lo ignoramos en silencio (204, no error).
const ALLOWED_HOST = 'sistemadeingresosdiariosia.com'

function clean(v) {
  const s = String(v == null ? '' : v).trim()
  return s === '' ? undefined : s
}

module.exports = async (req, res) => {
  // Beacon = POST. Cualquier otra cosa, 204 sin ruido.
  if (req.method !== 'POST') return res.status(204).end()

  const origin = String(req.headers.origin || req.headers.referer || '')
  if (origin && !origin.includes(ALLOWED_HOST)) return res.status(204).end()

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[event] Supabase sin configurar')
    return res.status(204).end()
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const url = clean(body.url)
  if (!url) return res.status(204).end() // sin URL no hay evento útil

  const ts = clean(body.ts)
  const record = {
    tipo_evento: clean(body.tipo_evento) || 'pageview',
    ocurrido_en: ts && !isNaN(Date.parse(ts)) ? new Date(ts).toISOString() : new Date().toISOString(),
    url,
    referrer: clean(body.referrer),
    src: clean(body.src),
    sck: clean(body.sck),
    utm_source: clean(body.utm_source),
    utm_medium: clean(body.utm_medium),
    utm_campaign: clean(body.utm_campaign),
    fbp: clean(body.fbp),
    fbc: clean(body.fbc),
    session_id: clean(body.session_id),
    user_agent: clean(req.headers['user-agent']),
    ip: clean((req.headers['x-forwarded-for'] || '').split(',')[0]),
    pais: clean(req.headers['x-vercel-ip-country']),
    // funnel_step_id/funnel_id los resuelve el trigger a partir de payload.funnel/step
    payload: body,
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(record),
    })
    if (!r.ok) console.error('[event] Supabase insert HTTP', r.status, await r.text())
  } catch (e) {
    console.error('[event] error guardando el evento:', e)
  }
  // Siempre 204: es telemetría, nunca debe afectar al visitante.
  return res.status(204).end()
}
