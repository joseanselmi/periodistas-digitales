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

const SECCIONES = [
  {
    key: 'clases',
    label: 'Clases',
    color: 'text-cyan-400',
    activeText: 'text-cyan-400',
    activeBg: 'bg-cyan-400/10',
    activeBorder: 'border-cyan-400/30',
    dot: 'bg-cyan-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'automatizaciones',
    label: 'Automatizaciones',
    color: 'text-amber-400',
    activeText: 'text-amber-400',
    activeBg: 'bg-amber-400/10',
    activeBorder: 'border-amber-400/30',
    dot: 'bg-amber-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: 'prompts',
    label: 'Prompts',
    color: 'text-violet-400',
    activeText: 'text-violet-400',
    activeBg: 'bg-violet-400/10',
    activeBorder: 'border-violet-400/30',
    dot: 'bg-violet-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'bonus',
    label: 'Bonus',
    color: 'text-emerald-400',
    activeText: 'text-emerald-400',
    activeBg: 'bg-emerald-400/10',
    activeBorder: 'border-emerald-400/30',
    dot: 'bg-emerald-400',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
]

export default function DashboardClient({ user, groups, watchedIds }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [watched] = useState<Set<number>>(new Set(watchedIds))
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showActivated, setShowActivated] = useState(false)
  const [activeSection, setActiveSection] = useState('clases')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const activeSeccion = SECCIONES.find(s => s.key === activeSection)!
  const activeGroups = groups
    .filter(g => g.category === activeSection)
    .sort((a, b) => a.order_index - b.order_index)

  const publishedInSection = activeGroups.reduce(
    (acc, g) => acc + g.classes.filter(c => c.status === 'published').length,
    0
  )

  function countForSection(key: string) {
    return groups
      .filter(g => g.category === key)
      .reduce((acc, g) => acc + g.classes.filter(c => c.status === 'published').length, 0)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">

      {/* ── Overlay móvil ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-[#060c1a] border-r border-slate-800/80 flex flex-col z-30
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:flex-shrink-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-800/60 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[#020617] font-bold text-xs">L</span>
          </div>
          <span className="font-bold text-white tracking-tight">Leadr</span>
        </div>

        {/* Navegación de secciones */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-2 mb-3">Secciones</p>
          {SECCIONES.map(s => {
            const count = countForSection(s.key)
            const isActive = activeSection === s.key
            return (
              <button
                key={s.key}
                onClick={() => { setActiveSection(s.key); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer
                  ${isActive
                    ? `${s.activeBg} ${s.activeText} border ${s.activeBorder}`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
              >
                <span className={`flex-shrink-0 ${isActive ? s.activeText : 'text-slate-500'}`}>
                  {s.icon}
                </span>
                <span className="flex-1">{s.label}</span>
                {count > 0 ? (
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${isActive ? `${s.activeBg} ${s.activeText}` : 'bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-700 font-medium">pronto</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Progreso general */}
        <div className="px-5 py-4 border-t border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Progreso total</span>
            <span className="font-mono">{totalWatched}/{totalPublished}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Usuario */}
        <div className="px-4 py-4 border-t border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-slate-300 font-medium">{user.email[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 truncate">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  user.plan === 'pro'
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {user.plan === 'pro' ? 'Pro' : 'Basic'}
                </span>
                {user.plan === 'pro' && user.planExpiresAt && (
                  <span className="text-[10px] text-slate-600">
                    vence {new Date(user.planExpiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {user.isAdmin && (
              <Link
                href="/admin"
                className="flex-1 text-center text-xs px-2 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 transition-colors font-medium"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 text-center text-xs px-2 py-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-transparent"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ── Columna principal ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar móvil */}
        <header className="lg:hidden sticky top-0 z-10 bg-[#020617]/95 backdrop-blur border-b border-slate-800 px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-cyan-400 flex items-center justify-center">
              <span className="text-[#020617] font-bold text-[9px]">L</span>
            </div>
            <span className="font-bold text-sm">Leadr</span>
          </div>
          <span className={`ml-auto text-sm font-semibold ${activeSeccion.activeText}`}>{activeSeccion.label}</span>
        </header>

        {/* Banners */}
        {showActivated && (
          <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-400/10 border-b border-emerald-500/25">
            <div className="px-6 py-3 flex items-center justify-between gap-4">
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

        {user.plan === 'basic' && (
          <div className="bg-gradient-to-r from-violet-500/10 to-cyan-400/10 border-b border-violet-500/20">
            <div className="px-6 py-3 flex items-center justify-between gap-4">
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

        {/* Contenido principal */}
        <main className="flex-1 px-6 py-8">
          {/* Cabecera de sección */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-2 h-7 rounded-full ${activeSeccion.dot}`} />
            <div>
              <h1 className={`text-2xl font-bold ${activeSeccion.activeText}`}>{activeSeccion.label}</h1>
              {publishedInSection > 0 && (
                <p className="text-slate-500 text-sm mt-0.5">
                  {activeGroups.filter(g => g.classes.some(c => c.status === 'published')).length} {activeGroups.length === 1 ? 'módulo' : 'módulos'} · {publishedInSection} clases
                </p>
              )}
            </div>
          </div>

          {/* Estado vacío */}
          {publishedInSection === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className={`w-16 h-16 rounded-2xl ${activeSeccion.activeBg} border ${activeSeccion.activeBorder} flex items-center justify-center mb-5`}>
                <span className={`${activeSeccion.activeText}`}>{activeSeccion.icon}</span>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Próximamente</h2>
              <p className="text-slate-500 text-sm max-w-xs">
                Estamos preparando el contenido de <span className={activeSeccion.activeText}>{activeSeccion.label}</span>. Pronto estará disponible.
              </p>
            </div>
          )}

          {/* Grid de grupos */}
          {publishedInSection > 0 && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeGroups.map(group => {
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
                    className="group bg-[#0A0F1E] border border-slate-800 hover:border-slate-600 rounded-2xl p-6 flex flex-col gap-4 transition-all hover:shadow-lg hover:shadow-black/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${activeSeccion.activeBg} ${activeSeccion.activeBorder}`}>
                          <span className={activeSeccion.activeText}>{activeSeccion.icon}</span>
                        </div>
                        <h3 className="font-bold text-white leading-tight text-sm group-hover:text-slate-200 transition-colors">
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

                    {group.description && (
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{group.description}</p>
                    )}

                    <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3">
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
                          <div className={`h-full rounded-full transition-all ${activeSeccion.dot}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-slate-600 text-xs">{pct}%</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}
