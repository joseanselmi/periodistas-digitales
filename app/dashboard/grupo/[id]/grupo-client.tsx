'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  classes: Class[]
}

type Props = {
  group: Group
  user: { email: string; plan: string; isAdmin: boolean }
  watchedIds: number[]
}

export default function GrupoClient({ group, user, watchedIds }: Props) {
  const router = useRouter()
  const [watched, setWatched] = useState<Set<number>>(new Set(watchedIds))

  const published = group.classes.filter(c => c.status === 'published')
  const doneCount = published.filter(c => watched.has(c.id)).length
  const progress = published.length > 0 ? Math.round((doneCount / published.length) * 100) : 0

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
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm py-2 px-1 -ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#020617] font-bold text-xs">L</span>
            </div>
            <span className="font-semibold">Leadr</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <a href="/admin" className="flex items-center gap-1.5 text-xs px-3 py-2.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors font-medium">
              Admin
            </a>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            user.plan === 'pro' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-slate-700 text-slate-300'
          }`}>
            {user.plan === 'pro' ? 'Pro' : 'Basic'}
          </span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
            Salir
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header del grupo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors capitalize">{group.category}</Link>
            <span>/</span>
            <span className="text-slate-300">{group.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{group.name}</h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-sm">{published.length} {published.length === 1 ? 'clase' : 'clases'}</p>
            {published.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-slate-500 text-xs">{doneCount}/{published.length} completadas</span>
              </div>
            )}
            {progress === 100 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Completado
              </span>
            )}
          </div>
        </div>

        {/* Lista de clases */}
        {published.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin clases publicadas aún.</p>
        ) : (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-800/60">
              {published.map((cls, idx) => {
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
                    className={`flex items-center gap-4 px-6 py-5 transition-colors group ${
                      locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800/40 cursor-pointer'
                    }`}
                  >
                    {/* Número / check */}
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                      isDone
                        ? 'bg-cyan-400/15 text-cyan-400'
                        : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {isDone ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium leading-snug ${isDone ? 'text-slate-400' : 'text-white'}`}>
                        {cls.title}
                      </p>
                      {cls.description && (
                        <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{cls.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        {cls.video_url && (
                          <span className="flex items-center gap-1 text-slate-600 text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            Video
                          </span>
                        )}
                        {cls.slides_url && (
                          <span className="flex items-center gap-1 text-slate-600 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            Slides
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cls.plan_required === 'pro' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">Pro</span>
                      )}
                      {locked ? (
                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
