import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Perfil del usuario (plan)
  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  // Grupos con clases
  const { data: groups } = await supabase
    .from('groups')
    .select('*, classes(*)')
    .order('order_index')

  // Progreso del usuario
  const { data: progress } = await supabase
    .from('user_progress')
    .select('class_id')
    .eq('user_id', user.id)

  const watchedIds = new Set(progress?.map(p => p.class_id) ?? [])

  return (
    <DashboardClient
      user={{ email: user.email!, plan: profile?.plan ?? 'basic' }}
      groups={groups ?? []}
      watchedIds={Array.from(watchedIds)}
    />
  )
}
