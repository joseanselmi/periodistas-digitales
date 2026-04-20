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
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  clases: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  prompts: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  automatizaciones: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  bonus: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
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
  const totalClases = groups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
  const totalWatched = groups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published' && watched.has(c.id)).length, 0)

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col">
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
            <a href="/admin" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </a>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            user.plan === 'pro' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-slate-700 text-slate-300'
          }`}>
            {user.plan === 'pro' ? 'Pro' : 'Basic'}
          </span>
          <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
            Salir
          </button>
        </div>
      </nav>

      {/* Layout con sidebar */}
      <div className="flex flex-1">
        {/* Sidebar izquierdo */}
        <aside className="w-52 shrink-0 min-h-full bg-[#0A0F1E] border-r border-slate-800 flex flex-col sticky top-[57px] h-[calc(100vh-57px)]">
          <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
            <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Contenido</p>
            {CATEGORIES.map(cat => {
              const catGroups = groups.filter(g => g.category === cat)
              const catPublished = catGroups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  {catPublished > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-cyan-400/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {catPublished}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Progreso general */}
          <div className="px-4 py-4 border-t border-slate-800/60">
            <p className="text-slate-500 text-xs mb-2">Progreso general</p>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: totalClases > 0 ? `${Math.round((totalWatched / totalClases) * 100)}%` : '0%' }}
              />
            </div>
            <p className="text-slate-600 text-xs">{totalWatched}/{totalClases} clases</p>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 px-6 py-8 overflow-x-hidden">
          <div className="max-w-4xl">
            {/* Título de categoría */}
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-white">{CATEGORY_LABELS[activeCategory]}</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {filteredGroups.length === 0
                  ? 'Sin contenido aún'
                  : `${filteredGroups.length} ${filteredGroups.length === 1 ? 'módulo' : 'módulos'}`}
              </p>
            </div>

            {/* Grupos como tarjetas */}
            {filteredGroups.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay contenido en esta categoría aún.</p>
            ) : (
              <div className="space-y-4">
                {filteredGroups.map(group => {
                  const published = group.classes.filter(c => c.status === 'published')
                  const doneCount = published.filter(c => watched.has(c.id)).length
                  const progress = published.length > 0 ? Math.round((doneCount / published.length) * 100) : 0
                  return (
                    <div key={group.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                      {/* Header clickeable */}
                      <div
                        onClick={() => router.push(`/dashboard/grupo/${group.id}`)}
                        className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 cursor-pointer hover:bg-slate-800/30 transition-colors group/header"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center group-hover/header:bg-cyan-400/20 transition-colors">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-white font-semibold text-sm group-hover/header:text-cyan-400 transition-colors">{group.name}</h2>
                            <p className="text-slate-500 text-xs mt-0.5">{published.length} {published.length === 1 ? 'clase' : 'clases'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {published.length > 0 && (
                            <>
                              <div className="hidden sm:flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-slate-500 text-xs">{doneCount}/{published.length}</span>
                              </div>
                              {progress === 100 && (
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">Completado</span>
                              )}
                            </>
                          )}
                          <svg className="w-4 h-4 text-slate-600 group-hover/header:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Clases */}
                      {published.length === 0 ? (
                        <p className="px-6 py-5 text-slate-600 text-sm">Sin clases publicadas aún.</p>
                      ) : (
                        <div className="divide-y divide-slate-800/50">
                          {published.map((cls, idx) => {
                            const locked = cls.plan_required === 'pro' && user.plan === 'basic'
                            const isDone = watched.has(cls.id)
                            return (
                              <div
                                key={cls.id}
                                onClick={() => !locked && router.push(`/clase/${cls.id}`)}
                                className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                                  locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/40 cursor-pointer'
                                }`}
                              >
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  isDone ? 'bg-cyan-400/15 text-cyan-400' : 'bg-slate-800 text-slate-500'
                                }`}>
                                  {isDone ? (
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                    </svg>
                                  ) : String(idx + 1).padStart(2, '0')}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium leading-snug ${isDone ? 'text-slate-400' : 'text-white'}`}>{cls.title}</p>
                                  {cls.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{cls.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {cls.plan_required === 'pro' && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">Pro</span>
                                  )}
                                  {locked ? (
                                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
