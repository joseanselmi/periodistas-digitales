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

  if (!body.token) {
    return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
  }

  // Buscar token — multi-uso: no filtra por used_at si single_use = false
  const { data: tk } = await admin
    .from('activation_tokens')
    .select('*')
    .eq('token', body.token)
    .single()

  if (!tk) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })

  // Si es single_use, verificar que no fue usado
  if (tk.single_use && tk.used_at) {
    return NextResponse.json({ error: 'Token ya utilizado' }, { status: 400 })
  }

  // Verificar expiración
  if (tk.expires_at && new Date(tk.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
  }

  const expires = new Date(Date.now() + (tk.pro_days ?? 30) * 24 * 60 * 60 * 1000).toISOString()

  await admin.from('users')
    .update({ plan: 'pro', plan_expires_at: expires })
    .eq('id', user.id)

  // Solo marcar como usado si es single_use
  if (tk.single_use) {
    await admin.from('activation_tokens')
      .update({ used_at: new Date().toISOString(), used_by: user.id })
      .eq('token', body.token)
  }

  return NextResponse.json({ ok: true })
}
