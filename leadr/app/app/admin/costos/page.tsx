import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CostosClient from './costos-client'

export default async function CostosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  return <CostosClient />
}
