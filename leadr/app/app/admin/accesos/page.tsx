import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import AccesosClient from './accesos-client'

const supabaseAdmin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AccesosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabaseAdmin.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { data: tokens } = await supabaseAdmin
    .from('activation_tokens')
    .select('*')
    .order('created_at', { ascending: false })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leadr.cloud'

  return <AccesosClient tokens={tokens ?? []} siteUrl={siteUrl} />
}
