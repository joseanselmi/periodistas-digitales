/**
 * avisar-campana-salio.mjs — vigila una campaña de Brevo y avisa POR MAIL cuando sale de verdad.
 *
 * POR QUÉ EXISTE (22/08/2026). El `sendNow` de la campaña 5 devolvió 200 y la campaña quedó en
 * `in_review`: Brevo la retuvo para revisarla a mano. **Enviados: 0.** O sea que "la mandé" y
 * "salió" son dos cosas distintas, y entre una y otra pueden pasar horas.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/utiles/avisar-campana-salio.mjs <campaignId> <email-de-aviso> [horas]
 *
 * Chequea cada minuto y manda UN solo mail cuando `sent` pasa de 0. Si se acaba el plazo sin que
 * salga, avisa igual — que no llegue nada nunca es peor que una mala noticia.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

for (const ruta of ['../sistema-ingresos/.env.local', '.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const v = m[2].trim().replace(/^["']|["']$/g, '')
    if (v && !process.env[m[1]]) process.env[m[1]] = v
  }
}

const BREVO = process.env.BREVO_API_KEY
const [id, aviso, horasArg] = process.argv.slice(2)
if (!BREVO || !id || !aviso) {
  console.error('Uso: node scripts/utiles/avisar-campana-salio.mjs <campaignId> <email> [horas]')
  process.exit(1)
}
const HORAS = Number(horasArg || 8)

// ⚠️ Brevo devuelve 429 cuando se le pregunta seguido, y el cuerpo NO es JSON. La primera
// versión de este script hacía `.json()` a ciegas: al primer 429 reventó, y con él se perdió el
// aviso que tenía que mandar. Un vigilante que se muere en silencio es peor que no tenerlo.
async function api(ruta, opciones = {}) {
  const r = await fetch('https://api.brevo.com/v3' + ruta, {
    ...opciones,
    headers: { 'api-key': BREVO, accept: 'application/json', 'content-type': 'application/json', ...(opciones.headers || {}) },
  })
  if (!r.ok) return { _error: r.status }
  const txt = await r.text()
  try { return JSON.parse(txt) } catch { return { _error: 'respuesta no es JSON' } }
}

async function mandar(asunto, cuerpoHtml) {
  const r = await apiCruda('/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      sender: { name: 'Aviso automático', email: 'jose@sistemadeingresosdiariosia.com' },
      to: [{ email: aviso }],
      subject: asunto,
      htmlContent: `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.7;color:#111;">${cuerpoHtml}</div>`,
    }),
  })
  console.log(r.ok ? `✉️  aviso enviado a ${aviso}` : `🔴 no se pudo avisar: ${r.status}`)
}

// Para mandar hace falta el Response crudo (interesa el .ok, no el cuerpo).
const apiCruda = (ruta, opciones = {}) =>
  fetch('https://api.brevo.com/v3' + ruta, {
    ...opciones,
    headers: { 'api-key': BREVO, accept: 'application/json', 'content-type': 'application/json', ...(opciones.headers || {}) },
  })

let previo = ''
const vueltas = HORAS * 60

for (let i = 0; i < vueltas; i++) {
  const c = await api(`/emailCampaigns/${id}`)
  if (c._error) {                       // 429 o red caída: se espera y se sigue, NO se corta
    console.log(new Date().toISOString().slice(11, 19), 'sin respuesta de Brevo:', c._error, '— reintenta en 1 min')
    await new Promise(s => setTimeout(s, 60000))
    continue
  }
  const g = c.statistics?.globalStats || {}
  const enviados = g.sent || 0

  if (c.status !== previo) {
    console.log(new Date().toISOString().slice(11, 19), 'estado:', c.status, '· enviados:', enviados)
    previo = c.status
  }

  // La señal NO es el estado: es que `sent` deje de ser cero. Un estado puede decir "sent"
  // mientras la cola todavía no despachó a nadie.
  if (enviados > 0) {
    const min = Math.round(i)
    await mandar(
      `✅ Ya salió: ${c.subject}`,
      `<p><strong>La campaña ${id} está saliendo.</strong></p>
       <p>Estuvo ${min} minuto(s) retenida en revisión de Brevo antes de despachar.</p>
       <ul>
         <li>Enviados: <strong>${enviados}</strong></li>
         <li>Entregados: ${g.delivered || 0}</li>
         <li>Rebotes: ${(g.hardBounces || 0) + (g.softBounces || 0)}</li>
       </ul>
       <p>En 48 horas, el embudo completo (aperturas → clics → llegadas → checkouts → ventas):<br>
       <code>select * from v_email_comunidad_envios order by envio;</code></p>
       <p style="color:#666;font-size:14px;">Este aviso lo manda <code>avisar-campana-salio.mjs</code>, que vigila hasta que
       <code>sent</code> deja de ser cero — no hasta que el estado <em>diga</em> que salió.</p>`
    )
    process.exit(0)
  }

  await new Promise(s => setTimeout(s, 60000))
}

await mandar(
  `⚠️ Sigue sin salir: campaña ${id}`,
  `<p>Pasaron <strong>${HORAS} horas</strong> y la campaña ${id} sigue sin despachar un solo mail.</p>
   <p>Último estado en Brevo: <strong>${previo}</strong>.</p>
   <p>Si sigue en <code>in_review</code>, se destraba escribiéndole al soporte de Brevo desde el panel.</p>`
)
