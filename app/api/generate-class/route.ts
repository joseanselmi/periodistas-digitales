import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { generateSlidesHTML, type Slide } from '@/lib/slides-html'

const SYSTEM_PROMPT_PROMPT = `Eres un experto en prompt engineering y periodismo digital. Generas prompts de IA completos, listos para copiar y usar, con ejemplos reales y variaciones.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

{
  "type": "prompt",
  "title": "Nombre descriptivo del prompt",
  "description": "Para qué sirve este prompt en 2-3 oraciones",
  "prompt": "El texto completo del prompt con [VARIABLES] en corchetes para las partes que el usuario debe personalizar",
  "variables": [
    {"name": "[NOMBRE_VARIABLE]", "description": "Qué es y para qué sirve", "example": "Ejemplo concreto y útil"}
  ],
  "example": {
    "input": "El prompt con las variables reemplazadas por valores reales, tal como lo escribirías en ChatGPT o Claude",
    "output": "Una respuesta completa y realista que generaría la IA. Debe ser larga y detallada para mostrar el valor del prompt."
  },
  "use_cases": [
    "Cuándo usar este prompt — situación concreta 1",
    "Situación concreta 2",
    "Situación concreta 3",
    "Situación concreta 4"
  ],
  "variations": [
    {"title": "Para [caso específico]", "prompt": "Versión modificada del prompt para este caso"},
    {"title": "Versión más corta", "prompt": "Variante simplificada"},
    {"title": "Para [otro caso]", "prompt": "Otra variante útil"}
  ]
}

Reglas:
- El prompt principal debe ser completo, profesional y funcionar en ChatGPT, Claude o cualquier IA
- Las variables en [CORCHETES] deben ser claras y tener ejemplos muy concretos
- El output del ejemplo debe mostrar el verdadero poder del prompt (mínimo 150 palabras de respuesta)
- Las variaciones deben cubrir casos de uso distintos y realmente útiles
- Tono cercano, práctico, pensado para periodistas que aprenden IA`

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
CAMPO "slides" — 11 a 14 slides. Cada slide debe tener TODO lo que se necesita para entender ese punto.
═══════════════════════════════

PRINCIPIO CLAVE: Cada slide combina explicación + elemento visual según lo que mejor comunique la idea.
No hay slides con solo texto ni slides con solo un diagrama — siempre van juntos cuando sea relevante.

Orden obligatorio:
1. type:"title" — Título + subtítulo motivador.
2. type:"checklist" — "Qué vas a aprender": 4-6 objetivos. Campo "items":["..."]
3. type:"diagram" — Mapa conceptual. SIEMPRE incluir "subheading" con 1-2 oraciones explicando la relación entre los conceptos. Campo "center":"concepto central", "nodes":["nodo 1",...] (4-8 nodos).
4. type:"content" — Por qué importa. "subheading": 3-4 oraciones con dato real, contexto, impacto.
5. type:"bullets" — Concepto principal parte 1. 3-4 bullets de una línea cada uno, claros y directos.
6. type:"bullets" o "content" — Parte 2 del concepto principal. Igual de concreto.
7. type:"content" o "bullets" — Parte 3 si aplica (tema complejo).
8. type:"practice" — Ejemplo práctico. "steps": 4-6 pasos concretos. "tip": consejo que marca la diferencia.
9. type:"errors" — Errores comunes. "bullets": 4-5 errores con su consecuencia real.
10. type:"exercise" — Ejercicio concreto. "subheading": contexto, "task": tarea específica paso a paso.
11. type:"resources" — "items": 4-6 objetos { "text":"nombre descriptivo", "url":"https://...", "tag":"Video|Herramienta|Artículo|Guía" }. URLs REALES.
12. type:"bullets" — Resumen: 4-5 takeaways accionables.

Tipos disponibles: title, content, bullets, checklist, practice, errors, exercise, resources, diagram, quote.

Reglas para slides:
- type:"diagram" SIEMPRE tiene "subheading" explicando los conceptos del diagrama
- type:"content" tiene "subheading" con mínimo 3 oraciones completas
- type:"bullets" tiene bullets de frases completas (no palabras sueltas)
- type:"practice" SIEMPRE tiene "tip"
- Cada slide debe poder entenderse solo, sin necesitar ver el anterior

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

    const { instruction, groupId, plan, brandColors, category } = await req.json()
    if (!instruction?.trim()) return NextResponse.json({ error: 'Instrucción requerida' }, { status: 400 })

    const isPrompt = category === 'prompts'

    // 1. Llamar a Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      system: isPrompt ? SYSTEM_PROMPT_PROMPT : SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: isPrompt
          ? `Crea un prompt de IA sobre: ${instruction}`
          : `Crea una clase sobre: ${instruction}`
      }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Claude no devolvió JSON válido' }, { status: 500 })

    const contentData = JSON.parse(jsonMatch[0]) as { title: string; description: string; slides: Slide[]; body?: string; type?: string }

    let slidesUrl: string | null = null

    if (!isPrompt) {
      // 2. Generar HTML con brand identity
      const brand = brandColors ?? undefined
      const html = generateSlidesHTML(contentData.slides, brand)

      // 3. Subir HTML a Supabase Storage
      const timestamp = Date.now()
      const storagePath = `classes/${timestamp}/index.html`
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(storagePath, Buffer.from(html, 'utf-8'), {
          contentType: 'text/html',
          upsert: false,
        })

      if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

      slidesUrl = supabase.storage.from('slides').getPublicUrl(storagePath).data.publicUrl
    }

    // 4. Crear en DB como draft
    const { data: newClass, error: dbError } = await supabase
      .from('classes')
      .insert({
        title: contentData.title,
        description: contentData.description,
        group_id: groupId ?? null,
        plan_required: plan ?? 'basic',
        slides_url: slidesUrl,
        slides_json: isPrompt
          ? contentData
          : { slides: contentData.slides, body: contentData.body ?? null },
        status: 'draft',
      })
      .select()
      .single()

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ class: newClass, slidesUrl, isPrompt })
  } catch (err) {
    console.error('generate-class error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
