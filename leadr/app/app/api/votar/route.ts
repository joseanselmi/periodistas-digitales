import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAnnualUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await admin
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()
  if (data?.plan !== 'pro_annual') return null
  return user
}

// GET — sesión activa del mes + voto del usuario
export async function GET() {
  const user = await getAnnualUser()
  if (!user) return NextResponse.json({ error: 'Solo disponible para miembros anuales' }, { status: 403 })

  const month = new Date().toISOString().slice(0, 7)
  const { data: session } = await admin
    .from('class_vote_sessions')
    .select('*')
    .eq('month', month)
    .eq('is_active', true)
    .single()

  if (!session) return NextResponse.json({ session: null, vote: null })

  const { data: vote } = await admin
    .from('class_votes')
    .select('voted_option_id')
    .eq('user_id', user.id)
    .eq('session_id', session.id)
    .single()

  return NextResponse.json({ session, vote: vote?.voted_option_id ?? null })
}

// POST — emitir voto
export async function POST(req: Request) {
  const user = await getAnnualUser()
  if (!user) return NextResponse.json({ error: 'Solo disponible para miembros anuales' }, { status: 403 })

  const body = await req.json().catch(() => ({})) as { session_id?: string; option_id?: string }
  if (!body.session_id || !body.option_id) {
    return NextResponse.json({ error: 'session_id y option_id son requeridos' }, { status: 400 })
  }

  const { data: session } = await admin
    .from('class_vote_sessions')
    .select('id, options, is_active')
    .eq('id', body.session_id)
    .single()

  if (!session?.is_active) {
    return NextResponse.json({ error: 'Sesión de votación inactiva o no existe' }, { status: 400 })
  }

  const validOptions = (session.options as Array<{ id: string }>).map(o => o.id)
  if (!validOptions.includes(body.option_id)) {
    return NextResponse.json({ error: 'Opción inválida' }, { status: 400 })
  }

  const { error } = await admin.from('class_votes').insert({
    user_id: user.id,
    session_id: body.session_id,
    voted_option_id: body.option_id,
  })

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Ya votaste este mes' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
