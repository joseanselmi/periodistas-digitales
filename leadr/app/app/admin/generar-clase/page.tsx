import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GenerarClaseClient from './generar-clase-client'

export default async function GenerarClasePage({
  searchParams,
}: {
  searchParams: Promise<{ grupo?: string }>
}) {
  const supabase = await createClient()
  const { grupo } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: groups } = await supabase
    .from('groups').select('*').order('order_index')

  return <GenerarClaseClient groups={groups ?? []} preGroupId={grupo} />
}
