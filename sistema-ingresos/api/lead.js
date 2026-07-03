// Ingesta de leads a la base de marketing (Supabase periodistas-marketing, tabla `leads`).
//
// Lo llama el escenario de Make "Facebook Lead Ads _ Step 1" (id 9433023) con un POST
// por cada lead nuevo de Facebook Lead Ads. En vez de meter la service_role key dentro
// de Make (que puede leer/escribir TODA la base, incluida PII de ventas/customers),
// Make pega a ESTE endpoint con un secreto compartido y la escritura queda acá, con la
// key que ya vive en Vercel — mismo criterio que el resto de api/ (hotmart, recuperacion).
//
// Idempotente: dedup_key = fb:<leadgen_id> + on_conflict=ignore-duplicates → si Make
// reprocesa el mismo lead no se duplica ni se pisa el estado de trabajo del lead.
//
// Variables de entorno (proyecto Vercel sistema-ingresos-landing):
//   LEAD_INGEST_SECRET         — secreto compartido con el módulo HTTP de Make (header x-lead-secret)
//   SUPABASE_URL               — https://wxyimqkjlwfncvzozpjy.supabase.co (base de marketing)
//   SUPABASE_SERVICE_ROLE_KEY  — service_role key de esa base (secreta; escribe saltando RLS)

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '')
const SUPABASE_SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const LEAD_SECRET = (process.env.LEAD_INGEST_SECRET || '').trim()

const FUENTE_DEFAULT = 'facebook_lead_ads'
const FUNNEL_DEFAULT = 'meta-leadgen-guia-claude'

function pick(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && v !== '') return v
  return undefined
}

function onlyDigits(v) {
  const d = String(v == null ? '' : v).replace(/\D/g, '')
  return d || undefined
}

// Fecha de FB (ISO, epoch en seg/ms) → ISO-8601. Best-effort.
function toIso(v) {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  const d = Number.isFinite(n) ? new Date(n > 1e12 ? n : n * 1000) : new Date(v)
  return isNaN(d.getTime()) ? undefined : d.toISOString()
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Secreto compartido con Make. Fail-closed: si no está configurado, no acepta nada.
  const secret = (req.headers['x-lead-secret'] || '').trim()
  if (!LEAD_SECRET || secret !== LEAD_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[lead] Supabase sin configurar (falta SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const email = String(pick(body.email, '') || '').toLowerCase().trim()
  if (!email) {
    return res.status(400).json({ error: 'No email' })
  }

  const leadgenId = pick(body.leadgen_id, body.leadgenId)
  const createdIso = toIso(pick(body.created_time, body.dateCreated))
  const campaignName = pick(body.campaign_name, body.campaignName)

  // Idempotencia: por leadgen_id si viene (siempre en FB Lead Ads); si no, por email+fecha.
  const dedupKey = leadgenId
    ? `fb:${leadgenId}`
    : `fb:${email}:${createdIso || Date.now()}`

  const record = {
    email,
    nombre: pick(body.nombre, body.full_name, body.name),
    telefono: onlyDigits(pick(body.telefono, body.phone_number, body.phone)),
    fuente: pick(body.fuente, FUENTE_DEFAULT),
    funnel: pick(body.funnel, FUNNEL_DEFAULT),
    // Atribución que sí trae FB Lead Ads (no hay fbp/fbc/src acá: eso llega en la landing).
    utm_source: pick(body.utm_source, 'facebook'),
    utm_medium: pick(body.utm_medium, 'paid'),
    utm_campaign: pick(body.utm_campaign, campaignName),
    leadgen_id: leadgenId,
    form_id: pick(body.form_id, body.formId),
    ad_id: pick(body.ad_id, body.adId),
    campaign_id: pick(body.campaign_id, body.campaignId),
    ocurrido_en: createdIso,
    dedup_key: dedupKey,
    payload: body, // crudo entero (incluye adName/adsetName/platform) por si hay que reprocesar
  }
  Object.keys(record).forEach(k => record[k] === undefined && delete record[k])

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?on_conflict=dedup_key`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        // ignore-duplicates: la 1ª captura gana; un reproceso de Make no pisa el estado del lead.
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(record),
    })
    if (!r.ok) {
      const txt = await r.text()
      console.error('[lead] Supabase insert HTTP', r.status, txt)
      return res.status(502).json({ error: 'Supabase insert failed', status: r.status })
    }
    return res.status(200).json({ ok: true, email, dedup_key: dedupKey })
  } catch (e) {
    console.error('[lead] error guardando el lead:', e)
    return res.status(500).json({ error: 'Internal error' })
  }
}
