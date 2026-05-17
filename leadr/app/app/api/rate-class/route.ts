import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { class_id, rating, comment } = await request.json()

  if (!class_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  // Verificar que el usuario tiene acceso a la clase (respeta plan requerido)
  const { data: profile } = await supabase.from('users').select('plan, plan_expires_at').eq('id', user.id).single()
  const { data: clase } = await supabase.from('classes').select('plan_required').eq('id', class_id).single()

  if (clase?.plan_required === 'pro') {
    const planActive =
      profile?.plan === 'pro' && profile?.plan_expires_at
        ? new Date(profile.plan_expires_at) > new Date()
        : profile?.plan === 'pro'
    if (!planActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('class_ratings')
    .upsert(
      { user_id: user.id, class_id, rating, comment: comment || null },
      { onConflict: 'user_id,class_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
