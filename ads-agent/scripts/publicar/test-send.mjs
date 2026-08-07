/**
 * test-send.mjs — Manda UN email a la dirección que le pases, con el texto REAL
 * de una campaña, para ver cómo llega antes de mandárselo a la lista entera.
 *
 * Uso:  cd ads-agent
 *       node scripts/publicar/test-send.mjs vos@ejemplo.com [campaña]
 *       node scripts/publicar/test-send.mjs --lista      ← ver las campañas
 *
 * ⚠️ MANDA UN MAIL DE VERDAD, por Brevo, a la dirección que escribas. No hay
 * casilla de prueba ni modo simulación: si ponés la dirección de un cliente, le
 * llega. Poné la tuya.
 *
 * El texto sale de CAMPAIGNS en send-email.mjs — el mismo que se le manda a la
 * lista. Hasta el 2026-08-01 tenía su propia copia pegada acá, congelada en
 * mayo ("tenés hasta el 31 de mayo"), y el argumento de campaña se leía pero no
 * se usaba: probar el envío mandaba una oferta vencida hacía meses.
 */

import { CAMPAIGNS } from './send-email.mjs'
import { cargarEnv } from '../../lib/env.mjs'

const TO_EMAIL = process.argv[2]
const CAMPAIGN = process.argv[3] ?? 'leadr-l3'
const nombres = Object.keys(CAMPAIGNS)

// Listar no manda nada ni toca la red, así que va ANTES de pedir la clave.
if (TO_EMAIL === '--lista') {
  console.log('\nCampañas disponibles:\n')
  for (const n of nombres) console.log(`  ${n.padEnd(30)} ${CAMPAIGNS[n].subject}`)
  console.log()
  process.exit(0)
}

if (!TO_EMAIL || !TO_EMAIL.includes('@')) {
  console.error('Uso: node scripts/publicar/test-send.mjs vos@ejemplo.com [campaña]')
  console.error('     node scripts/publicar/test-send.mjs --lista')
  process.exit(1)
}

// NUNCA escribir la clave acá: este archivo está en un repo público. La versión
// con la clave pegada a mano hizo que GitHub bloqueara el push entero (31/07/2026).
cargarEnv(['BREVO_API_KEY'])
const API_KEY = process.env.BREVO_API_KEY

const camp = CAMPAIGNS[CAMPAIGN]
if (!camp) {
  console.error(`❌ No existe la campaña "${CAMPAIGN}".`)
  console.error(`   Hay ${nombres.length}: ${nombres.join(', ')}`)
  process.exit(1)
}

console.log(`📧 Mandando "${CAMPAIGN}" a ${TO_EMAIL}`)
console.log(`   Asunto real: ${camp.subject}`)

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'api-key': API_KEY,
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    sender: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
    to: [{ email: TO_EMAIL, name: 'Prueba' }],
    // El [PRUEBA] va adelante para que se distinga en la casilla, pero el resto
    // del asunto es el real: si se acorta o se rompe en el móvil, hay que verlo acá.
    subject: `[PRUEBA] ${camp.subject}`,
    htmlContent: camp.html,
  }),
})

const data = await res.json()
if (res.ok) {
  console.log(`✅ Enviado — messageId: ${data.messageId}`)
  console.log('   Si no llega en 2 minutos, mirá spam y después los eventos en Brevo.')
} else {
  console.error(`❌ Brevo lo rechazó: ${JSON.stringify(data)}`)
  process.exit(1)
}
