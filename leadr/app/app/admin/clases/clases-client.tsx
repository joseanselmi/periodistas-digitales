'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Class = {
  id: number
  title: string
  description: string | null
  status: string
  plan_required: string
  created_at: string
  groups: { name: string; category: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export default function ClasesClient({ classes }: { classes: Class[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [toast, setToast] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Clases</h1>
            <p className="text-slate-400 text-sm mt-1">
              {classes.filter(c => c.status === 'published').length} publicadas ·{' '}
              {classes.filter(c => c.status === 'draft').length} borradores
            </p>
          </div>
          <div className="flex items-center gap-3">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva clase
                <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0F172A] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <Link
                    href="/admin/generar-clase"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-white hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <p className="font-medium">Generar con IA</p>
                      <p className="text-slate-500 text-xs">Claude genera el contenido</p>
                    </div>
                  </Link>
                  <div className="border-t border-slate-800" />
                  <Link
                    href="/admin/nueva-clase"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-white hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div>
                      <p className="font-medium">Manual</p>
                      <p className="text-slate-500 text-xs">Completar slides a mano</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm">
              No hay clases.{' '}
              <Link href="/admin/generar-clase" className="text-cyan-400 hover:underline">Generá una con IA</Link>
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
                        cls.plan_required === 'pro' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-700 text-slate-400'
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
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/preview/${cls.id}`}
                          target="_blank"
                          className="text-slate-400 hover:text-cyan-400 text-xs transition-colors py-2 px-2"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/clase/${cls.id}`}
                          className="text-slate-400 hover:text-white text-xs transition-colors font-medium py-2 px-2"
                        >
                          Ver detalle
                        </Link>
                        <button
                          onClick={() => toggleStatus(cls)}
                          className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer py-2 px-2"
                        >
                          {cls.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer py-2 px-2"
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
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
