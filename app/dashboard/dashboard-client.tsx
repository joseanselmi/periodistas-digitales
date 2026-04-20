'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Class = {
  id: number
  title: string
  description: string | null
  plan_required: string
  status: string
  video_url: string | null
  slides_url: string | null
}

type Group = {
  id: number
  name: string
  category: string
  order_index: number
  classes: Class[]
}

type Props = {
  user: { email: string; plan: string; isAdmin: boolean }
  groups: Group[]
  watchedIds: number[]
}

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']
const CATEGORY_LABELS: Record<string, string> = {
  clases: 'Clases',
  prompts: 'Prompts',
  automatizaciones: 'Automatizaciones',
  bonus: 'Bonus',
}

export default function DashboardClient({ user, groups, watchedIds }: Props) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('clases')
  const [watched, setWatched] = useState<Set<number>>(new Set(watchedIds))

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const filteredGroups = groups.filter(g => g.category === activeCategory)

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center">
            <span className="text-[#020617] font-bold text-xs">L</span>
          </div>
          <span className="font-semibold">Leadr</span>
        </div>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors font-medium"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </a>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            user.plan === 'pro'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {user.plan === 'pro' ? 'Pro' : 'Basic'}
          </span>
          <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs de categoría */}
        <div className="flex gap-1 bg-slate-900 rounded-xl p-1 w-fit mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0F172A] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Grupos */}
        {filteredGroups.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay contenido en esta categoría aún.</p>
        ) : (
          <div className="space-y-8">
            {filteredGroups.map(group => (
              <div key={group.id}>
                <h2 className="text-slate-300 font-medium text-sm mb-3 uppercase tracking-wider">
                  {group.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.classes
                    .filter(c => c.status === 'published')
                    .map(cls => {
                      const locked = cls.plan_required === 'pro' && user.plan === 'basic'
                      const isDone = watched.has(cls.id)
                      return (
                        <div
                          key={cls.id}
                          onClick={() => !locked && router.push(`/clase/${cls.id}`)}
                          className={`bg-[#0F172A] border rounded-xl p-5 transition-all ${
                            locked
                              ? 'border-slate-800 opacity-60 cursor-not-allowed'
                              : 'border-slate-800 hover:border-cyan-400/40 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-white text-sm font-medium leading-snug">
                              {cls.title}
                            </h3>
                            {locked && (
                              <svg className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                              </svg>
                            )}
                            {isDone && !locked && (
                              <svg className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {cls.description && (
                            <p className="text-slate-500 text-xs line-clamp-2">{cls.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              cls.plan_required === 'pro'
                                ? 'bg-violet-500/20 text-violet-300'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              {cls.plan_required === 'pro' ? 'Pro' : 'Free'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
