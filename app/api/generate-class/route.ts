import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { generateSlidesHTML, type Slide } from '@/lib/slides-html'

const SYSTEM_PROMPT = `Eres un experto en educación digital y periodismo. Generas clases completas y detalladas en formato de presentación interactiva, pensadas para que CUALQUIER persona pueda entenderlas desde cero.

Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

Estructura OBLIGATORIA (10 a 14 slides, en este orden exacto):

1. type:"title" — Título atractivo + subtítulo motivador que explique el valor de la clase
2. type:"checklist" — "Qué vas a aprender" con 4-6 objetivos concretos y medibles. Usa el campo "items": ["objetivo 1", ...]
3. type:"content" — Contexto: por qué este tema es importante hoy, casos de uso reales, qué problema resuelve. Campo "subheading" con 3-4 oraciones detalladas.
4. type:"content" o "bullets" — Explicación principal parte 1: concepto base explicado de forma simple, con ejemplos.
5. type:"content" o "bullets" — Explicación principal parte 2: profundización, cómo funciona en detalle.
6. type:"content" o "bullets" — Explicación principal parte 3 (si aplica): casos avanzados o variantes.
7. type:"practice" — Ejemplo práctico paso a paso. Campo "steps": array de 4-6 pasos concretos. Campo "tip": consejo clave opcional.
8. type:"errors" — Errores comunes a evitar. Campo "bullets": array de 4-5 errores frecuentes explicados brevemente.
9. type:"exercise" — Ejercicio práctico. Campo "title", "subheading" (contexto del ejercicio), "task" (la tarea concreta que debe hacer el alumno).
10. type:"resources" — Recursos adicionales. Campo "items": array de objetos { "text": "Nombre", "url": "https://...", "tag": "Video|Herramienta|Artículo|Guía" }. Incluye 4-6 recursos REALES con URLs válidas.
11. type:"bullets" — Resumen final: los 4-5 takeaways más importantes de la clase.

Tipos disponibles: title, content, bullets, quote, checklist, practice, errors, exercise, resources.

Reglas importantes:
- Cada slide de "content" debe tener "subheading" con AL MENOS 3 oraciones completas y detalladas.
- Los "bullets" deben tener frases completas, no palabras sueltas.
- Los "steps" en "practice" deben ser instrucciones claras y accionables.
- Los recursos DEBEN tener URLs reales y válidas (no inventes URLs).
- El lenguaje debe ser simple, claro y accesible para cualquier persona.

Formato JSON:
{
  "title": "Título de la clase",
  "description": "Descripción de 2-3 oraciones que resume el valor de la clase",
  "slides": [ ...array de slides siguiendo la estructura anterior... ]
}`

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

    const classData = JSON.parse(jsonMatch[0]) as { title: string; description: string; slides: Slide[] }

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
        slides_json: classData.slides,
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
