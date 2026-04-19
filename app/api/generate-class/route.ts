import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { generateSlidesHTML, type Slide } from '@/lib/slides-html'

const SYSTEM_PROMPT = `Eres un experto en educación digital y periodismo. Generas clases en formato de presentación.
Devuelve ÚNICAMENTE un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional.

Estructura obligatoria:
{
  "title": "Título de la clase",
  "description": "Descripción de 1-2 oraciones",
  "slides": [
    { "type": "title", "heading": "Título principal", "subheading": "Subtítulo opcional" },
    { "type": "bullets", "title": "Título de sección", "bullets": ["Punto 1", "Punto 2", "Punto 3"], "notes": "Texto para narración" },
    { "type": "content", "title": "Título", "subheading": "Desarrollo del tema en 2-3 oraciones", "notes": "Texto para narración" },
    { "type": "quote", "quote": "Cita relevante", "author": "Autor" },
    { "type": "resources", "title": "Para seguir aprendiendo", "items": ["Recurso 1", "Recurso 2"] }
  ]
}

Tipos disponibles: title, content, bullets, quote, resources.
Genera entre 6 y 10 slides. Siempre empieza con type:title y termina con type:resources.`

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
      max_tokens: 4096,
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
