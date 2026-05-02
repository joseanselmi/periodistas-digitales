'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const TIPOS = [
  { key: 'clases',          label: 'Clases',           color: 'text-cyan-400',    bg: 'bg-cyan-400/10 border-cyan-400/20',    dot: 'bg-cyan-400' },
  { key: 'prompts',         label: 'Prompts',           color: 'text-violet-400',  bg: 'bg-violet-400/10 border-violet-400/20', dot: 'bg-violet-400' },
  { key: 'automatizaciones',label: 'Automatizaciones',  color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',   dot: 'bg-amber-400' },
  { key: 'bonus',           label: 'Bonus',             color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
]

export default function DashboardClient({ user, groups, watchedIds }: Props) {
  const router = useRouter()
  const [watched] = useState<Set<number>>(new Set(watchedIds))

  const totalPublished = groups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
  const totalWatched = groups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published' && watched.has(c.id)).length, 0)
  const progressPct = totalPublished > 0 ? Math.round((totalWatched / totalPublished) * 100) : 0

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#020617]/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center" aria-hidden="true">
            <span className="text-[#020617] font-bold text-xs">L</span>
          </div>
          <span className="font-semibold">Leadr</span>
        </div>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors font-medium">
              Admin
            </Link>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            user.plan === 'pro'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {user.plan === 'pro' ? 'Pro' : 'Basic'}
          </span>
          <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
            Salir
          </button>
        </div>
      </nav>

      {/* Tabs de tipo — anclas de scroll */}
      <div className="sticky top-[57px] z-10 bg-[#020617]/95 backdrop-blur border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-1 py-2">
          {TIPOS.map(t => {
            const count = groups.filter(g => g.category === t.key).reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
            if (count === 0) return null
            return (
              <a
                key={t.key}
                href={`#${t.key}`}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-slate-400 hover:text-white hover:bg-slate-800`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                {t.label}
                <span className="text-slate-600 font-mono">{count}</span>
              </a>
            )
          })}

          {/* Progreso general al lado derecho */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="text-slate-500 text-xs">{totalWatched}/{totalPublished}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido — todas las secciones */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        {TIPOS.map(tipo => {
          const tipoGroups = groups
            .filter(g => g.category === tipo.key)
            .sort((a, b) => a.order_index - b.order_index)

          const tipoPublished = tipoGroups.reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
          if (tipoPublished === 0) return null

          return (
            <section key={tipo.key} id={tipo.key}>
              {/* Cabecera de tipo */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-2 h-6 rounded-full ${tipo.dot}`} />
                <h2 className={`text-xl font-bold ${tipo.color}`}>{tipo.label}</h2>
                <span className="text-slate-600 text-sm">{tipoGroups.length} {tipoGroups.length === 1 ? 'módulo' : 'módulos'}</span>
              </div>

              {/* Cards de grupos */}
              <div className="grid gap-4">
                {tipoGroups.map(group => {
                  const published = group.classes.filter(c => c.status === 'published')
                  if (published.length === 0) return null
                  const doneCount = published.filter(c => watched.has(c.id)).length
                  const pct = published.length > 0 ? Math.round((doneCount / published.length) * 100) : 0
                  const isComplete = pct === 100

                  return (
                    <div key={group.id} className="bg-[#0A0F1E] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
                      {/* Header del grupo */}
                      <Link
                        href={`/dashboard/grupo/${group.id}`}
                        className="flex items-center justify-between px-6 py-5 group/header"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${tipo.bg}`}>
                            <svg className={`w-5 h-5 ${tipo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold group-hover/header:text-cyan-400 transition-colors">{group.name}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">{published.length} {published.length === 1 ? 'clase' : 'clases'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {isComplete ? (
                            <span className="text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">Completado</span>
                          ) : (
                            <div className="hidden sm:flex items-center gap-2">
                              <span className="text-slate-400 text-xs">{doneCount}/{published.length}</span>
                              <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${tipo.dot}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                          <svg className="w-4 h-4 text-slate-600 group-hover/header:text-slate-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>

                      {/* Clases (preview de las primeras 4) */}
                      <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
                        {published.slice(0, 4).map((cls, idx) => {
                          const locked = cls.plan_required === 'pro' && user.plan === 'basic'
                          const isDone = watched.has(cls.id)
                          return (
                            <div
                              key={cls.id}
                              role="button"
                              tabIndex={locked ? -1 : 0}
                              aria-disabled={locked}
                              onClick={() => !locked && router.push(`/clase/${cls.id}`)}
                              onKeyDown={e => { if (!locked && (e.key === 'Enter' || e.key === ' ')) router.push(`/clase/${cls.id}`) }}
                              className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${
                                locked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800/40 cursor-pointer'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isDone ? 'bg-cyan-400/15 text-cyan-400' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {isDone ? (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                ) : String(idx + 1).padStart(2, '0')}
                              </span>
                              <p className={`text-sm flex-1 min-w-0 truncate ${isDone ? 'text-slate-500' : 'text-slate-200'}`}>
                                {cls.title}
                              </p>
                              {cls.plan_required === 'pro' && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 flex-shrink-0">Pro</span>
                              )}
                              {locked && (
                                <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          )
                        })}

                        {/* "Ver todas" si hay más de 4 */}
                        {published.length > 4 && (
                          <Link
                            href={`/dashboard/grupo/${group.id}`}
                            className="flex items-center justify-center gap-1.5 px-6 py-3 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                          >
                            Ver las {published.length - 4} clases restantes
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
