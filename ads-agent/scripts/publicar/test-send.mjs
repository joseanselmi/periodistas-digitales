import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Las claves viven en el .env.local de Leadr (el único proyecto que las tiene
// todas). Se probaron varias rutas porque Leadr se mudó a la carpeta hermana.
for (const ruta of ['../Leadr/app/.env.local', '../../Leadr/app/.env.local', '.env.local', '../.env.local']) {
  const p = resolve(process.cwd(), ruta)
  if (!existsSync(p)) continue
  for (const linea of readFileSync(p, 'utf-8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) process.env[m[1]] ??= m[2].trim().replace(/^["']|["']$/g, '')
  }
}

// NUNCA hardcodear la clave acá: este archivo está en un repo. La versión con la
// clave escrita a mano hizo que GitHub bloqueara el push entero (31/07/2026).
const API_KEY = process.env.BREVO_API_KEY
if (!API_KEY) { console.error('❌ Falta BREVO_API_KEY (mirá ../Leadr/app/.env.local)'); process.exit(1) }
const TO_EMAIL = process.argv[2]
const CAMPAIGN = process.argv[3] ?? 'leadr-l3'

if (!TO_EMAIL) { console.error('Uso: node scripts/publicar/test-send.mjs email@ejemplo.com [campaña]'); process.exit(1) }

// Importar campañas desde send-email.mjs dinámicamente
// Por simplicidad, definimos solo L3 acá
const html = `<p>Hola,</p>

<p>Cuando compraste el Sistema de Ingresos Diarios, tomaste una decisión que la mayoría de tus colegas no tomó.</p>

<p>Por eso quiero darte acceso completo a Leadr, gratis, durante un mes entero.</p>

<p>Sin tarjeta. Sin formularios largos. Sin compromiso.</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>

<p>Tenés hasta el 31 de mayo. Después de esa fecha el acceso gratuito cierra.</p>

<p>Esta semana adentro hay:</p>

<p>— Cómo usar NotebookLM para preparar una cobertura en la mitad del tiempo que te lleva hoy</p>

<p>— El prompt exacto que convierte una entrevista de una hora en cinco formatos distintos listos para publicar</p>

<p>— Por qué los medios de Ecuador están apostando a WhatsApp Channels y cómo arrancar en menos de una tarde</p>

<p>Entrá, explorá, usalo. Al final del mes decidís si querés seguir. Sin presión.</p>

<p>Sofía Castañon<br>
<small style="color:#94a3b8;">Directora de Marketing — Leadr</small></p>

<p><small>PD: Si ya activaste tu acceso, ignorá este email.</small></p>`

const res = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'api-key': API_KEY,
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    sender: { name: 'José — Periodistas del Futuro IA', email: 'jose@sistemadeingresosdiariosia.com' },
    to: [{ email: TO_EMAIL, name: 'Test' }],
    subject: '[TEST] Tu acceso gratuito vence el 31 de mayo',
    htmlContent: html,
  }),
})

const data = await res.json()
if (res.ok) {
  console.log(`✅ Enviado a ${TO_EMAIL} — messageId: ${data.messageId}`)
} else {
  console.error(`❌ Error: ${JSON.stringify(data)}`)
}
