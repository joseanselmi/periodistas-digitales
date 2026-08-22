/**
 * enviar-prueba.mjs — manda UN mail de prueba a una dirección, para verlo en la bandeja antes
 * de crear la campaña.
 *
 * ⚠️ ESTE SCRIPT ENVÍA DE VERDAD (por eso vive en scripts/publicar/). Pero sólo a la dirección
 * que se le pasa a mano: no lee listas, no toca Brevo más allá del envío y no puede alcanzar a un
 * contacto por accidente.
 *
 * Uso (parado en ads-agent/):
 *   node scripts/publicar/enviar-prueba.mjs <archivo.html> <destinatario> "<asunto>"
 *
 * Va por la API transaccional, no como campaña. Dos consecuencias que hay que saber al mirarlo:
 *   · el `{{ unsubscribe }}` del pie NO se resuelve — se ve el texto literal. En la campaña real sí.
 *   · no cuenta en las métricas de ninguna campaña, así que probar no ensucia los números.
 *
 * Necesita BREVO_API_KEY (vive en ../sistema-ingresos/.env.local).
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

const [archivo, destino, asunto] = process.argv.slice(2)
if (!archivo || !destino || !asunto) {
  console.error('Uso: node scripts/publicar/enviar-prueba.mjs <archivo.html> <destinatario> "<asunto>"')
  process.exit(1)
}
if (!process.env.BREVO_API_KEY) {
  console.error('❌ Falta BREVO_API_KEY (vive en sistema-ingresos/.env.local).')
  process.exit(1)
}

const html = readFileSync(resolve(archivo), 'utf-8')

// Quién firma. El NOMBRE se puede cambiar libremente; lo que Brevo tiene verificado es la
// DIRECCIÓN, y esa no se toca: la reputación del dominio y si cae o no en spam cuelgan de ahí.
// Decidido el 22/08/2026: el canal Comunidad sale como 'Periodistas Digitales' — el MISMO
// nombre con el que salen las campanas de verdad. Si la prueba firma distinto, no se esta
// probando lo que va a ver la gente.
const REMITENTE = { name: 'Periodistas Digitales', email: 'jose@sistemadeingresosdiariosia.com' }

const r = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: { 'api-key': process.env.BREVO_API_KEY, accept: 'application/json', 'content-type': 'application/json' },
  body: JSON.stringify({
    sender: REMITENTE,
    to: [{ email: destino }],
    subject: `[PRUEBA] ${asunto}`,
    htmlContent: html,
    // Sin etiqueta de campaña a propósito: una prueba no tiene que aparecer en las métricas
    // de nada. Ver `comunicaciones_email`, donde cada fila es un envío de verdad.
  }),
})

const cuerpo = await r.json()
if (!r.ok) {
  console.error('🔴 Brevo', r.status, cuerpo)
  process.exit(1)
}

console.log(`✅ Prueba enviada a ${destino}`)
console.log(`   asunto: [PRUEBA] ${asunto}`)
console.log(`   messageId: ${cuerpo.messageId}`)
console.log('\n   Ojo al mirarlo: el link de baja del pie va a decir "{{ unsubscribe }}" tal cual.')
console.log('   Eso es normal en una prueba transaccional; en la campaña real se convierte en el link.')
