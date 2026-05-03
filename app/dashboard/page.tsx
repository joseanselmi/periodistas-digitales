import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Inicio — Leadr',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: groups }, { data: progress }] = await Promise.all([
    supabase.from('users').select('plan, is_admin').eq('id', user.id).single(),
    supabase.from('groups').select('*, classes(*)').order('order_index'),
    supabase.from('user_progress').select('class_id').eq('user_id', user.id),
  ])

  return (
    <DashboardClient
      user={{ email: user.email!, plan: profile?.plan ?? 'basic', isAdmin: profile?.is_admin ?? false }}
      groups={groups ?? []}
      watchedIds={progress?.map(p => p.class_id) ?? []}
    />
  )
}
