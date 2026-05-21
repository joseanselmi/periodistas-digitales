import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Verificar que es admin
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: me } = await admin.from('users').select('is_admin').eq('id', user.id).single()
  if (!me?.is_admin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const [
    { data: users },
    { data: progress },
    { data: classes },
    { data: ratings },
  ] = await Promise.all([
    admin.from('users').select('id, email, plan, plan_expires_at, created_at').order('created_at', { ascending: false }).limit(500),
    admin.from('user_progress').select('user_id, class_id').limit(5000),
    admin.from('classes').select('id, title, groups(name)').eq('status', 'published'),
    admin.from('class_ratings').select('class_id, rating, user_id, comment, created_at').limit(5000),
  ])

  return NextResponse.json({ users, progress, classes, ratings })
}
