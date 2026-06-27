import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Usado como destino del Google OAuth desde /activar
// Otorga plan pro y redirige al dashboard
export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const token = searchParams.get('t') ?? 'LEADR2026'

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: tk } = await admin
      .from('activation_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tk && !(tk.single_use && tk.used_at) && (!tk.expires_at || new Date(tk.expires_at) >= new Date())) {
      const expires = new Date(Date.now() + (tk.pro_days ?? 30) * 24 * 60 * 60 * 1000).toISOString()
      await admin.from('users')
        .update({ plan: 'pro', plan_expires_at: expires })
        .eq('id', user.id)

      if (tk.single_use) {
        await admin.from('activation_tokens')
          .update({ used_at: new Date().toISOString(), used_by: user.id })
          .eq('token', token)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?activated=1`)
}
