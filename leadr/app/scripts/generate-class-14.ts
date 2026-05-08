import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { generateSlidesHTML } from '../lib/slides-html'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!
const CLASS_ID = 14

const SYSTEM_PROMPT = `Eres un experto en educación digital y periodismo. Generas clases completas, visuales y detalladas pensadas para periodistas tradicionales de 35 a 60 años que están migrando al mundo digital.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

El JSON tiene esta estructura:
{
  "title": "Título de la clase",
  "description": "Descripción de 2-3 oraciones",
  "slides": [...],
  "body": "...artículo completo en HTML..."
}

═══════════════════════════════
CAMPO "slides" — 11 a 14 slides.
═══════════════════════════════

Orden obligatorio:
1. type:"title" — heading + subheading motivador
2. type:"checklist" — "Qué vas a aprender": items: 4-6 objetivos
3. type:"diagram" — Mapa conceptual. SIEMPRE incluir "subheading" explicando la relación. center: concepto central, nodes: 4-8 nodos
4. type:"content" — Por qué importa. subheading: 3-4 oraciones con dato real, contexto, impacto
5. type:"bullets" — Concepto principal parte 1. 3-4 bullets claros
6. type:"bullets" — Parte 2 del concepto. Igual de concreto
7. type:"content" — Parte 3 si aplica
8. type:"practice" — Ejemplo práctico. steps: 4-6 pasos. tip: consejo clave
9. type:"errors" — bullets: 4-5 errores con su consecuencia real
10. type:"exercise" — subheading: contexto, task: tarea específica paso a paso
11. type:"resources" — items: 4-6 objetos { text, url, tag }. URLs REALES y verificables
12. type:"bullets" — Resumen: 4-5 takeaways accionables

Tipos disponibles: title, content, bullets, checklist, practice, errors, exercise, resources, diagram

═══════════════════════════════
CAMPO "body" — Artículo completo en HTML
═══════════════════════════════

Artículo largo en HTML con estas secciones (sin clases CSS):
- <h2> secciones principales
- <h3> subsecciones
- <p> párrafos de 3-4 oraciones mínimo
- <ul><li> listas
- <ol><li> pasos
- <blockquote> notas importantes
- <strong> términos clave
- <a href="URL"> links reales

Secciones obligatorias del artículo:
1. Introducción: qué es el tema, por qué importa hoy para periodistas
2. Conceptos fundamentales: explicación detallada
3. Cómo funciona paso a paso con ejemplos de redacción
4. Ejemplo práctico completo: situación real de un periodista
5. Errores comunes y cómo evitarlos
6. Tu ejercicio: instrucciones detalladas
7. Recursos para seguir aprendiendo

Tono: periodista hablando a otro periodista. Segunda persona. Cercano, sin tecnicismos, sin lenguaje académico. Mínimo 800 palabras.`

const INSTRUCTION = `Crea una clase completa sobre "Internet sin misterio: lo que todo periodista necesita saber".

Contexto: Es para periodistas de 35-60 años con experiencia en medios tradicionales que están aprendiendo a operar en el mundo digital. No tienen conocimientos técnicos.

La clase debe explicar de forma práctica y sin tecnicismos:
- Qué son los servidores y cómo almacenan información (analogía con una biblioteca física)
- Qué es el DNS y cómo convierte nombres en direcciones (analogía con una guía telefónica)
- Qué es la nube y cómo afecta su trabajo diario
- Por qué los sitios web caen y qué significa eso para verificar fuentes
- Cómo saber si un sitio es real o falso (dominio, HTTPS, Whois)
- Por qué es útil para un periodista entender cómo funciona internet

Ejemplo periodístico: incluye una situación donde un periodista tuvo que verificar si un sitio web era legítimo o era una web falsa creada para desinformar. Explica cómo usar herramientas como Whois o la Wayback Machine.

Recursos reales: incluye Whois.com, Web.Archive.org, Google Transparency Report, y otros recursos reales.`

async function main() {
  console.log('🚀 Generando Clase 14: Internet sin misterio...')

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // 1. Generar contenido con Claude
  console.log('🤖 Llamando a Claude...')
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: INSTRUCTION }],
  })

  const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude no devolvió JSON válido')

  const contentData = JSON.parse(jsonMatch[0])
  console.log(`✅ Contenido generado: "${contentData.title}" — ${contentData.slides.length} slides`)

  // 2. Generar HTML
  console.log('🎨 Generando HTML de slides...')
  const html = generateSlidesHTML(contentData.slides)

  // 3. Subir HTML a Supabase Storage
  console.log('☁️ Subiendo a Supabase Storage...')
  const timestamp = Date.now()
  const storagePath = `classes/${timestamp}/index.html`

  const { error: uploadError } = await supabase.storage
    .from('slides')
    .upload(storagePath, Buffer.from(html, 'utf-8'), {
      contentType: 'text/html',
      upsert: false,
    })

  if (uploadError) throw new Error(`Upload error: ${uploadError.message}`)

  const slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl
  console.log(`✅ Slides subidas: ${slidesUrl}`)

  // 4. Actualizar clase en DB
  console.log('💾 Actualizando clase en base de datos...')
  const { error: dbError } = await supabase
    .from('classes')
    .update({
      title: contentData.title,
      description: contentData.description,
      slides_url: slidesUrl,
      slides_json: { slides: contentData.slides, body: contentData.body ?? null },
    })
    .eq('id', CLASS_ID)

  if (dbError) throw new Error(`DB error: ${dbError.message}`)

  console.log(`\n✅ Clase ${CLASS_ID} actualizada correctamente.`)
  console.log(`📺 Slides: ${slidesUrl}`)
  console.log(`📝 Body: ${contentData.body ? contentData.body.length + ' chars' : 'sin body'}`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
