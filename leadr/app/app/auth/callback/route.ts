import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { COMPRADORES_EMAILS } from '@/lib/compradores'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Auto-activar Pro si el email está en la lista de compradores
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email && COMPRADORES_EMAILS.has(user.email.toLowerCase())) {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('plan, plan_expires_at')
          .eq('id', user.id)
          .single()

        if (!userData?.plan || userData.plan === 'basic') {
          const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          await supabaseAdmin
            .from('users')
            .update({ plan: 'pro', plan_expires_at: expires })
            .eq('id', user.id)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
