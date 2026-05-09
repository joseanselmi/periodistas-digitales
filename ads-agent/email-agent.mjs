/**
 * email-agent.mjs — Genera secuencia de emails post-compra
 * Crea 5 emails listos para cargar en Hotmart o cualquier ESP.
 * Uso: node email-agent.mjs
 * Variables: ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { BRAND } from './lib/brand-context.mjs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Falta ANTHROPIC_API_KEY')
  process.exit(1)
}

const SEQUENCE = [
  {
    day: 0,
    id: 'bienvenida',
    subject: '¡Ya tenés acceso! Esto es lo primero que tenés que hacer',
    objetivo: 'Activar al alumno inmediatamente. Que entre al curso en los próximos 30 minutos. Crear sensación de que tomó la decisión correcta. Mencionar Leadr como bonus exclusivo que otros no tienen.',
    tono: 'Cálido, cercano, celebratorio pero sin exagerar. Como un mentor que ya pasó por esto.',
  },
  {
    day: 1,
    id: 'dia-1',
    subject: '¿Ya elegiste tu nicho? (esto es lo más importante del Módulo 1)',
    objetivo: 'Empujar al alumno a completar el Módulo 1. Reducir la fricción del "por dónde empiezo". Dar un consejo concreto sobre cómo elegir el nicho periodístico. Crear anticipación por el Módulo 2.',
    tono: 'Práctico, directo. Como un colega que ya lo hizo y te da el atajo.',
  },
  {
    day: 3,
    id: 'dia-3',
    subject: 'En 24 horas tenés tu periódico digital (Módulo 2 desbloqueado)',
    objetivo: 'El Módulo 2 promete el periódico en 24hs. Este email cumple esa promesa y acompaña el proceso. Dar el paso a paso en el email para que sientan progreso aunque no hayan abierto el curso. Mencionar los templates de Canva del Bono 2.',
    tono: 'Energizante. Este es el momento de mayor entusiasmo del alumno. Mantenerlo.',
  },
  {
    day: 7,
    id: 'dia-7',
    subject: 'Semana 1 completa. ¿Qué lograste?',
    objetivo: 'Check-in de progreso. Preguntar dónde están. Mostrar que otros ya tienen resultados en la semana 1. Reducir abandono. Recordar la garantía de 7 días (último día) — no para que pidan reembolso sino para reforzar que la decisión fue correcta. Empujar al Módulo 3 (contenido diario con IA).',
    tono: 'Honesto y empático. Reconocer que la primera semana es la más difícil.',
  },
  {
    day: 14,
    id: 'dia-14',
    subject: 'Los periodistas que más avanzan tienen esto en común',
    objetivo: 'Email de monetización y comunidad. Hablar del Módulo 4 (ingresos). Hacer el pitch suave de Leadr Pro (más allá del mes gratis del bono). Mostrar qué consiguen los alumnos que están en la comunidad activa. No es un email de venta dura — es inspiración con CTA claro.',
    tono: 'Aspiracional. Este es el momento de mostrar el resultado final posible.',
  },
]

async function generateEmail(email) {
  const prompt = `Sos José Fiaccini, periodista argentino, creador del Sistema de Ingresos Diarios para Periodistas.
Acabás de vender tu curso a un periodista latinoamericano de 35-55 años por $17 USD.
Escribís en español latinoamericano, usás "vos" (no "tú"), sos cercano pero profesional.

PRODUCTO:
- Sistema de Ingresos Diarios para Periodistas ($17 USD)
- Incluye: 5 módulos + Bono IA + Canva +100 plantillas + Leadr 1 mes gratis
- Landing: ${BRAND.landingUrl}
- Hotmart checkout: ${BRAND.hotmartUrl}

EMAIL A ESCRIBIR:
- Día: ${email.day} post-compra
- ID: ${email.id}
- Asunto: ${email.subject}
- Objetivo: ${email.objetivo}
- Tono: ${email.tono}

INSTRUCCIONES:
1. Escribí el email completo listo para enviar
2. Abrí con un hook fuerte (no con "Hola [nombre]" genérico — usá "[Nombre]" como placeholder pero el resto tiene que enganchar)
3. Entre 150-250 palabras — emails cortos convierten mejor
4. Un solo CTA claro al final con URL placeholder [URL_ACCESO_CURSO]
5. Firma como José Fiaccini
6. NO uses emojis en exceso — máximo 1-2 por email
7. Usá párrafos cortos (2-3 líneas máximo)

Respondé SOLO con el email completo, sin explicaciones ni comentarios previos.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📧 EMAIL AGENT — Generando secuencia post-compra\n')

mkdirSync('emails', { recursive: true })

const results = []

for (const email of SEQUENCE) {
  process.stdout.write(`  Generando email día ${email.day} (${email.id})...`)

  const body = await generateEmail(email)

  const output = {
    day:     email.day,
    id:      email.id,
    subject: email.subject,
    body,
    generatedAt: new Date().toISOString(),
  }

  const path = `emails/dia-${String(email.day).padStart(2, '0')}-${email.id}.md`
  writeFileSync(path, `# Email Día ${email.day} — ${email.id}\n\n**Asunto:** ${email.subject}\n\n---\n\n${body}`)

  results.push(output)
  console.log(' ✅')
}

// Guardar secuencia completa como JSON (para importar a ESP)
writeFileSync('emails/secuencia-completa.json', JSON.stringify(results, null, 2))

console.log('\n' + '═'.repeat(55))
console.log('SECUENCIA GENERADA')
console.log('═'.repeat(55))
results.forEach(r => {
  console.log(`  Día ${String(r.day).padStart(2, ' ')}: ${r.subject}`)
})
console.log('\n📁 Archivos guardados en: emails/')
console.log('\n👉 Para cargar en Hotmart:')
console.log('   Hotmart → Productores → Tu producto → Email marketing')
console.log('   Importá cada email con el día de envío correspondiente')
