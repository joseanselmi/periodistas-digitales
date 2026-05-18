import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

// PATCH — publicar | rechazar | cambiar imagen
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { action, imagen_url } = body as { action: string; imagen_url?: string }

  if (action === 'publish') {
    const { error } = await supabaseAdmin
      .from('news')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'reject') {
    const { error } = await supabaseAdmin
      .from('news')
      .update({ status: 'rejected' })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'translate') {
    const { data: item } = await supabaseAdmin.from('news').select('titulo, resumen').eq('id', id).single()
    if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Traducí al español neutro latinoamericano (sin jerga argentina ni mexicana). Devolvé SOLO JSON válido sin markdown.

Título: ${item.titulo}
Resumen: ${item.resumen}

{"titulo": "...", "resumen": "..."}`
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    let traduccion: { titulo: string; resumen: string }
    try {
      const clean = text.match(/\{[\s\S]*\}/)
      traduccion = JSON.parse(clean?.[0] ?? text)
    } catch {
      return NextResponse.json({ error: 'Error parsing traducción' }, { status: 500 })
    }

    const { error } = await supabaseAdmin
      .from('news')
      .update({ titulo: traduccion.titulo, resumen: traduccion.resumen })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ titulo: traduccion.titulo, resumen: traduccion.resumen })
  }

  if (action === 'update_image' && imagen_url) {
    const { error } = await supabaseAdmin
      .from('news')
      .update({ imagen_url })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
