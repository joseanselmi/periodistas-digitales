import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Usado como destino del Google OAuth desde /activar
// Otorga plan pro y redirige al dashboard
export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await admin.from('users').update({ plan: 'pro', plan_expires_at: expires }).eq('id', user.id)
  }

  return NextResponse.redirect(`${origin}/dashboard?activated=1`)
}
