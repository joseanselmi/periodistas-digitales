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

  // Verificar token existe y es válido (para distinguir 404 / 409 / 410)
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

  // Marcar token como usado de forma ATÓMICA — previene race condition TOCTOU
  // Si dos requests llegan al mismo tiempo, solo uno pasa el .is('used_at', null)
  const { data: claimed } = await supabaseAdmin
    .from('activation_tokens')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('token', token)
    .is('used_at', null)
    .select('pro_days')
    .single()

  if (!claimed) return NextResponse.json({ error: 'Este link ya fue utilizado' }, { status: 409 })

  // Activar Pro
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + claimed.pro_days)

  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({ plan: 'pro', plan_expires_at: expiresAt.toISOString() })
    .eq('id', user.id)

  if (updateErr) return NextResponse.json({ error: 'Error activando el plan' }, { status: 500 })

  return NextResponse.json({ ok: true, pro_days: claimed.pro_days, expires_at: expiresAt.toISOString() })
}
