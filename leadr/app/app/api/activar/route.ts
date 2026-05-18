import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { token?: string }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Activación con token (desde /activar/[token])
  if (body.token) {
    const { data: tk } = await admin
      .from('activation_tokens')
      .select('*')
      .eq('token', body.token)
      .is('used_at', null)
      .single()

    if (!tk) return NextResponse.json({ error: 'Token inválido o ya usado' }, { status: 400 })

    if (tk.expires_at && new Date(tk.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    const expires = new Date(Date.now() + (tk.pro_days ?? 30) * 24 * 60 * 60 * 1000).toISOString()

    await admin.from('users').update({ plan: 'pro', plan_expires_at: expires }).eq('id', user.id)
    await admin.from('activation_tokens')
      .update({ used_at: new Date().toISOString(), used_by: user.id })
      .eq('token', body.token)

    return NextResponse.json({ ok: true })
  }

  // Sin token: página /activar (bonificación curso)
  // Solo confirmar si Hotmart ya activó el plan — no escalar de basic a pro sin verificación
  const { data: profile } = await admin
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'pro') {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Sin acceso Pro. Verificá que tu compra fue procesada.' }, { status: 403 })
}
