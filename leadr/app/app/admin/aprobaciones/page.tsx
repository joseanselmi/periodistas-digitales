import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AprobacionesClient from './aprobaciones-client'

export default async function AprobacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <AprobacionesClient />
}
