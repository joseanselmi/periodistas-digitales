import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './admin-client'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, plan')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: classes } = await supabase
    .from('classes')
    .select('*, groups(name, category)')
    .order('created_at', { ascending: false })

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('order_index')

  return <AdminClient classes={classes ?? []} groups={groups ?? []} />
}
