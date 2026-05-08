'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import UpgradeModal from '@/components/upgrade-modal'

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
  description: string | null
  classes: Class[]
}

type Props = {
  user: { email: string; plan: string; isAdmin: boolean; planExpiresAt?: string | null }
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
  const searchParams = useSearchParams()
  const [watched] = useState<Set<number>>(new Set(watchedIds))
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showActivated, setShowActivated] = useState(false)

  useEffect(() => {
    if (searchParams.get('activated') === '1') {
      setShowActivated(true)
      router.replace('/dashboard', { scroll: false })
    }
  }, [])

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
          <div className="flex items-center gap-1.5">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              user.plan === 'pro'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {user.plan === 'pro' ? 'Pro' : 'Basic'}
            </span>
            {user.plan === 'pro' && user.planExpiresAt && (
              <span className="text-xs text-slate-500 hidden sm:block">
                vence {new Date(user.planExpiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
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

      {/* Modal de upgrade */}
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Banner de activación exitosa */}
      {showActivated && (
        <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-400/10 border-b border-emerald-500/25">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-white font-medium">
                ¡Bienvenido a Leadr Pro! Tu acceso completo está activo.
                <span className="text-emerald-400 ml-1">Explorá todo el contenido sin límites.</span>
              </p>
            </div>
            <button onClick={() => setShowActivated(false)} className="text-slate-500 hover:text-white transition-colors flex-shrink-0 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Banner upgrade — solo para usuarios Basic */}
      {user.plan === 'basic' && (
        <div className="bg-gradient-to-r from-violet-500/10 to-cyan-400/10 border-b border-violet-500/20">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-slate-300 truncate">
                <span className="text-white font-medium">Algunas clases son Pro.</span>
                {' '}Desbloqueá todo el contenido.
              </p>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              className="flex-shrink-0 px-4 py-1.5 bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Ver planes
            </button>
          </div>
        </div>
      )}

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
              <div className="grid sm:grid-cols-2 gap-4">
                {tipoGroups.map(group => {
                  const published = group.classes.filter(c => c.status === 'published')
                  if (published.length === 0) return null
                  const doneCount = published.filter(c => watched.has(c.id)).length
                  const remaining = published.length - doneCount
                  const pct = published.length > 0 ? Math.round((doneCount / published.length) * 100) : 0
                  const isComplete = pct === 100

                  return (
                    <Link
                      key={group.id}
                      href={`/dashboard/grupo/${group.id}`}
                      className="group bg-[#0A0F1E] border border-slate-800 hover:border-slate-600 rounded-2xl p-6 flex flex-col gap-4 transition-colors"
                    >
                      {/* Top: icono + nombre + badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${tipo.bg}`}>
                            <svg className={`w-5 h-5 ${tipo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className={`font-bold text-white group-hover:${tipo.color} transition-colors leading-tight`}>
                            {group.name}
                          </h3>
                        </div>
                        {isComplete ? (
                          <span className="flex-shrink-0 text-xs px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
                            Completado
                          </span>
                        ) : (
                          <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>

                      {/* Descripción */}
                      {group.description && (
                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{group.description}</p>
                      )}

                      {/* Footer: stats + barra */}
                      <div className="mt-auto pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{published.length} {published.length === 1 ? 'clase' : 'clases'}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700" />
                          {isComplete ? (
                            <span className="text-emerald-400">Todas vistas</span>
                          ) : doneCount > 0 ? (
                            <span>{remaining} {remaining === 1 ? 'restante' : 'restantes'}</span>
                          ) : (
                            <span>Sin empezar</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${tipo.dot}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-slate-600 text-xs">{pct}%</span>
                        </div>
                      </div>
                    </Link>
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
