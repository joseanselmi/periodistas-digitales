import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { generateSlidesHTML, type Slide } from '@/lib/slides-html'

const SYSTEM_PROMPT = `Eres un experto en educación digital y periodismo. Generas clases completas, visuales y detalladas pensadas para que CUALQUIER persona las entienda desde cero.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

El JSON tiene esta estructura:
{
  "title": "Título de la clase",
  "description": "Descripción de 2-3 oraciones",
  "slides": [...],
  "body": "...artículo completo en HTML..."
}

═══════════════════════════════
CAMPO "slides" — 11 a 14 slides VISUALES (pocas palabras, mucho impacto)
═══════════════════════════════

Orden obligatorio:
1. type:"title" — Título + subtítulo motivador (máx 10 palabras cada uno)
2. type:"checklist" — "Qué vas a aprender": 4-6 objetivos cortos. Campo "items":["..."]
3. type:"diagram" — Mapa conceptual del tema. Campo "center":"concepto central", "nodes":["concepto 1","concepto 2",...] (4-8 nodos). Úsalo para mostrar cómo se relacionan las ideas.
4. type:"content" — Por qué importa (impacto real, dato o estadística). "subheading": 2-3 oraciones directas.
5. type:"bullets" — Concepto principal parte 1. Máx 4 bullets, cada uno en 1 línea concisa.
6. type:"bullets" — Concepto principal parte 2. Máx 4 bullets.
7. type:"content" o "bullets" — Parte 3 si el tema lo requiere.
8. type:"practice" — Ejemplo práctico. "steps": 4-6 pasos concretos y accionables. "tip": consejo clave.
9. type:"errors" — Errores comunes. "bullets": 4-5 errores con consecuencia breve.
10. type:"exercise" — Ejercicio. "title", "subheading" (contexto), "task" (tarea específica).
11. type:"resources" — "items": 4-6 objetos { "text":"nombre", "url":"https://...", "tag":"Video|Herramienta|Artículo|Guía" }. URLs REALES y válidas.
12. type:"bullets" — Resumen final: 4-5 takeaways de una línea cada uno.

Tipos disponibles: title, content, bullets, checklist, practice, errors, exercise, resources, diagram, quote.

Reglas para slides:
- POCOS textos por slide — la presentación es visual, no un libro
- Los bullets son frases de máx 12 palabras
- El diagrama SIEMPRE va después del checklist para dar el mapa mental del tema

═══════════════════════════════
CAMPO "body" — Artículo completo en HTML
═══════════════════════════════

El campo "body" contiene un artículo largo y detallado en HTML que explica TODA la clase en profundidad. Es el complemento escrito de los slides.

Estructura del HTML (usa estas etiquetas exactas, sin clases CSS):
- <h2> para secciones principales
- <h3> para subsecciones
- <p> para párrafos (mínimo 3-4 oraciones cada uno, explicaciones detalladas)
- <ul><li> para listas
- <ol><li> para pasos numerados
- <blockquote> para citas o notas importantes
- <strong> para términos clave
- <a href="URL"> para links de recursos (los mismos que en el slide de resources)

El artículo debe tener estas secciones:
1. Introducción: qué es el tema, por qué importa hoy, para quién es útil
2. Conceptos fundamentales: explicación detallada de cada concepto del diagrama
3. Cómo funciona paso a paso: desarrollo completo con ejemplos reales
4. Ejemplo práctico completo: el mismo ejemplo de los slides pero con más detalle
5. Errores comunes y cómo evitarlos: cada error explicado con causa y solución
6. Tu ejercicio: instrucciones detalladas para completar la tarea
7. Recursos para seguir aprendiendo: cada recurso con una descripción de qué encontrarás ahí

El artículo debe ser LARGO (mínimo 800 palabras), detallado, y escrito en un tono cercano y accesible.`

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { instruction, groupId, plan, brandColors } = await req.json()
    if (!instruction?.trim()) return NextResponse.json({ error: 'Instrucción requerida' }, { status: 400 })

    // 1. Llamar a Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Crea una clase sobre: ${instruction}` }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    // Extraer JSON aunque venga con markdown accidental
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Claude no devolvió JSON válido' }, { status: 500 })

    const classData = JSON.parse(jsonMatch[0]) as { title: string; description: string; slides: Slide[]; body?: string }

    // 2. Generar HTML con brand identity
    const brand = brandColors ?? undefined
    const html = generateSlidesHTML(classData.slides, brand)

    // 3. Subir HTML a Supabase Storage
    const timestamp = Date.now()
    const path = `classes/${timestamp}/index.html`
    const { error: uploadError } = await supabase.storage
      .from('slides')
      .upload(path, Buffer.from(html, 'utf-8'), {
        contentType: 'text/html',
        upsert: false,
      })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data: { publicUrl } } = supabase.storage.from('slides').getPublicUrl(path)

    // 4. Crear clase en DB como draft
    const { data: newClass, error: dbError } = await supabase
      .from('classes')
      .insert({
        title: classData.title,
        description: classData.description,
        group_id: groupId ?? null,
        plan_required: plan ?? 'basic',
        slides_url: publicUrl,
        slides_json: { slides: classData.slides, body: classData.body ?? null },
        status: 'draft',
      })
      .select()
      .single()

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ class: newClass, slidesUrl: publicUrl })
  } catch (err) {
    console.error('generate-class error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
