import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BonusAdminClient from './bonus-admin-client'

export default async function AdminBonusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: items } = await supabase
    .from('bonus_items')
    .select('*')
    .order('order_index')

  return <BonusAdminClient items={items ?? []} />
}
