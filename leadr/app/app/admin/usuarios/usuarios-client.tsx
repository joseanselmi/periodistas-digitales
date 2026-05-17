'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserRow {
  id: string
  email: string
  plan: string
  created_at: string
  classesWatched: number
}

interface ClassStats {
  id: number
  title: string
  group_name: string
  watches: number
  avg_rating: number | null
  rating_count: number
}

interface Stats {
  totalUsers: number
  proUsers: number
  basicUsers: number
  newLast7: number
  newLast30: number
  totalWatches: number
  users: UserRow[]
  topClasses: ClassStats[]
  topRated: ClassStats[]
  lowRated: ClassStats[]
}

const STAR_LABELS = ['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente']

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-slate-600 text-xs">Sin valoraciones</span>
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(value) ? 'text-amber-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-400 text-xs ml-1">{value.toFixed(1)}</span>
    </div>
  )
}

export default function UsuariosClient() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'usuarios' | 'clases' | 'valoraciones'>('usuarios')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [
        { data: users },
        { data: progress },
        { data: classes },
        { data: ratings },
      ] = await Promise.all([
        supabase.from('users').select('id, email, plan, created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('user_progress').select('user_id, class_id').limit(5000),
        supabase.from('classes').select('id, title, groups(name)').eq('status', 'published'),
        supabase.from('class_ratings').select('class_id, rating, user_id').limit(5000),
      ])

      if (!users || !progress || !classes) { setLoading(false); return }

      const now = Date.now()
      const d7 = now - 7 * 86400000
      const d30 = now - 30 * 86400000

      // Conteo de clases vistas por usuario
      const watchesByUser: Record<string, number> = {}
      for (const p of progress) {
        watchesByUser[p.user_id] = (watchesByUser[p.user_id] || 0) + 1
      }

      // Conteo de vistas por clase
      const watchesByClass: Record<number, number> = {}
      for (const p of progress) {
        watchesByClass[p.class_id] = (watchesByClass[p.class_id] || 0) + 1
      }

      // Ratings por clase
      const ratingsByClass: Record<number, number[]> = {}
      for (const r of (ratings ?? [])) {
        if (!ratingsByClass[r.class_id]) ratingsByClass[r.class_id] = []
        ratingsByClass[r.class_id].push(r.rating)
      }

      const classStats: ClassStats[] = (classes as { id: number; title: string; groups: { name: string } | null }[]).map(c => {
        const rs = ratingsByClass[c.id] ?? []
        const avg = rs.length > 0 ? rs.reduce((a, b) => a + b, 0) / rs.length : null
        return {
          id: c.id,
          title: c.title,
          group_name: c.groups?.name ?? '—',
          watches: watchesByClass[c.id] ?? 0,
          avg_rating: avg,
          rating_count: rs.length,
        }
      })

      const topClasses = [...classStats].sort((a, b) => b.watches - a.watches).slice(0, 10)
      const rated = classStats.filter(c => c.rating_count >= 1)
      const topRated = [...rated].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)).slice(0, 5)
      const lowRated = [...rated].sort((a, b) => (a.avg_rating ?? 5) - (b.avg_rating ?? 5)).slice(0, 5)

      const userRows: UserRow[] = users.map(u => ({
        id: u.id,
        email: u.email,
        plan: u.plan,
        created_at: u.created_at,
        classesWatched: watchesByUser[u.id] ?? 0,
      }))

      setStats({
        totalUsers: users.length,
        proUsers: users.filter(u => u.plan === 'pro').length,
        basicUsers: users.filter(u => u.plan === 'basic').length,
        newLast7: users.filter(u => new Date(u.created_at).getTime() > d7).length,
        newLast30: users.filter(u => new Date(u.created_at).getTime() > d30).length,
        totalWatches: progress.length,
        users: userRows,
        topClasses,
        topRated,
        lowRated,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return <p className="text-slate-500 p-8">Sin datos</p>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Usuarios y Clases</h1>
        <p className="text-slate-400 text-sm mt-1">Métricas de uso y valoraciones de la plataforma</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Usuarios totales', value: stats.totalUsers, color: 'text-white' },
          { label: 'Plan Pro', value: stats.proUsers, color: 'text-violet-400' },
          { label: 'Nuevos (7d)', value: stats.newLast7, color: 'text-cyan-400' },
          { label: 'Clases vistas (total)', value: stats.totalWatches, color: 'text-green-400' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-500 text-xs mb-2">{k.label}</p>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {([
          { key: 'usuarios', label: 'Usuarios' },
          { key: 'clases', label: 'Clases más vistas' },
          { key: 'valoraciones', label: 'Valoraciones' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === t.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Usuarios */}
      {tab === 'usuarios' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Email</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Plan</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Clases vistas</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Registro</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 text-slate-300">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        u.plan === 'pro'
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-800 rounded-full h-1.5 w-24">
                          <div
                            className="h-1.5 rounded-full bg-cyan-500"
                            style={{ width: `${Math.min((u.classesWatched / Math.max(stats.totalWatches / stats.totalUsers * 3, 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold w-6 text-right">{u.classesWatched}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Clases más vistas */}
      {tab === 'clases' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-500 font-medium px-5 py-3">#</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Clase</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Módulo</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Vistas</th>
                  <th className="text-left text-slate-500 font-medium px-5 py-3">Valoración</th>
                </tr>
              </thead>
              <tbody>
                {stats.topClasses.map((c, i) => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 text-slate-600 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 text-slate-200 max-w-xs">
                      <span className="line-clamp-2">{c.title}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{c.group_name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-cyan-500"
                            style={{ width: `${(c.watches / (stats.topClasses[0]?.watches || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-white font-semibold">{c.watches}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <Stars value={c.avg_rating} />
                        {c.rating_count > 0 && (
                          <span className="text-slate-600 text-xs">{c.rating_count} reseña{c.rating_count !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Valoraciones */}
      {tab === 'valoraciones' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top rated */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⭐</span>
              <h3 className="text-white font-semibold text-sm">Las más valoradas</h3>
            </div>
            {stats.topRated.length === 0 ? (
              <p className="text-slate-600 text-sm">Sin valoraciones todavía</p>
            ) : (
              <div className="space-y-4">
                {stats.topRated.map(c => (
                  <div key={c.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm leading-snug line-clamp-2">{c.title}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{c.group_name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Stars value={c.avg_rating} />
                      <p className="text-slate-600 text-xs mt-0.5">{c.rating_count} reseña{c.rating_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lowest rated — para mejorar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚠️</span>
              <h3 className="text-white font-semibold text-sm">Para mejorar</h3>
            </div>
            {stats.lowRated.length === 0 ? (
              <p className="text-slate-600 text-sm">Sin valoraciones todavía</p>
            ) : (
              <div className="space-y-4">
                {stats.lowRated.map(c => (
                  <div key={c.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm leading-snug line-clamp-2">{c.title}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{c.group_name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Stars value={c.avg_rating} />
                      <p className="text-slate-600 text-xs mt-0.5">{c.rating_count} reseña{c.rating_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distribución de notas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2">
            <h3 className="text-white font-semibold text-sm mb-4">Distribución de valoraciones</h3>
            <RatingDistribution topClasses={stats.topClasses} />
          </div>
        </div>
      )}
    </div>
  )
}

function RatingDistribution({ topClasses }: { topClasses: ClassStats[] }) {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  // Esta función solo tiene acceso a avg_rating y rating_count por clase
  // Para distribución exacta necesitaríamos los ratings individuales
  // Aproximamos: si avg es 4.5 con 2 reseñas → contamos 2 en bucket 5
  for (const c of topClasses) {
    if (c.avg_rating !== null && c.rating_count > 0) {
      const bucket = Math.round(c.avg_rating) as 1 | 2 | 3 | 4 | 5
      dist[bucket] = (dist[bucket] || 0) + c.rating_count
    }
  }
  const max = Math.max(...Object.values(dist), 1)
  const total = Object.values(dist).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map(star => (
        <div key={star} className="flex items-center gap-3">
          <div className="flex items-center gap-1 w-24 shrink-0">
            {[1, 2, 3, 4, 5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= star ? 'text-amber-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="flex-1 bg-slate-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-amber-400 transition-all duration-700"
              style={{ width: `${(dist[star] / max) * 100}%` }}
            />
          </div>
          <span className="text-slate-400 text-xs w-16 text-right">
            {dist[star]} ({total > 0 ? Math.round((dist[star] / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  )
}
