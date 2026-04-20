import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PreviewClient from './preview-client'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const { data: clase } = await supabase
    .from('classes')
    .select('*, groups(name, category)')
    .eq('id', id)
    .single()

  if (!clase) notFound()

  return <PreviewClient clase={clase} />
}
