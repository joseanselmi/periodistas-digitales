import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaseForm from '../clase-form'

export default async function NuevaClasePage({
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

  const preGroup = grupo ? groups?.find(g => String(g.id) === grupo) : undefined

  return (
    <ClaseForm
      groups={groups ?? []}
      clase={preGroup ? { group_id: preGroup.id } : undefined}
    />
  )
}
