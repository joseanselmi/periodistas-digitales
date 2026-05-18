/**
 * send-email.mjs — Sofía envía campañas de email via Brevo
 *
 * Uso:
 *   node send-email.mjs --campaign leadr-l1
 *   node send-email.mjs --campaign leadr-l2
 *   node send-email.mjs --campaign leadr-l3
 *   node send-email.mjs --campaign post-compra-1  (para pruebas)
 *
 * Variables de entorno:
 *   BREVO_API_KEY  — del .env.local
 *
 * Contactos:
 *   Poner el CSV de Hotmart en: ads-agent/emails/compradores.csv
 *   Formato esperado: email,nombre  (primera fila = encabezado)
 *
 * Ejemplo:
 *   $env:BREVO_API_KEY = "xkeysib-..."
 *   node send-email.mjs --campaign leadr-l1
 */

import { readFileSync, existsSync, writeFileSync, appendFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_URL     = 'https://api.brevo.com/v3/smtp/email'

if (!BREVO_API_KEY) {
  console.error('❌ Falta BREVO_API_KEY')
  process.exit(1)
}

const campaignArg = process.argv.find((a, i) => process.argv[i - 1] === '--campaign')
if (!campaignArg) {
  console.error('❌ Uso: node send-email.mjs --campaign [leadr-l1|leadr-l2|leadr-l3] [--limit 100] [--offset 0]')
  process.exit(1)
}

const limitArg  = process.argv.find((a, i) => process.argv[i - 1] === '--limit')
const offsetArg = process.argv.find((a, i) => process.argv[i - 1] === '--offset')
const LIMIT     = limitArg  ? parseInt(limitArg)  : null
const OFFSET    = offsetArg ? parseInt(offsetArg) : 0

// ─── Remitente ────────────────────────────────────────────────────────────────

const SENDER = {
  name:  'José — Periodistas del Futuro IA',
  email: 'jose@sistemadeingresosdiariosia.com',
}

// ─── Campañas disponibles ─────────────────────────────────────────────────────

const CAMPAIGNS = {

  'leadr-l1': {
    subject:     'Lo que ningún editor te va a decir',
    previewText: 'Pero que todos están sintiendo',
    html: `
<p>Hola,</p>

<p>Hace poco hablamos con una periodista de 47 años de Quito.<br>
19 años en el mismo medio. De las que realmente saben hacer su trabajo.</p>

<p>Nos dijo algo que todavía resuena: <em>"No me preocupa que me echen. Me preocupa no entender qué está pasando."</em></p>

<p>Eso es exactamente lo que está pasando en las redacciones de LATAM ahora mismo.</p>

<p>No es que la IA reemplace periodistas. Es que los periodistas que entienden cómo funciona esto están cubriendo más, publicando más rápido, y consiguiendo oportunidades que antes no existían.</p>

<p>Los que no entienden quedan haciendo las mismas notas de siempre, con menos recursos, esperando que alguien les explique.</p>

<p>Nadie les va a explicar. Esa es la parte que nadie dice en voz alta.</p>

<p>Mañana te contamos qué construimos desde Periodistas Digitales para que no te pase esto.</p>

<p>El equipo de Periodistas Digitales</p>
    `,
    text: `Hola,

Hace poco hablamos con una periodista de 47 años de Quito. 19 años en el mismo medio. De las que realmente saben hacer su trabajo.

Nos dijo algo que todavía resuena: "No me preocupa que me echen. Me preocupa no entender qué está pasando."

Eso es exactamente lo que está pasando en las redacciones de LATAM ahora mismo.

No es que la IA reemplace periodistas. Es que los periodistas que entienden cómo funciona esto están cubriendo más, publicando más rápido, y consiguiendo oportunidades que antes no existían.

Los que no entienden quedan haciendo las mismas notas de siempre, con menos recursos, esperando que alguien les explique.

Nadie les va a explicar. Esa es la parte que nadie dice en voz alta.

Mañana te contamos qué construimos desde Periodistas Digitales para que no te pase esto.

El equipo de Periodistas Digitales`,
  },

  'leadr-l2': {
    subject:     'Lo que construimos en Periodistas Digitales',
    previewText: 'Y por qué es para vos',
    html: `
<p>Hola,</p>

<p>Ayer te hablamos de algo que está pasando en silencio en el periodismo de LATAM.</p>

<p>Hoy te contamos qué hicimos al respecto.</p>

<p>En Periodistas Digitales construimos <strong>Leadr</strong>.</p>

<p>Es la plataforma que queríamos que existiera y no existía. Para que ningún periodista tenga que buscar "qué herramienta de IA sirve para periodistas" y encontrar resultados en inglés, para otro mercado, con ejemplos que no tienen nada que ver con nuestra realidad.</p>

<p>Adentro hay dos cosas:</p>

<p><strong>Una enciclopedia completa de periodismo digital con IA.</strong><br>
Todo en español, con ejemplos reales de Colombia, Ecuador, México, Argentina. Desde cómo trabajar con Claude hasta cómo automatizar tu publicación sin tocar código.</p>

<p><strong>Y actualización semanal.</strong><br>
Cada semana filtramos lo más útil que apareció: la herramienta nueva que vale la pena, el cambio de algoritmo que te afecta, el caso real de un periodista de la región que lo está usando bien. Vos abrís Leadr y ya está. No tenés que buscar nada.</p>

<p>Mañana te contamos por qué te estamos escribiendo esto a vos específicamente.</p>

<p>El equipo de Periodistas Digitales</p>
    `,
    text: `Hola,

Ayer te hablamos de algo que está pasando en silencio en el periodismo de LATAM.

Hoy te contamos qué hicimos al respecto.

En Periodistas Digitales construimos Leadr.

Es la plataforma que queríamos que existiera y no existía. Para que ningún periodista tenga que buscar "qué herramienta de IA sirve para periodistas" y encontrar resultados en inglés, para otro mercado, con ejemplos que no tienen nada que ver con nuestra realidad.

Adentro hay dos cosas:

Una enciclopedia completa de periodismo digital con IA. Todo en español, con ejemplos reales de Colombia, Ecuador, México, Argentina. Desde cómo trabajar con Claude hasta cómo automatizar tu publicación sin tocar código.

Y actualización semanal. Cada semana filtramos lo más útil que apareció: la herramienta nueva que vale la pena, el cambio de algoritmo que te afecta, el caso real de un periodista de la región que lo está usando bien. Vos abrís Leadr y ya está. No tenés que buscar nada.

Mañana te contamos por qué te estamos escribiendo esto a vos específicamente.

El equipo de Periodistas Digitales`,
  },

  'leadr-l3-fix': {
    subject:     'El link para activar tu acceso a Leadr',
    previewText: 'El de ayer no funcionaba bien — este sí',
    html: `
<p>Hola,</p>

<p>En el email de ayer te mandé un link para activar tu mes gratis de Leadr que no llevaba al lugar correcto. Te pido disculpas.</p>

<p>El link correcto es este:</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito a Leadr</a></strong></p>

<p>Entrás, creás tu cuenta con este mismo email, y el acceso Pro de 30 días se activa automáticamente. Sin tarjeta, sin compromiso.</p>

<p>Válido hasta el 31 de mayo.</p>

<p>José</p>
    `,
    text: `Hola,

En el email de ayer te mandé un link para activar tu mes gratis de Leadr que no llevaba al lugar correcto. Te pido disculpas.

El link correcto es este:
https://leadr.cloud/activar

Entrás, creás tu cuenta con este mismo email, y el acceso Pro de 30 días se activa automáticamente. Sin tarjeta, sin compromiso.

Válido hasta el 31 de mayo.

José`,
  },

  'leadr-l3': {
    subject:     'Tu regalo de Periodistas Digitales',
    previewText: 'Por ser parte de la academia desde el principio',
    html: `
<p>Hola,</p>

<p>Desde Periodistas Digitales sacamos nuestra nueva herramienta: <strong>Leadr</strong>.</p>

<p>Y decidimos dársela primero a los que confiaron en nosotros desde el principio.</p>

<p>Vos compraste el curso. Eso cuenta.</p>

<p>Por eso tenés 30 días gratis en Leadr. Sin tarjeta. Sin formularios. Sin compromiso.</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>

<p>Tenés hasta el 31 de mayo.</p>

<p>Sofía Castañon<br>
<small style="color:#94a3b8;">Directora de Marketing — Periodistas Digitales</small></p>

<p><small>PD: Si ya activaste, ignorá este email. Gracias.</small></p>
    `,
    text: `Hola,

Desde Periodistas Digitales sacamos nuestra nueva herramienta: Leadr.

Y decidimos dársela primero a los que confiaron en nosotros desde el principio.

Vos compraste el curso. Eso cuenta.

Por eso tenés 30 días gratis en Leadr. Sin tarjeta. Sin formularios. Sin compromiso.

→ leadr.cloud/activar

Tenés hasta el 31 de mayo.

Sofía Castañon
Directora de Marketing — Periodistas Digitales

PD: Si ya activaste, ignorá este email. Gracias.`,
  },

  'leadr-l4': {
    subject:     'Sacamos algo nuevo. Y es para vos.',
    previewText: 'Por ser parte de la academia desde el principio',
    html: `
<p>Hola,</p>

<p>Desde Periodistas Digitales estuvimos construyendo algo.</p>

<p>Se llama <strong>Leadr</strong>.</p>

<p>Es la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.</p>

<p>Decidimos dársela primero a los que confiaron en nosotros desde el principio.</p>

<p>Vos compraste el curso. Eso cuenta.</p>

<p>30 días gratis. Sin tarjeta. Sin formularios.</p>

<p style="font-size:18px;"><strong><a href="https://leadr.cloud/activar" style="color:#6366f1;">→ Activar mi acceso gratuito</a></strong></p>

<p>Válido hasta el 31 de mayo.</p>

<p>El equipo de Periodistas Digitales</p>

<p><small>PD: Si ya activaste, ignorá este email. Gracias.</small></p>
    `,
    text: `Hola,

Desde Periodistas Digitales estuvimos construyendo algo.

Se llama Leadr.

Es la plataforma de IA para periodistas que queríamos que existiera y no existía. Todo en español. Todo para el trabajo real de cubrir, investigar y publicar.

Decidimos dársela primero a los que confiaron en nosotros desde el principio.

Vos compraste el curso. Eso cuenta.

30 días gratis. Sin tarjeta. Sin formularios.

→ leadr.cloud/activar

Válido hasta el 31 de mayo.

El equipo de Periodistas Digitales

PD: Si ya activaste, ignorá este email. Gracias.`,
  },

}

// ─── Leer contactos del CSV ───────────────────────────────────────────────────

function leerContactos() {
  const csvPath = resolve('emails/compradores.csv')

  if (!existsSync(csvPath)) {
    console.error(`❌ No se encontró el archivo de contactos: emails/compradores.csv`)
    console.error(`   Exportá la lista de Hotmart y guardala ahí.`)
    console.error(`   Formato: email,nombre (primera fila = encabezado)`)
    process.exit(1)
  }

  const lines = readFileSync(csvPath, 'utf-8').trim().split('\n')
  const contactos = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split(',')
    const email = parts[0]?.trim().replace(/"/g, '')
    const nombre = parts[1]?.trim().replace(/"/g, '') || ''

    if (email && email.includes('@')) {
      contactos.push({ email, nombre })
    }
  }

  return contactos
}

// ─── Enviar un email ──────────────────────────────────────────────────────────

async function enviarEmail(contacto, campaign) {
  const payload = {
    sender: SENDER,
    to: [{ email: contacto.email, name: contacto.nombre }],
    subject: campaign.subject,
    htmlContent: campaign.html,
    textContent: campaign.text,
    headers: {
      'X-Mailin-custom': 'leadr-launch',
    },
  }

  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'accept':       'application/json',
      'api-key':      BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`)
  }

  return data.messageId
}

// ─── Log de resultados ────────────────────────────────────────────────────────

function logResultado(campaignName, contacto, ok, detalle) {
  const logPath = resolve(`emails/log-${campaignName}.csv`)
  const fecha   = new Date().toISOString()
  const linea   = `${fecha},${contacto.email},${contacto.nombre},${ok ? 'OK' : 'ERROR'},${detalle}\n`

  if (!existsSync(logPath)) {
    writeFileSync(logPath, 'fecha,email,nombre,estado,detalle\n')
  }
  appendFileSync(logPath, linea)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const campaign = CAMPAIGNS[campaignArg]

  if (!campaign) {
    console.error(`❌ Campaña desconocida: ${campaignArg}`)
    console.error(`   Opciones: ${Object.keys(CAMPAIGNS).join(', ')}`)
    process.exit(1)
  }

  let contactos = leerContactos()
  if (OFFSET > 0) contactos = contactos.slice(OFFSET)
  if (LIMIT)      contactos = contactos.slice(0, LIMIT)

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`📧 SOFÍA — Enviando campaña: ${campaignArg}`)
  console.log(`   Asunto: "${campaign.subject}"`)
  console.log(`   Contactos: ${contactos.length}`)
  console.log(`${'═'.repeat(60)}\n`)

  let ok = 0
  let errores = 0

  for (let i = 0; i < contactos.length; i++) {
    const contacto = contactos[i]
    process.stdout.write(`  [${i + 1}/${contactos.length}] ${contacto.email}... `)

    try {
      const msgId = await enviarEmail(contacto, campaign)
      console.log(`✅`)
      logResultado(campaignArg, contacto, true, msgId)
      ok++
    } catch (err) {
      console.log(`❌ ${err.message}`)
      logResultado(campaignArg, contacto, false, err.message)
      errores++
    }

    // Pausa entre envíos para no gatillar filtros de spam
    if (i < contactos.length - 1) {
      await new Promise(r => setTimeout(r, 300))
    }
  }

  // Actualizar campaign-state.json
  const statePath = resolve('emails/campaign-state.json')
  if (existsSync(statePath)) {
    const state = JSON.parse(readFileSync(statePath, 'utf-8'))
    const paso  = state.secuencia.find(s => s.id === campaignArg)
    if (paso) {
      paso.enviados     += ok
      paso.errores      += errores
      paso.fecha_envio   = new Date().toISOString().slice(0, 10)
      if (!LIMIT || OFFSET + contactos.length >= state.total_contactos) {
        paso.completado = true
        const idx = state.secuencia.indexOf(paso)
        state.proximo_paso = state.secuencia[idx + 1]?.id ?? 'completado'
      }
      if (state.total_contactos === 0) state.total_contactos = contactos.length
      state.notas.push(`${new Date().toISOString().slice(0, 10)}: ${campaignArg} — ${ok} enviados, ${errores} errores`)
      writeFileSync(statePath, JSON.stringify(state, null, 2))
      console.log(`📊 Estado actualizado: emails/campaign-state.json`)
    }
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`RESUMEN`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`✅ Enviados: ${ok}`)
  console.log(`❌ Errores:  ${errores}`)
  console.log(`📄 Log: emails/log-${campaignArg}.csv`)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message)
  process.exit(1)
})
