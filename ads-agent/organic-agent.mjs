/**
 * organic-agent.mjs — Genera calendario de contenido orgánico
 * Crea 7 días de posts para Instagram y Facebook con copy + prompt de imagen.
 * Uso: node organic-agent.mjs [--days=7] [--platform=instagram|facebook|both]
 * Variables: ANTHROPIC_API_KEY, FAL_API_KEY (opcional, para generar imágenes)
 */

import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { generateImage, downloadImage } from './lib/fal.mjs'
import { BRAND } from './lib/brand-context.mjs'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Falta ANTHROPIC_API_KEY')
  process.exit(1)
}

const args        = process.argv.slice(2)
const days        = parseInt(args.find(a => a.startsWith('--days='))?.split('=')[1] || '7')
const platform    = args.find(a => a.startsWith('--platform='))?.split('=')[1] || 'both'
const genImages   = args.includes('--images') && !!process.env.FAL_API_KEY

// ─── Tipos de contenido para el calendario ────────────────────────────────────

const CONTENT_TYPES = [
  {
    type: 'educativo',
    description: 'Tip práctico de IA aplicado al periodismo. Algo que puedan usar hoy.',
    cta: 'Guardar para usarlo esta semana',
    format: 'Carrusel o imagen con texto',
  },
  {
    type: 'inspiracional',
    description: 'Historia real o reflexión sobre el periodismo digital. Qué está cambiando y cómo los periodistas se adaptan.',
    cta: 'Comentar qué piensan',
    format: 'Imagen editorial + copy largo',
  },
  {
    type: 'prueba-social',
    description: 'Resultado de un alumno o dato del sistema. Conciso y específico.',
    cta: 'Ver el sistema completo (link en bio)',
    format: 'Imagen simple con estadística o cita',
  },
  {
    type: 'problema-consciente',
    description: 'Activar el dolor del periodista: inseguridad laboral, bajo sueldo, dependencia de la redacción. Sin vender nada todavía.',
    cta: 'Compartir si se identifican',
    format: 'Texto puro o imagen con pregunta',
  },
  {
    type: 'venta-suave',
    description: 'Mostrar el producto naturalmente dentro de contenido de valor. No un ad disfrazado — contenido real con mención del sistema.',
    cta: 'Link en bio para ver el sistema completo',
    format: 'Imagen del producto o proceso',
  },
  {
    type: 'ia-periodismo',
    description: 'Prompt de IA específico para periodistas. Copiable y aplicable inmediatamente a su trabajo diario.',
    cta: 'Guardar este prompt',
    format: 'Imagen tipo "código" o captura de pantalla',
  },
  {
    type: 'mito-verdad',
    description: 'Derribar un mito sobre la IA o sobre emprender como periodista. Formato confrontacional pero constructivo.',
    cta: 'Comentar si estaban de acuerdo con el mito',
    format: 'Carrusel o split image',
  },
]

// ─── Generar posts ────────────────────────────────────────────────────────────

