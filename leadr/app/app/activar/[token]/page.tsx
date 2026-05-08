import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import ActivarClient from './activar-client'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ActivarPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Verificar token
  const { data: tk } = await supabaseAdmin
    .from('activation_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (!tk) {
    return <ActivarClient token={token} status="invalid" />
  }
  if (tk.used_at) {
    return <ActivarClient token={token} status="used" />
  }
  if (new Date(tk.expires_at) < new Date()) {
    return <ActivarClient token={token} status="expired" />
  }

  // Ver si el usuario está logueado
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Ya está logueado — activar directo desde el server
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + tk.pro_days)

    await Promise.all([
      supabaseAdmin.from('users').update({ plan: 'pro', plan_expires_at: expiresAt.toISOString() }).eq('id', user.id),
      supabaseAdmin.from('activation_tokens').update({ used_at: new Date().toISOString(), used_by: user.id }).eq('token', token),
    ])

    redirect(`/dashboard?activated=1`)
  }

  return <ActivarClient token={token} status="valid" proDays={tk.pro_days} />
}
