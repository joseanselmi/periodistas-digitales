import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Inicio — Leadr',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: groups }, { data: progress }] = await Promise.all([
    supabase.from('users').select('plan, is_admin, plan_expires_at').eq('id', user.id).single(),
    supabase.from('groups').select('*, classes(*)').order('order_index'),
    supabase.from('user_progress').select('class_id').eq('user_id', user.id),
  ])

  // Si el plan expiró → bajar a basic en DB y en sesión
  let plan = profile?.plan ?? 'basic'
  if (plan === 'pro' && profile?.plan_expires_at) {
    const expired = new Date(profile.plan_expires_at) < new Date()
    if (expired) {
      plan = 'basic'
      // Bajar en DB de forma no bloqueante
      const service = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      service.from('users').update({ plan: 'basic', plan_expires_at: null }).eq('id', user.id)
    }
  }

  return (
    <DashboardClient
      user={{
        email: user.email!,
        plan,
        isAdmin: profile?.is_admin ?? false,
        planExpiresAt: plan === 'pro' && profile?.plan_expires_at ? profile.plan_expires_at : null,
      }}
      groups={groups ?? []}
      watchedIds={progress?.map(p => p.class_id) ?? []}
    />
  )
}