async function generatePost(dayNum, contentType, platforms) {
  const platformText = platforms === 'both'
    ? 'Instagram y Facebook'
    : platforms === 'instagram' ? 'Instagram' : 'Facebook'

  const prompt = `Sos el community manager de José Fiaccini, creador del Sistema de Ingresos Diarios para Periodistas.
Tu audiencia: periodistas latinoamericanos de 30-55 años que siguen la cuenta en busca de consejos sobre IA y periodismo digital.
Escribís en español latinoamericano, con voz cercana, directa y sin corporativismo.

MARCA:
- Producto: ${BRAND.product} ($${BRAND.price} USD)
- Propuesta: crear un periódico digital con IA y generar ingresos propios
- Prueba social: +5.500 periodistas en 50 países
- Diferencial: incluye 1 mes de Leadr (plataforma exclusiva de IA para periodistas)

POST A CREAR:
- Día: ${dayNum} del calendario
- Plataforma: ${platformText}
- Tipo: ${contentType.type}
- Descripción: ${contentType.description}
- CTA sugerido: ${contentType.cta}
- Formato visual: ${contentType.format}

GENERÁ:

### COPY DEL POST
(listo para publicar, con saltos de línea como aparecerían en el post, hashtags al final si aplica)

### PROMPT DE IMAGEN
(en inglés, para generar con Flux/Midjourney — descriptivo, específico, sin texto en la imagen)

### NOTAS DE PUBLICACIÓN
(mejor horario, si es carrusel cuántas slides, tip de engagement)

Respondé con las 3 secciones claramente separadas. Solo el contenido, sin meta-comentarios.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 900,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].text
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📱 ORGANIC AGENT — Generando calendario de contenido')
console.log(`   Días: ${days} | Plataforma: ${platform} | Imágenes: ${genImages ? 'sí' : 'no (agregar --images para generar)'}`)
console.log()

const today    = new Date()
const outDir   = `organic/${today.toISOString().slice(0, 10)}`
mkdirSync(outDir, { recursive: true })

const calendar = []

for (let i = 0; i < days; i++) {
  const contentType = CONTENT_TYPES[i % CONTENT_TYPES.length]
  const date        = new Date(today)
  date.setDate(date.getDate() + i)
  const dateStr     = date.toISOString().slice(0, 10)

  process.stdout.write(`  Día ${i + 1} (${dateStr}) — ${contentType.type}...`)

  const content = await generatePost(i + 1, contentType, platform)

  // Extraer secciones del contenido
  const sections = content.split(/###\s+/)
  const copy     = sections.find(s => s.startsWith('COPY'))?.replace(/^COPY.*\n/, '').trim() || content
  const imgPrompt = sections.find(s => s.startsWith('PROMPT'))?.replace(/^PROMPT.*\n/, '').trim() || ''
  const notes    = sections.find(s => s.startsWith('NOTAS'))?.replace(/^NOTAS.*\n/, '').trim() || ''

  const post = {
    day:      i + 1,
    date:     dateStr,
    type:     contentType.type,
    platform,
    copy,
    imagePrompt: imgPrompt,
    notes,
    imageUrl: null,
  }

  // Generar imagen si se pidió
  if (genImages && imgPrompt) {
    try {
      process.stdout.write(' [generando imagen]')
      const imageUrl = await generateImage(imgPrompt, { size: 'square_hd', steps: 20 })
      const imgBuffer = await downloadImage(imageUrl)
      const imgPath   = `${outDir}/dia-${String(i + 1).padStart(2, '0')}-imagen.jpg`
      require('fs').writeFileSync(imgPath, imgBuffer)
      post.imageUrl = imgPath
    } catch (e) {
      console.error(' [error imagen: ' + e.message + ']')
    }
  }

  // Guardar post individual
  const postPath = `${outDir}/dia-${String(i + 1).padStart(2, '0')}-${contentType.type}.md`
  writeFileSync(postPath, [
    `# Día ${i + 1} — ${dateStr}`,
    `**Tipo:** ${contentType.type} | **Plataforma:** ${platform}`,
    '',
    '## Copy',
    copy,
    '',
    '## Prompt de imagen',
    imgPrompt,
    '',
    '## Notas',
    notes,
  ].join('\n'))

  calendar.push(post)
  console.log(' ✅')
}

// Guardar calendario completo
writeFileSync(`${outDir}/calendario.json`, JSON.stringify(calendar, null, 2))

// Resumen visual
console.log('\n' + '═'.repeat(60))
console.log('CALENDARIO GENERADO')
console.log('═'.repeat(60))
calendar.forEach(p => {
  console.log(`  ${p.date}  Día ${p.day}  ${p.type.padEnd(20)} ${p.imageUrl ? '📸' : ''}`)
})
console.log(`\n📁 Guardado en: ${outDir}/`)
console.log('\n👉 Próximo paso: revisá los posts, ajustá lo que no suene a tu voz, y programalos en Meta Business Suite.')
console.log('   Para generar con imágenes: node organic-agent.mjs --images')
