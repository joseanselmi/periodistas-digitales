import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CerebroClient from './cerebro-client'

export const metadata = { title: 'Cerebro' }

export default async function CerebroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const [
    { data: users },
    { data: classes },
    { data: groups },
    { data: tasks },
    { data: progress },
  ] = await Promise.all([
    supabase.from('users').select('id, email, plan, created_at').order('created_at', { ascending: false }),
    supabase.from('classes').select('id, title, status, plan_required, group_id, groups(id, name, category)'),
    supabase.from('groups').select('id, name, category, order_index').order('order_index'),
    supabase.from('admin_tasks').select('*').order('created_at', { ascending: false }),
    supabase.from('user_progress').select('user_id, class_id').limit(2000),
  ])

  return (
    <CerebroClient
      users={users ?? []}
      classes={classes ?? []}
      groups={groups ?? []}
      tasks={tasks ?? []}
      totalWatches={progress?.length ?? 0}
    />
  )
}
