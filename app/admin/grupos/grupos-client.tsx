'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Group = {
  id: number
  name: string
  category: string
  order_index: number
  classes: { id: number; status: string }[]
}

const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']

const TIPO_CONFIG: Record<string, { label: string; accent: string; badge: string; dot: string }> = {
  clases: {
    label: 'Clases',
    accent: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
    dot: 'bg-cyan-400',
  },
  prompts: {
    label: 'Prompts',
    accent: 'border-violet-500/30',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    dot: 'bg-violet-400',
  },
  automatizaciones: {
    label: 'Automatizaciones',
    accent: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400',
  },
  bonus: {
    label: 'Bonus',
    accent: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
}

export default function GruposClient({ groups: initialGroups }: { groups: Group[] }) {
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

  const tiposConGrupos = CATEGORIES.filter(cat => groups.some(g => g.category === cat))
  const tiposSinGrupos = CATEGORIES.filter(cat => !groups.some(g => g.category === cat))

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Tipos y Grupos</h1>
            <p className="text-slate-400 text-sm mt-1">
              {groups.length} grupos en {tiposConGrupos.length} tipos · cada grupo contiene clases
            </p>
          </div>
          <button
            onClick={() => setShowForm(o => !o)}
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
          <div className="bg-[#0F172A] border border-cyan-400/30 rounded-xl p-5 mb-6">
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
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{TIPO_CONFIG[c]?.label ?? c}</option>
                ))}
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

        {/* Jerarquía: Tipo → Grupos */}
        {groups.length === 0 ? (
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl py-16 text-center">
            <p className="text-slate-500 text-sm">No hay grupos aún.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {tiposConGrupos.map(cat => {
              const cfg = TIPO_CONFIG[cat]
              const gruposDeTipo = groups
                .filter(g => g.category === cat)
                .sort((a, b) => a.order_index - b.order_index)

              return (
                <div key={cat} id={cat}>
                  {/* Cabecera de tipo */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <h2 className="text-white font-semibold text-base">{cfg.label}</h2>
                    <span className="text-slate-500 text-xs">{gruposDeTipo.length} grupos</span>
                  </div>

                  {/* Grupos del tipo */}
                  <div className={`bg-[#0F172A] border ${cfg.accent} rounded-xl overflow-hidden`}>
                    <div className="divide-y divide-slate-800/60">
                      {gruposDeTipo.map(g => {
                        const total = g.classes?.length ?? 0
                        const published = g.classes?.filter(c => c.status === 'published').length ?? 0
                        return (
                          <div key={g.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                              {/* Indicador de nivel */}
                              <div className="flex items-center gap-2 text-slate-600 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{g.name}</p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                  {total === 0
                                    ? 'Sin clases'
                                    : `${published}/${total} clases publicadas`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-600 text-xs hidden sm:block">orden {g.order_index}</span>
                              <Link
                                href={`/admin/grupos/${g.id}`}
                                className="text-slate-400 hover:text-white text-xs transition-colors font-medium"
                              >
                                Ver clases
                              </Link>
                              <button
                                onClick={() => deleteGroup(g.id)}
                                className="text-slate-600 hover:text-red-400 text-xs transition-colors cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Tipos vacíos (sin grupos) */}
            {tiposSinGrupos.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <h2 className="text-slate-500 font-semibold text-sm">Tipos sin grupos</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tiposSinGrupos.map(cat => {
                    const cfg = TIPO_CONFIG[cat]
                    return (
                      <span
                        key={cat}
                        className={`text-xs px-3 py-1.5 rounded-full border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
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
