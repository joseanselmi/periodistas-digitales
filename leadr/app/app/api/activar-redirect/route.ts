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
    // Reusar la lógica de /api/activar pasando el token
    await fetch(`${origin}/api/activar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') ?? '' },
      body: JSON.stringify({ token }),
    })
  }

  return NextResponse.redirect(`${origin}/dashboard?activated=1`)
}
