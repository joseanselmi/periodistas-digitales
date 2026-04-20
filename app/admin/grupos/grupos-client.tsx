'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Group = {
  id: number
  name: string
  category: string
  order_index: number
  classes: { id: number; status: string }[]
}

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']
const CATEGORY_COLORS: Record<string, string> = {
  clases: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  prompts: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  automatizaciones: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  bonus: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
}

export default function GruposClient({ groups: initialGroups }: { groups: Group[] }) {
  const router = useRouter()
  const [groups, setGroups] = useState(initialGroups)
  const [toast, setToast] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState('clases')
  const [newOrder, setNewOrder] = useState(0)
  const [saving, setSaving] = useState(false)

  async function createGroup() {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newName.trim(), category: newCategory, order_index: newOrder })
      .select('*, classes(id, status)')
      .single()
    setSaving(false)
    if (error || !data) { showToast('Error creando grupo'); return }
    setGroups(prev => [...prev, data])
    setNewName('')
    setShowForm(false)
    showToast('Grupo creado')
  }

  async function deleteGroup(id: number) {
    if (!confirm('¿Eliminar este grupo? Las clases quedarán sin grupo.')) return
    const supabase = createClient()
    const { error } = await supabase.from('groups').delete().eq('id', id)
    if (error) { showToast('Error eliminando'); return }
    setGroups(prev => prev.filter(g => g.id !== id))
    showToast('Grupo eliminado')
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Grupos</h1>
            <p className="text-slate-400 text-sm mt-1">{groups.length} grupos · organizan el contenido en el dashboard</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo grupo
          </button>
        </div>

        {/* Form nuevo grupo */}
        {showForm && (
          <div className="bg-[#0F172A] border border-cyan-400/30 rounded-xl p-5 mb-5">
            <h2 className="text-white font-medium text-sm mb-4">Nuevo grupo</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                placeholder="Nombre del grupo *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createGroup()}
                autoFocus
                className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <input
                type="number"
                placeholder="Orden (0, 1, 2…)"
                value={newOrder}
                onChange={e => setNewOrder(parseInt(e.target.value) || 0)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createGroup}
                disabled={saving || !newName.trim()}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#020617] font-semibold text-sm rounded-lg transition-colors cursor-pointer"
              >
                {saving ? 'Creando…' : 'Crear grupo'}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName('') }}
                className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de grupos */}
        {groups.length === 0 ? (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl py-16 text-center">
            <p className="text-slate-500 text-sm">No hay grupos aún.</p>
          </div>
        ) : (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider">Categoría</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Orden</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Clases</th>
                  <th className="px-5 py-3 text-slate-400 text-xs font-medium uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {groups.map(g => {
                  const total = g.classes?.length ?? 0
                  const published = g.classes?.filter(c => c.status === 'published').length ?? 0
                  return (
                    <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-white text-sm font-medium">{g.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${CATEGORY_COLORS[g.category] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                          {g.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-slate-400 text-sm">{g.order_index}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-slate-400 text-sm">{published}/{total} publicadas</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/grupos/${g.id}`}
                            className="text-slate-400 hover:text-white text-xs transition-colors font-medium"
                          >
                            Ver detalle
                          </Link>
                          <button
                            onClick={() => deleteGroup(g.id)}
                            className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
