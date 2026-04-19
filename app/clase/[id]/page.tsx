import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaseClient from './clase-client'

export default async function ClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const { data: clase } = await supabase
    .from('classes')
    .select('*, groups(name, category)')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!clase) notFound()

  // Bloquear si no tiene plan suficiente
  if (clase.plan_required === 'pro' && profile?.plan !== 'pro') {
    redirect('/dashboard')
  }

  const { data: progress } = await supabase
    .from('user_progress')
    .select('watched_at')
    .eq('user_id', user.id)
    .eq('class_id', clase.id)
    .single()

  return (
    <ClaseClient
      clase={clase}
      userPlan={profile?.plan ?? 'basic'}
      alreadyWatched={!!progress}
    />
  )
}
