import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

  // Verificar token
  const { data: tk, error: tkErr } = await supabaseAdmin
    .from('activation_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tkErr || !tk) return NextResponse.json({ error: 'Link inválido o inexistente' }, { status: 404 })
  if (tk.used_at) return NextResponse.json({ error: 'Este link ya fue utilizado' }, { status: 409 })
  if (new Date(tk.expires_at) < new Date()) return NextResponse.json({ error: 'Este link expiró' }, { status: 410 })

  // Usuario autenticado actual
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Debés iniciar sesión primero' }, { status: 401 })

  // Activar Pro
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + tk.pro_days)

  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({ plan: 'pro', plan_expires_at: expiresAt.toISOString() })
    .eq('id', user.id)

  if (updateErr) return NextResponse.json({ error: 'Error activando el plan' }, { status: 500 })

  // Marcar token como usado
  await supabaseAdmin
    .from('activation_tokens')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('token', token)

  return NextResponse.json({ ok: true, pro_days: tk.pro_days, expires_at: expiresAt.toISOString() })
}
