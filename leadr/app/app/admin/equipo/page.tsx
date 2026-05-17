import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EquipoClient from './equipo-client'

export const metadata = { title: 'Equipo' }

export default async function EquipoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .order('order_index')

  return <EquipoClient members={members ?? []} />
}
