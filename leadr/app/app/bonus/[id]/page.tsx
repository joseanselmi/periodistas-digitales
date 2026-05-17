import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BonusDetailClient from './bonus-detail-client'

export default async function BonusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: item } = await supabase
    .from('bonus_items')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!item) notFound()

  return <BonusDetailClient item={item} />
}
