import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaseClient from './clase-client'

export default async function ClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: clase }] = await Promise.all([
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase.from('classes').select('*, groups(id, name, category)').eq('id', id).eq('status', 'published').single(),
  ])

  if (!clase) notFound()

  if (clase.plan_required === 'pro' && profile?.plan !== 'pro') {
    redirect('/dashboard')
  }

  // Clases hermanas del mismo grupo, ordenadas por fecha de creación
  const [{ data: siblings }, { data: progress }] = await Promise.all([
    clase.groups
      ? supabase
          .from('classes')
          .select('id, title, plan_required')
          .eq('group_id', (clase.groups as { id: number }).id)
          .eq('status', 'published')
          .order('created_at', { ascending: true })
      : { data: [] },
    supabase
      .from('user_progress')
      .select('watched_at')
      .eq('user_id', user.id)
      .eq('class_id', clase.id)
      .single(),
  ])

  const siblingList = siblings ?? []
  const currentIndex = siblingList.findIndex(c => c.id === clase.id)
  const prevClass = currentIndex > 0 ? siblingList[currentIndex - 1] : null
  const nextClass = currentIndex < siblingList.length - 1 ? siblingList[currentIndex + 1] : null

  return (
    <ClaseClient
      clase={clase}
      userPlan={profile?.plan ?? 'basic'}
      alreadyWatched={!!progress}
      prevClass={prevClass}
      nextClass={nextClass}
    />
  )
}
