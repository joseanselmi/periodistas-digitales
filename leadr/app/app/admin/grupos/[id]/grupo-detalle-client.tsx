'use client'

import { useState } from 'react'
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
}

type Group = {
  id: number
  name: string
  category: string
  order_index: number
  classes: Class[]
}

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']
const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export default function GrupoDetalleClient({ group: initialGroup }: { group: Group }) {
  const router = useRouter()
  const [group, setGroup] = useState(initialGroup)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialGroup.name)
  const [category, setCategory] = useState(initialGroup.category)
  const [orderIndex, setOrderIndex] = useState(initialGroup.order_index)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function saveGroup() {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('groups')
      .update({ name: name.trim(), category, order_index: orderIndex })
      .eq('id', group.id)
    setSaving(false)
    if (error) { showToast('Error guardando'); return }
    setGroup(prev => ({ ...prev, name: name.trim(), category, order_index: orderIndex }))
    setEditing(false)
    showToast('Grupo actualizado')
  }

  async function toggleClassStatus(cls: Class) {
    const supabase = createClient()
    const newStatus = cls.status === 'published' ? 'draft' : 'published'
    await supabase.from('classes').update({ status: newStatus }).eq('id', cls.id)
    setGroup(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === cls.id ? { ...c, status: newStatus } : c)
    }))
    showToast(`Clase ${newStatus === 'published' ? 'publicada' : 'movida a borrador'}`)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const published = group.classes.filter(c => c.status === 'published').length

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/admin/grupos" className="hover:text-slate-300 transition-colors">Grupos</Link>
          <span>/</span>
          <span className="text-slate-300">{group.name}</span>
        </div>

        {/* Info del grupo + edición */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 mb-6">
          {editing ? (
            <div>
              <h2 className="text-white font-semibold mb-4">Editar grupo</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
                  placeholder="Orden"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveGroup}
                  disabled={saving}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-[#020617] font-semibold text-sm rounded-lg cursor-pointer"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(group.name); setCategory(group.category); setOrderIndex(group.order_index) }}
                  className="px-4 py-2 text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{group.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-400 text-sm capitalize">{group.category}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-400 text-sm">Orden {group.order_index}</span>
                    <span className="text-slate-700">·</span>
                    <span className="text-slate-400 text-sm">{published}/{group.classes.length} publicadas</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Clases del grupo */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Clases en este grupo</h2>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/generar-clase?grupo=${group.id}`}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar con IA
              </Link>
              <Link
                href={`/admin/nueva-clase?grupo=${group.id}`}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 font-medium rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva clase
              </Link>
            </div>
          </div>

          {group.classes.length === 0 ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl py-12 text-center">
              <p className="text-slate-500 text-sm">Sin clases en este grupo aún.</p>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Título</th>
                    <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Plan</th>
                    <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Estado</th>
                    <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {group.classes.map(cls => (
                    <tr key={cls.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">{cls.title}</p>
                        {cls.description && (
                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{cls.description}</p>
                        )}
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
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/preview/${cls.id}`}
                            target="_blank"
                            className="text-slate-400 hover:text-cyan-400 text-xs transition-colors"
                          >
                            Preview
                          </Link>
                          <Link
                            href={`/admin/clase/${cls.id}`}
                            className="text-slate-400 hover:text-white text-xs transition-colors font-medium"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => toggleClassStatus(cls)}
                            className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer"
                          >
                            {cls.status === 'published' ? 'Despublicar' : 'Publicar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
