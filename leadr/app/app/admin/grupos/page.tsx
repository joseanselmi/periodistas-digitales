import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GruposClient from './grupos-client'

export default async function GruposPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: groups } = await supabase
    .from('groups')
    .select('*, classes(id, status)')
    .order('order_index')

  return <GruposClient groups={groups ?? []} />
}
