import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GrupoClient from './grupo-client'

export default async function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: group }, { data: progress }] = await Promise.all([
    supabase.from('users').select('plan, is_admin').eq('id', user.id).single(),
    supabase.from('groups').select('*, classes(*)').eq('id', id).single(),
    supabase.from('user_progress').select('class_id').eq('user_id', user.id),
  ])

  if (!group) redirect('/dashboard')

  return (
    <GrupoClient
      group={group}
      user={{ email: user.email!, plan: profile?.plan ?? 'basic', isAdmin: profile?.is_admin ?? false }}
      watchedIds={progress?.map(p => p.class_id) ?? []}
    />
  )
}
