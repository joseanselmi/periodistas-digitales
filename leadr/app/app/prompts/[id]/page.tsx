import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PromptDetailClient from './prompt-detail-client'
import type { Prompt } from '@/app/dashboard/prompt-library'

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: prompt }, { data: relatedRaw }] = await Promise.all([
    supabase.from('prompts').select('*').eq('id', id).eq('status', 'published').single(),
    supabase.from('prompts').select('id, title, use_case, tool, difficulty, time_estimate, description').eq('status', 'published'),
  ])

  if (!prompt) notFound()

  const related = (relatedRaw ?? []).filter(p =>
    (prompt.related_ids ?? []).includes(p.id)
  )

  return (
    <PromptDetailClient
      prompt={prompt as Prompt}
      related={related}
    />
  )
}
