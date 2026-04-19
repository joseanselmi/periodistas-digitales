import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaseForm from '../clase-form'

export default async function NuevaClasePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: groups } = await supabase
    .from('groups').select('*').order('order_index')

  return <ClaseForm groups={groups ?? []} />
}
