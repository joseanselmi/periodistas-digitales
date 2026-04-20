'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Group = { id: number; name: string; category: string; order_index: number }
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

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  draft: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

const BLANK_GROUP = { name: '', category: 'clases', order_index: 0 }

export default function AdminClient({ classes, groups: initialGroups }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [toast, setToast] = useState('')
  const [groups, setGroups] = useState<Group[]>(initialGroups)

  // Group form state
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroup, setNewGroup] = useState(BLANK_GROUP)
  const [savingGroup, setSavingGroup] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null)
  const [editGroupData, setEditGroupData] = useState(BLANK_GROUP)

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

  async function createGroup() {
    if (!newGroup.name.trim()) return
    setSavingGroup(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newGroup.name.trim(), category: newGroup.category, order_index: newGroup.order_index })
      .select()
      .single()
    setSavingGroup(false)
    if (error) { showToast('Error creando grupo'); return }
    setGroups(prev => [...prev, data])
    setNewGroup(BLANK_GROUP)
    setShowNewGroup(false)
    showToast('Grupo creado')
  }

  async function saveEditGroup() {
    if (!editGroupData.name.trim() || editingGroupId === null) return
    setSavingGroup(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('groups')
      .update({ name: editGroupData.name.trim(), category: editGroupData.category, order_index: editGroupData.order_index })
      .eq('id', editingGroupId)
    setSavingGroup(false)
    if (error) { showToast('Error guardando grupo'); return }
    setGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, ...editGroupData } : g))
    setEditingGroupId(null)
    showToast('Grupo actualizado')
  }

  async function deleteGroup(id: number) {
    if (!confirm('¿Eliminar este grupo? Las clases dentro quedarán sin grupo.')) return
    const supabase = createClient()
    const { error } = await supabase.from('groups').delete().eq('id', id)
    if (error) { showToast('Error eliminando grupo'); return }
    setGroups(prev => prev.filter(g => g.id !== id))
    showToast('Grupo eliminado')
  }

  function startEdit(g: Group) {
    setEditingGroupId(g.id)
    setEditGroupData({ name: g.name, category: g.category, order_index: g.order_index })
    setShowNewGroup(false)
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

        {/* Tabla clases */}
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
                        <Link href={`/admin/clase/${cls.id}`} className="text-slate-400 hover:text-white text-xs transition-colors cursor-pointer">
                          Editar
                        </Link>
                        <button onClick={() => toggleStatus(cls)} className="text-slate-400 hover:text-cyan-400 text-xs transition-colors cursor-pointer">
                          {cls.status === 'published' ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button onClick={() => deleteClass(cls.id)} className="text-slate-400 hover:text-red-400 text-xs transition-colors cursor-pointer">
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
            <div>
              <h2 className="text-white font-medium">Grupos</h2>
              <p className="text-slate-500 text-xs mt-0.5">{groups.length} grupos · organizan el contenido en el dashboard</p>
            </div>
            <button
              onClick={() => { setShowNewGroup(true); setEditingGroupId(null) }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/25 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo grupo
            </button>
          </div>

          {/* Form crear grupo */}
          {showNewGroup && (
            <div className="bg-[#0F172A] border border-cyan-400/30 rounded-xl p-4 mb-4">
              <p className="text-white text-sm font-medium mb-3">Nuevo grupo</p>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre del grupo"
                  value={newGroup.name}
                  onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
                  className="col-span-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  onKeyDown={e => e.key === 'Enter' && createGroup()}
                />
                <select
                  value={newGroup.category}
                  onChange={e => setNewGroup(p => ({ ...p, category: e.target.value }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Orden (0, 1, 2…)"
                  value={newGroup.order_index}
                  onChange={e => setNewGroup(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={createGroup}
                  disabled={savingGroup || !newGroup.name.trim()}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-[#020617] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {savingGroup ? 'Guardando…' : 'Crear grupo'}
                </button>
                <button
                  onClick={() => { setShowNewGroup(false); setNewGroup(BLANK_GROUP) }}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista grupos */}
          {groups.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay grupos. Creá uno para organizar el contenido.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map(g => (
                <div key={g.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4">
                  {editingGroupId === g.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editGroupData.name}
                        onChange={e => setEditGroupData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-400"
                        onKeyDown={e => e.key === 'Enter' && saveEditGroup()}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <select
                          value={editGroupData.category}
                          onChange={e => setEditGroupData(p => ({ ...p, category: e.target.value }))}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={editGroupData.order_index}
                          onChange={e => setEditGroupData(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                          placeholder="Orden"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={saveEditGroup}
                          disabled={savingGroup}
                          className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          {savingGroup ? '…' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="px-3 py-1.5 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{g.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 capitalize">{g.category} · orden {g.order_index}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => startEdit(g)}
                          className="text-slate-500 hover:text-white text-xs transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteGroup(g.id)}
                          className="text-slate-500 hover:text-red-400 text-xs transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
