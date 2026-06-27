import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const since = searchParams.get('since') ?? new Date(0).toISOString()

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [{ data: classes }, { data: news }, { data: prompts }] = await Promise.all([
    admin
      .from('classes')
      .select('id, title, groups(name)')
      .eq('status', 'published')
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('news')
      .select('id, titulo')
      .eq('status', 'published')
      .gt('published_at', since)
      .order('published_at', { ascending: false })
      .limit(5),
    admin
      .from('prompts')
      .select('id, title')
      .eq('status', 'published')
      .gt('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const hasNew = (classes?.length ?? 0) + (news?.length ?? 0) + (prompts?.length ?? 0) > 0

  return NextResponse.json({
    hasNew,
    classes: classes ?? [],
    news: news ?? [],
    prompts: prompts ?? [],
  })
}
