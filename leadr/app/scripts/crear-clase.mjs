/**
 * crear-clase.mjs — Motor de generación de grupos de clases para Leadr
 *
 * Uso:
 *   node scripts/crear-clase.mjs --config scripts/configs/[nombre-grupo].json
 *
 * Variables de entorno requeridas:
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * El config JSON tiene esta forma:
 * {
 *   "group": { "name": "...", "category": "clases|prompts|automatizaciones|bonus", "createNew": true, "id": null },
 *   "journey": { "from": "...", "to": "..." },
 *   "existingTopics": ["..."],
 *   "classes": [
 *     {
 *       "title": "...",
 *       "prerequisite": "...",
 *       "outcome": "...",
 *       "instruction": "Brief editorial completo (ver /crear-clase skill)"
 *     }
 *   ]
 * }
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─── Configuración ────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY     = process.env.ANTHROPIC_API_KEY
const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!ANTHROPIC_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const configArg = process.argv.find((a, i) => process.argv[i - 1] === '--config')
if (!configArg) {
  console.error('❌ Uso: node scripts/crear-clase.mjs --config scripts/configs/nombre.json')
  process.exit(1)
}

const CONFIG = JSON.parse(readFileSync(resolve(configArg), 'utf-8'))

const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

// ─── Brand Leadr ──────────────────────────────────────────────────────────────

const BRAND = {
  primary:   '#22D3EE',
  secondary: '#7C3AED',
  bg:        '#0F172A',   // slate-900 — distinto al fondo de la página (#020617)
  surface:   '#1E293B',  // slate-800 — superficies internas
  text:      '#F8FAFC',
}

// ─── Prompts del sistema ──────────────────────────────────────────────────────

const ICP_CONTEXT = `
PERFIL DEL ALUMNO (ICP — nunca perder esto de vista):
- Periodista latinoamericano/a de 40-55 años con 10-20 años en medios tradicionales
- Países: Ecuador, Colombia, México, Argentina, Chile, Puerto Rico
- Sin formación técnica — entiende una redacción mejor que un IDE
- El miedo a quedar desactualizado supera al miedo a aprender
- Ya apostó $10 — quiere ver resultados reales, no teoría
- Lo detiene: sentirse tonto, no tener tiempo, "esto no es para mí"
- Lo motiva: mantenerse relevante, poder enseñar a colegas, agregar una habilidad concreta

PRINCIPIOS EDITORIALES OBLIGATORIOS:
1. Tono periodista-a-periodista: nunca "gurú digital", siempre colega que ya lo usó
2. Ejemplos de LATAM: mencionar países, medios o situaciones reales de la región
3. Cero fluff: si una oración puede eliminarse sin perder nada, elimínala
4. Links reales: solo URLs que existen y funcionan (no inventar, no completar con /...)
5. Datos verificables: no inventar estadísticas — si no conocés el dato exacto, no lo pongas
6. Ejercicio real: algo que el periodista puede hacer hoy, en 15-30 minutos, con lo que tiene`

function buildSystemSlides(journey, existingTopics) {
  return `Eres un arquitecto de contenido educativo especializado en periodismo digital. Generás clases para Leadr, una plataforma para periodistas que aprenden IA y herramientas digitales.

${ICP_CONTEXT}

CONTEXTO DEL GRUPO:
- El alumno llega sabiendo: ${journey.from}
- El alumno sale pudiendo: ${journey.to}
- Temas que NO debes tocar (ya cubiertos en Leadr): ${existingTopics.join(', ')}

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

{
  "title": "Título de la clase — habla al periodista, no a la herramienta",
  "description": "2-3 oraciones. Problema → solución → resultado. Sin 'aprenderás', sin 'descubrirás'.",
  "slides": [...]
}

══════════════════════════════════════════════
CAMPO "slides" — Entre 11 y 14 slides obligatorios
══════════════════════════════════════════════

ORDEN OBLIGATORIO:

1. type:"title"
   - heading: título de la clase (mismo que arriba)
   - subheading: subtítulo que promete el resultado concreto, no el proceso

2. type:"checklist"
   - heading: "Qué vas a poder hacer"  (NO "Qué vas a aprender")
   - items: 4-6 objetivos. Formato: verbo de acción + resultado concreto
   - ✗ MAL: "Aprender a usar Make"
   - ✓ BIEN: "Crear un flujo que publique automáticamente en redes cuando subís un artículo"

3. type:"diagram"
   - heading: [concepto central de la clase]
   - subheading: 2-3 oraciones que explican la RELACIÓN entre los nodos (no solo los mencionan)
   - center: concepto central (1-3 palabras)
   - nodes: 4-8 conceptos relacionados (frases cortas, no palabras sueltas)

4. type:"content"
   - heading: "Por qué importa esto ahora"
   - subheading: 3-5 oraciones con dato real o contexto de la industria periodística LATAM
   - Debe crear urgencia o relevancia — por qué el periodista NO puede ignorar esto

5. type:"bullets"
   - heading: [Concepto principal — parte 1]
   - bullets: 3-5 items. Frases completas, no palabras sueltas. Directas, sin relleno.

6. type:"bullets" o type:"content"
   - [Concepto principal — parte 2]
   - Si es content: subheading mínimo 3 oraciones
   - Si es bullets: igual de concreto que el anterior

7. type:"content" o type:"bullets"  (solo si el tema es complejo, sino saltar al 8)
   - [Concepto principal — parte 3]

8. type:"practice"
   - heading: "Ejemplo real" — el caso periodístico concreto
   - steps: 4-6 pasos del proceso real, numerados, con el nombre de la herramienta y acción específica
   - tip: el consejo que marca la diferencia entre hacerlo bien y hacerlo regular

9. type:"errors"
   - heading: "Errores que valen la pena evitar"
   - bullets: 4-5 errores con consecuencia real. Formato: "Error X → consecuencia Y"
   - Basados en errores que realmente cometen periodistas, no en errores teóricos

10. type:"exercise"
    - heading: "Tu ejercicio de hoy"
    - subheading: contexto del ejercicio — qué situación simula
    - task: descripción paso a paso de lo que debe hacer. Específico, sin ambigüedad.
      Debe completarse en 15-30 minutos. Con lo que ya tiene el periodista.

11. type:"resources"
    - heading: "Recursos seleccionados"
    - items: 4-6 recursos. Cada uno debe ser el MEJOR de su categoría.
    - Formato: { "text": "nombre descriptivo del recurso", "url": "https://URL-REAL", "tag": "Video|Herramienta|Guía|Artículo|Comunidad" }
    - SOLO URLs que realmente existen y son relevantes en 2025
    - Incluir al menos 1 herramienta práctica (no solo artículos)

12. type:"bullets"
    - heading: "Para no olvidar"
    - bullets: 4-5 takeaways. Lo que el periodista debe recordar la semana siguiente.
    - Formato: afirmaciones positivas y accionables, no recordatorios teóricos

TIPOS DISPONIBLES: title, content, bullets, checklist, practice, errors, exercise, resources, diagram, quote

REGLAS TRANSVERSALES:
- Nunca dos slides seguidos sin heading
- Nunca un slide que diga "En resumen" o "Conclusión" excepto el último
- Nunca inventar URLs — si no conocés la URL exacta, usá una URL real de alto tráfico del tema
- Todos los ejemplos: periodista en LATAM, situación real, medio creíble`
}

function buildSystemBody() {
  return `Eres un escritor editorial para Leadr, plataforma educativa para periodistas. Escribís el artículo complementario de una clase — es el texto que el alumno lee para profundizar después de ver los slides.

${ICP_CONTEXT}

Devuelve ÚNICAMENTE el HTML del artículo, sin markdown, sin bloques de código, sin explicaciones.

ESTRUCTURA OBLIGATORIA (en este orden, con estas etiquetas exactas):

<h2>Por qué esto importa para tu trabajo</h2>
[Introducción: problema real del periodista + por qué esta clase lo resuelve]
[Mínimo 2 párrafos de 4-5 oraciones cada uno]

<h2>Conceptos clave antes de empezar</h2>
[Definiciones concretas. Sin tecnicismos. Con analogías del mundo periodístico.]
[Usar <h3> para cada concepto principal]
[Mínimo 3 conceptos bien explicados]

<h2>Cómo funciona: paso a paso</h2>
[El proceso completo con <ol><li> para los pasos]
[Cada paso: 2-3 oraciones. Qué hacer + por qué + qué pasa si no lo hacés]
[Mínimo 5 pasos]

<h2>Ejemplo real: [nombre del caso periodístico]</h2>
[Un caso concreto de LATAM. Medio real o situación verosímil.]
[Seguir el mismo ejemplo del slide de práctica pero con mucho más detalle]
[Mínimo 3 párrafos]

<h2>Errores frecuentes (y cómo evitarlos)</h2>
[<ul><li> para cada error]
[Formato por error: <strong>El error</strong> → consecuencia → cómo evitarlo]
[Mínimo 4 errores con su solución]

<h2>Tu ejercicio</h2>
[Instrucciones detalladas del ejercicio del slide]
[Con <ol><li> para los pasos]
[Agregar: qué hacer si algo no funciona, cómo saber si lo hiciste bien]

<h2>Recursos para seguir</h2>
[Los mismos recursos del slide pero con 1 párrafo de descripción de qué encontrará en cada uno]

EXTENSIÓN MÍNIMA: 1000 palabras
TONO: Colega periodista que ya pasó por esto. Sin distancia académica. Sin "gurú".
REGLA: cada párrafo mínimo 3 oraciones. Nada de párrafos de una línea.`
}

// ─── HTML de slides ───────────────────────────────────────────────────────────

function generateSlidesHTML(slides, brand) {
  const b = { ...BRAND, ...brand }

  const slideHTML = slides.map((slide) => {
    let content = ''

    if (slide.type === 'title') {
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:2.5rem;">
          <h1 style="font-size:2.5rem;font-weight:800;color:${b.text};margin-bottom:1.25rem;line-height:1.2;">${slide.heading || slide.title || ''}</h1>
          ${slide.subheading ? `<p style="font-size:1.15rem;color:${b.primary};opacity:0.9;max-width:600px;line-height:1.6;">${slide.subheading}</p>` : ''}
        </div>`

    } else if (slide.type === 'checklist') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.5rem;">${slide.heading || 'Qué vas a poder hacer'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.items || []).map(item => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1.05rem;line-height:1.5;"><span style="color:${b.primary};font-weight:800;flex-shrink:0;font-size:1.1rem;">✓</span><span>${item}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'bullets') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.85;margin-bottom:1.25rem;font-size:1rem;line-height:1.65;">${slide.subheading}</p>` : ''}
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.bullets || slide.items || []).map(item => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1rem;line-height:1.55;"><span style="color:${b.primary};flex-shrink:0;font-size:1.15rem;margin-top:1px;">→</span><span>${item}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'content') {
      content = `
        <div style="padding:2rem;">
          ${slide.heading ? `<h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1rem;">${slide.heading}</h2>` : ''}
          ${slide.subheading ? `<p style="color:${b.text};font-size:1.05rem;line-height:1.75;opacity:0.9;">${slide.subheading}</p>` : ''}
        </div>`

    } else if (slide.type === 'practice') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Ejemplo real'}</h2>
          <ol style="padding:0 0 0 1.35rem;display:flex;flex-direction:column;gap:0.65rem;margin-bottom:1.35rem;">
            ${(slide.steps || []).map(s => `<li style="color:${b.text};font-size:1rem;line-height:1.55;">${s}</li>`).join('')}
          </ol>
          ${slide.tip ? `<div style="background:${b.primary}18;border-left:3px solid ${b.primary};padding:0.875rem 1.1rem;border-radius:0 8px 8px 0;"><span style="color:${b.primary};font-weight:700;">💡 </span><span style="color:${b.text};font-size:0.95rem;">${slide.tip}</span></div>` : ''}
        </div>`

    } else if (slide.type === 'errors') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:#F87171;margin-bottom:1.25rem;">${slide.heading || 'Errores que valen la pena evitar'}</h2>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.875rem;">
            ${(slide.bullets || slide.items || []).map(e => `<li style="display:flex;align-items:flex-start;gap:0.875rem;color:${b.text};font-size:1rem;line-height:1.55;"><span style="color:#F87171;flex-shrink:0;font-weight:800;">✗</span><span>${e}</span></li>`).join('')}
          </ul>
        </div>`

    } else if (slide.type === 'exercise') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.secondary};margin-bottom:1rem;">${slide.heading || 'Tu ejercicio de hoy'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.8;margin-bottom:1.1rem;font-size:1rem;line-height:1.6;">${slide.subheading}</p>` : ''}
          ${slide.task ? `<div style="background:${b.secondary}22;border:1px solid ${b.secondary}44;padding:1.1rem 1.35rem;border-radius:10px;color:${b.text};font-size:1rem;line-height:1.65;">${slide.task}</div>` : ''}
        </div>`

    } else if (slide.type === 'resources') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:1.25rem;">${slide.heading || 'Recursos seleccionados'}</h2>
          <div style="display:flex;flex-direction:column;gap:0.65rem;">
            ${(slide.items || []).map(item => {
              const text = typeof item === 'string' ? item : item.text
              const url  = typeof item === 'string' ? '#' : (item.url || '#')
              const tag  = typeof item === 'string' ? '' : (item.tag || '')
              return `<a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.875rem;padding:0.7rem 1rem;background:${b.surface};border:1px solid rgba(255,255,255,0.1);border-radius:8px;text-decoration:none;color:${b.text};font-size:0.95rem;transition:border-color 0.2s;">
                ${tag ? `<span style="background:${b.primary}22;color:${b.primary};font-size:0.72rem;padding:0.2rem 0.5rem;border-radius:4px;font-weight:700;flex-shrink:0;">${tag}</span>` : ''}
                <span>${text}</span>
              </a>`
            }).join('')}
          </div>
        </div>`

    } else if (slide.type === 'diagram') {
      content = `
        <div style="padding:2rem;">
          <h2 style="font-size:1.75rem;font-weight:700;color:${b.primary};margin-bottom:0.75rem;">${slide.heading || slide.center || 'Mapa conceptual'}</h2>
          ${slide.subheading ? `<p style="color:${b.text};opacity:0.75;margin-bottom:1.35rem;font-size:0.95rem;line-height:1.65;">${slide.subheading}</p>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:0.65rem;align-items:center;">
            <span style="background:${b.primary};color:${b.bg};padding:0.55rem 1.1rem;border-radius:8px;font-weight:800;font-size:0.95rem;">${slide.center || ''}</span>
            ${(slide.nodes || []).map(node => `<span style="background:${b.surface};border:1px solid ${b.primary}44;color:${b.text};padding:0.55rem 1.1rem;border-radius:8px;font-size:0.9rem;">${node}</span>`).join('')}
          </div>
        </div>`

    } else if (slide.type === 'quote') {
      content = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:2.5rem;text-align:center;">
          <blockquote style="font-size:1.4rem;font-style:italic;color:${b.text};line-height:1.6;margin-bottom:1.25rem;max-width:600px;">"${slide.quote || ''}"</blockquote>
          ${slide.author ? `<cite style="color:${b.primary};font-size:0.9rem;font-weight:600;">— ${slide.author}</cite>` : ''}
        </div>`

    } else {
      content = `<div style="padding:2rem;"><p style="color:${b.text};font-size:1rem;">${slide.heading || slide.subheading || ''}</p></div>`
    }

    return `<div class="slide" style="min-height:100vh;background:${b.bg};display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid rgba(255,255,255,0.05);">${content}</div>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; background: ${b.bg}; color: ${b.text}; }
  html { scroll-snap-type: y mandatory; overflow-y: scroll; }
  .slide { scroll-snap-align: start; }
  a:hover { opacity: 0.85; }
</style>
</head>
<body>${slideHTML}</body>
</html>`
}

// ─── Validar URLs de recursos ─────────────────────────────────────────────────

async function validateResourceUrls(slides) {
  const resourceSlide = slides.find(s => s.type === 'resources')
  if (!resourceSlide || !resourceSlide.items) return []

  const broken = []
  for (const item of resourceSlide.items) {
    if (typeof item === 'string') continue
    const url = item.url
    if (!url || url === '#') continue
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
      if (!res.ok && res.status !== 405) {
        broken.push({ text: item.text, url, status: res.status })
      }
    } catch {
      broken.push({ text: item.text, url, status: 'timeout/error' })
    }
  }
  return broken
}

// ─── Procesar una clase ───────────────────────────────────────────────────────

async function generarClase(clase, groupId, config) {
  const { journey, existingTopics } = config

  console.log(`\n  📝 Generando: "${clase.title}"`)

  const userInstruction = `
Grupo al que pertenece esta clase:
- Nombre del grupo: ${config.group.name}
- El alumno al comenzar el grupo sabe: ${journey.from}
- El alumno al terminar el grupo puede: ${journey.to}
- Prerequisito específico de esta clase: ${clase.prerequisite || 'ninguno especificado'}
- Resultado esperado de esta clase: ${clase.outcome || 'ver instrucción abajo'}

INSTRUCCIÓN EDITORIAL COMPLETA:
${clase.instruction}
`.trim()

  // Slides
  process.stdout.write('    → Slides... ')
  const msgSlides = await anthropic.messages.create({
    model:      'claude-opus-4-7',
    max_tokens: 8000,
    system:     buildSystemSlides(journey, existingTopics || []),
    messages:   [{ role: 'user', content: `Creá los slides para esta clase:\n\n${userInstruction}` }],
  })
  const rawSlides   = msgSlides.content[0]?.text?.trim() ?? ''
  const jsonMatch   = rawSlides.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude no devolvió JSON válido en slides')
  const slidesData  = JSON.parse(jsonMatch[0])
  console.log(`"${slidesData.title}"`)

  // Body (artículo)
  process.stdout.write('    → Artículo... ')
  const msgBody = await anthropic.messages.create({
    model:      'claude-opus-4-7',
    max_tokens: 6000,
    system:     buildSystemBody(),
    messages:   [{ role: 'user', content: `Escribí el artículo complementario para esta clase:\n\n${userInstruction}` }],
  })
  const body = msgBody.content[0]?.text?.trim() ?? null
  const wordCount = body ? body.split(/\s+/).length : 0
  console.log(`${wordCount} palabras`)

  // Validar links
  process.stdout.write('    → Validando links... ')
  const brokenLinks = await validateResourceUrls(slidesData.slides)
  if (brokenLinks.length > 0) {
    console.log(`⚠️  ${brokenLinks.length} link(s) con problemas`)
  } else {
    console.log('OK')
  }

  // HTML + upload
  process.stdout.write('    → Subiendo slides... ')
  const html        = generateSlidesHTML(slidesData.slides, BRAND)
  const storagePath = `classes/draft-${Date.now()}/index.html`
  const { error: uploadError } = await supabase.storage
    .from('slides')
    .upload(storagePath, Buffer.from(html, 'utf-8'), { contentType: 'text/html', upsert: false })
  if (uploadError) throw new Error(`Storage: ${uploadError.message}`)
  const slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl
  console.log('OK')

  // Insert en DB
  process.stdout.write('    → Creando en DB... ')
  const { data: classRecord, error: dbError } = await supabase
    .from('classes')
    .insert({
      title:        slidesData.title,
      description:  slidesData.description,
      group_id:     groupId,
      plan_required: 'basic',
      slides_url:   slidesUrl,
      slides_json:  { slides: slidesData.slides, body: body ?? null },
      status:       'draft',
    })
    .select()
    .single()

  if (dbError) throw new Error(`DB: ${dbError.message}`)
  console.log(`ID ${classRecord.id}`)

  return {
    id:          classRecord.id,
    title:       slidesData.title,
    brokenLinks,
    wordCount,
    slideCount:  slidesData.slides?.length ?? 0,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { group, journey, existingTopics, classes } = CONFIG

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`🎓 CREAR GRUPO DE CLASES EN LEADR`)
  console.log(`   Grupo: ${group.name} [${group.category}]`)
  console.log(`   Clases: ${classes.length}`)
  console.log(`   A→B: ${journey.from.slice(0, 50)}... → ${journey.to.slice(0, 50)}...`)
  console.log(`${'═'.repeat(60)}\n`)

  // 1. Crear grupo si no existe
  let groupId = group.id ?? null

  if (!groupId || group.createNew) {
    process.stdout.write('📁 Creando grupo en Supabase... ')

    const { data: existing } = await supabase
      .from('groups')
      .select('id')
      .eq('name', group.name)
      .single()

    if (existing) {
      groupId = existing.id
      console.log(`(ya existe, ID ${groupId})`)
    } else {
      const { data: maxOrder } = await supabase
        .from('groups')
        .select('order_index')
        .eq('category', group.category)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      const nextOrder = (maxOrder?.order_index ?? 0) + 1

      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({ name: group.name, category: group.category, order_index: nextOrder })
        .select()
        .single()

      if (groupError) {
        console.error(`\n❌ Error creando grupo: ${groupError.message}`)
        process.exit(1)
      }

      groupId = newGroup.id
      console.log(`creado (ID ${groupId})`)
    }
  }

  // 2. Generar cada clase
  const resultados = []

  for (let i = 0; i < classes.length; i++) {
    const clase = classes[i]
    console.log(`\n[${i + 1}/${classes.length}] ${clase.title}`)

    try {
      const resultado = await generarClase(clase, groupId, CONFIG)
      resultados.push({ ...resultado, ok: true })
    } catch (err) {
      console.error(`\n  ❌ Error: ${err.message}`)
      resultados.push({ title: clase.title, ok: false, error: err.message })
    }

    // Pausa entre clases para no saturar la API
    if (i < classes.length - 1) {
      process.stdout.write('\n  ⏱  Esperando 4s...')
      await new Promise(r => setTimeout(r, 4000))
    }
  }

  // 3. Resumen final
  console.log(`\n\n${'═'.repeat(60)}`)
  console.log(`RESUMEN FINAL`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`Grupo: ${group.name} (ID: ${groupId})`)
  console.log(`Clases generadas: ${resultados.filter(r => r.ok).length}/${resultados.length}\n`)

  const brokenAll = []

  resultados.forEach(r => {
    if (r.ok) {
      const adminUrl = `https://leadr.cloud/admin/clase/${r.id}/`
      console.log(`  ✅ [ID ${r.id}] ${r.title}`)
      console.log(`     ${r.slideCount} slides · ${r.wordCount} palabras · ${adminUrl}`)
      if (r.brokenLinks?.length > 0) {
        r.brokenLinks.forEach(l => {
          console.log(`     ⚠️  Link roto: "${l.text}" → ${l.url} (${l.status})`)
          brokenAll.push({ clase: r.title, ...l })
        })
      }
    } else {
      console.log(`  ❌ ${r.title}: ${r.error}`)
    }
  })

  if (brokenAll.length > 0) {
    console.log(`\n⚠️  LINKS CON PROBLEMAS (corregir antes de publicar):`)
    brokenAll.forEach(l => console.log(`  - [${l.clase}] "${l.text}": ${l.url}`))
  }

  console.log(`\n📋 Panel admin del grupo:`)
  console.log(`   https://leadr.cloud/admin/grupos/${groupId}/`)
  console.log(`\n✅ Todo generado como DRAFT. Revisar y publicar desde el admin.`)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message)
  process.exit(1)
})
