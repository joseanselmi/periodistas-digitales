'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Group = { id: number; name: string; category: string }
type Class = {
  id: number
  title: string
  description: string | null
  status: string
  plan_required: string
  video_url: string | null
  created_at: string
  groups: { name: string; category: string } | null
}

type Props = { classes: Class[]; groups: Group[] }

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export default function AdminClient({ classes, groups }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [toast, setToast] = useState('')

  const filtered = classes.filter(c => filter === 'all' || c.status === filter)

  async function toggleStatus(cls: Class) {
    const supabase = createClient()
    const newStatus = cls.status === 'published' ? 'draft' : 'published'
    await supabase.from('classes').update({ status: newStatus }).eq('id', cls.id)
    showToast(`Clase ${newStatus === 'published' ? 'publicada' : 'movida a borrador'}`)
    router.refresh()
  }

  async function deleteClass(id: number) {
    if (!confirm('¿Eliminar esta clase?')) return
    const supabase = createClient()
    await supabase.from('classes').delete().eq('id', id)
    showToast('Clase eliminada')
    router.refresh()
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header + stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Contenido</h1>
            <p className="text-slate-400 text-sm mt-1">
              {classes.filter(c => c.status === 'published').length} publicadas ·{' '}
              {classes.filter(c => c.status === 'draft').length} borradores
            </p>
          </div>
          {/* Filtros */}
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            {(['all', 'published', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  filter === f ? 'bg-[#0F172A] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'published' ? 'Publicadas' : 'Borradores'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No hay clases.{' '}
              <Link href="/admin/nueva-clase" className="text-cyan-400 hover:underline">
                Crear una
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Título</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Grupo</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Plan</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map(cls => (
                  <tr key={cls.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{cls.title}</p>
                      {cls.description && (
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{cls.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-slate-400 text-sm">{cls.groups?.name ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        cls.plan_required === 'pro'
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {cls.plan_required === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[cls.status]}`}>
                        {cls.status === 'published' ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/preview/${cls.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Preview
                        </Link>
                        <Link
                          href={`/admin/clase/${cls.id}`}
                          className="text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => toggleStatus(cls)}
                          className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                        >
                          {cls.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Grupos */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Grupos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {groups.map(g => (
              <div key={g.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4">
                <p className="text-white text-sm font-medium truncate">{g.name}</p>
                <p className="text-slate-500 text-xs mt-1 capitalize">{g.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
