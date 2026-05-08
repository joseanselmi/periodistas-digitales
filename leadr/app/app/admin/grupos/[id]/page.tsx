import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GrupoDetalleClient from './grupo-detalle-client'

export default async function GrupoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: group } = await supabase
    .from('groups')
    .select('*, classes(id, title, description, status, plan_required, created_at)')
    .eq('id', id)
    .single()

  if (!group) notFound()

  return <GrupoDetalleClient group={group} />
}
