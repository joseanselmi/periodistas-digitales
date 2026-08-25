/**
 * crear-campana-comunidad.mjs — crea la campaña de Brevo del canal `email-comunidad`.
 *
 * ⚠️ ESTE SCRIPT LLEGA A GENTE REAL. Por eso son DOS pasos separados:
 *   1. sin flags  → crea la campaña como BORRADOR y muestra qué quedó configurado.
 *   2. --enviar <id> → recién ahí sale. Una campaña de Brevo NO se puede desenviar.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/publicar/crear-campana-comunidad.mjs <archivo.html> "<asunto>" <orden>
 *   node scripts/publicar/crear-campana-comunidad.mjs --enviar <campaignId>
 *
 * La lista 8 la reescribe antes `scripts/datos/sincronizar-audiencia-comunidad.mjs`. Acá NO se
 * calcula la audiencia: se usa la que ya está, y se verifica que no esté vacía — mandar una
 * campaña a una lista vacía "funciona" y devuelve 200, y sólo se nota días después.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

for (const ruta of ['../sistema-ingresos/.env.local', '.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const valor = m[2].trim().replace(/^["']|["']$/g, '')
    if (valor && !process.env[m[1]]) process.env[m[1]] = valor
  }
}

const BREVO = process.env.BREVO_API_KEY
if (!BREVO) { console.error('❌ Falta BREVO_API_KEY.'); process.exit(1) }

const LISTA = 8          // Comunidad - activos (se reescribe sola)
const EXCLUIR = 7        // Compradores del curso — EXCLUIR de campañas
const REMITENTE = { name: 'Periodistas Digitales', email: 'jose@sistemadeingresosdiariosia.com' }

const api = (ruta, opciones = {}) =>
  fetch('https://api.brevo.com/v3' + ruta, {
    ...opciones,
    headers: { 'api-key': BREVO, accept: 'application/json', 'content-type': 'application/json', ...(opciones.headers || {}) },
  })

const args = process.argv.slice(2)

// Programar en vez de mandar al toque. Brevo espera UTC: 15:00 en España son las 13:00 UTC
// en horario de verano. Si se pone mal, sale a una hora que nadie mira y no hay forma de saber
// si lo que falló fue el mail o el horario.
const iProg = args.indexOf('--programar')
const CUANDO = iProg > -1 ? args[iProg + 1] : null
if (iProg > -1) args.splice(iProg, 2)

// ── Paso 2: enviar una campaña ya creada ─────────────────────────────────────
if (args[0] === '--enviar') {
  const id = args[1]
  if (!id) { console.error('Falta el id de la campaña.'); process.exit(1) }

  const antes = await api(`/emailCampaigns/${id}`).then(r => r.json())
  console.log(`\n📤 Va a salir AHORA:`)
  console.log(`   "${antes.subject}"`)
  console.log(`   de: ${antes.sender.name} <${antes.sender.email}>`)
  console.log(`   a la lista ${antes.recipients?.lists} · excluyendo ${antes.recipients?.exclusionLists || '(ninguna)'}`)

  const r = await api(`/emailCampaigns/${id}/sendNow`, { method: 'POST' })
  if (!r.ok) { console.error('🔴 Brevo', r.status, await r.text()); process.exit(1) }

  console.log(`\n✅ Enviada. A partir de acá no se puede frenar.`)
  console.log(`   Verificar en 10 minutos con: /emailCampaigns/${id} → statistics.globalStats`)
  process.exit(0)
}

// ── Paso 1: crear el borrador ────────────────────────────────────────────────
const [archivo, asunto, orden] = args
if (!archivo || !asunto || !orden) {
  console.error('Uso: node scripts/publicar/crear-campana-comunidad.mjs <archivo.html> "<asunto>" <orden>')
  process.exit(1)
}

// Una lista vacía no da error: manda a nadie y devuelve 200. Se chequea antes.
const lista = await api(`/contacts/lists/${LISTA}`).then(r => r.json())
if (!lista.totalSubscribers) {
  console.error(`❌ La lista ${LISTA} está VACÍA. Correr primero sincronizar-audiencia-comunidad.mjs --aplicar`)
  process.exit(1)
}

const html = readFileSync(resolve(archivo), 'utf-8')
const n = String(orden).padStart(2, '0')

const r = await api('/emailCampaigns', {
  method: 'POST',
  body: JSON.stringify({
    name: `comunidad-${n} · ${asunto}`,
    subject: asunto,
    sender: REMITENTE,
    htmlContent: html,
    recipients: { listIds: [LISTA], exclusionListIds: [EXCLUIR] },
    ...(CUANDO ? { scheduledAt: CUANDO } : {}),
    // ⚠️ Sin `tag`: el plan Starter de Brevo lo rechaza con 405 ("not allowed to avail tag
    // option"). La atribución de cada evento va por el NÚMERO DE CAMPAÑA (`brevo_camp_id` en
    // funnel_steps), que además nadie puede editar sin querer — a diferencia del asunto, que
    // fue el intento anterior y no podía funcionar.
    inlineImageActivation: false,
  }),
})

const cuerpo = await r.json()
if (!r.ok) { console.error('🔴 Brevo', r.status, cuerpo); process.exit(1) }

console.log(`\n✅ Borrador creado — id ${cuerpo.id}`)
console.log(`   asunto:    ${asunto}`)
console.log(`   de:        ${REMITENTE.name} <${REMITENTE.email}>`)
console.log(`   a:         lista ${LISTA} (${lista.totalSubscribers} contactos · ${lista.totalBlacklisted} de baja)`)
console.log(`   excluye:   lista ${EXCLUIR} (compradores)`)
console.log(`   sin etiqueta: el plan Starter no la permite; se atribuye por el id de campaña`)
if (CUANDO) {
  const d = new Date(CUANDO)
  // hour12:false a propósito: sin eso, las 15:00 se imprimían como "03:00" y parecía que el
  // mail salía de madrugada. La hora hay que verificarla igual contra Brevo (campo scheduledAt).
  console.log(`   ⏰ PROGRAMADA: ${d.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', hour12: false })} España · ${d.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false })} Argentina`)
}
console.log(`\n   Todavía NO salió. Para enviarla:`)
console.log(`   node scripts/publicar/crear-campana-comunidad.mjs --enviar ${cuerpo.id}`)
console.log(`\n   Y anotar el id ${cuerpo.id} en funnel_steps.brevo_camp_id, o el panel va a mostrar CERO.`)
