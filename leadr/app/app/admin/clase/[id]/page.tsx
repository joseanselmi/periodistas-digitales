import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClaseForm from '../../clase-form'

export default async function EditarClasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: clase } = await supabase
    .from('classes').select('*').eq('id', id).single()
  if (!clase) notFound()

  const { data: groups } = await supabase
    .from('groups').select('*').order('order_index')

  return <ClaseForm groups={groups ?? []} clase={clase} />
}
