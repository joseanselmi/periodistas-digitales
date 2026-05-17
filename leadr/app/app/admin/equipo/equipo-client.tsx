'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Member = {
  id: number
  name: string
  role: string
  area: string
  description: string | null
  responsibilities: string[]
  tools: string[]
  color: string
  emoji: string
  active: boolean
  order_index: number
}

const AREAS = [
  { key: 'estrategia', label: 'Estrategia',  color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { key: 'ads',        label: 'Ads',         color: 'bg-amber-500/20  text-amber-300  border-amber-500/30'  },
  { key: 'contenido',  label: 'Contenido',   color: 'bg-pink-500/20   text-pink-300   border-pink-500/30'   },
  { key: 'email',      label: 'Email',       color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { key: 'conversion', label: 'Conversión',  color: 'bg-rose-500/20   text-rose-300   border-rose-500/30'   },
  { key: 'datos',      label: 'Datos',       color: 'bg-cyan-500/20   text-cyan-300   border-cyan-500/30'   },
  { key: 'tech',       label: 'Tech',        color: 'bg-slate-500/20  text-slate-300  border-slate-500/30'  },
  { key: 'educacion',  label: 'Educación',   color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
]

const AVATAR_COLORS: Record<string, string> = {
  violet: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
  amber:  'bg-amber-500/20  text-amber-300  border-amber-400/30',
  pink:   'bg-pink-500/20   text-pink-300   border-pink-400/30',
  emerald:'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  rose:   'bg-rose-500/20   text-rose-300   border-rose-400/30',
  cyan:   'bg-cyan-500/20   text-cyan-300   border-cyan-400/30',
  slate:  'bg-slate-600/30  text-slate-300  border-slate-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
}

const BLANK: Omit<Member, 'id' | 'order_index'> = {
  name: '', role: '', area: 'estrategia', description: '',
  responsibilities: [], tools: [], color: 'cyan', emoji: '🤖', active: true,
}

function AreaBadge({ area }: { area: string }) {
  const a = AREAS.find(x => x.key === area)
  if (!a) return <span className="text-xs text-slate-600">{area}</span>
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${a.color}`}>
      {a.label}
    </span>
  )
}

export default function EquipoClient({ members: initialMembers }: { members: Member[] }) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [selected, setSelected] = useState<Member | null>(null)
  const [editing, setEditing] = useState<Member | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Omit<Member, 'id' | 'order_index'>>(BLANK)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // helpers
  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function parseList(val: string): string[] {
    return val.split('\n').map(s => s.trim()).filter(Boolean)
  }

  // ── CRUD ──
  async function save() {
    if (!draft.name.trim() || !draft.role.trim()) return
    setSaving(true)
    if (creating) {
      const { data, error } = await supabase
        .from('team_members')
        .insert({ ...draft, order_index: members.length })
        .select().single()
      if (!error && data) {
        setMembers(prev => [...prev, data as Member])
        showToast(`${draft.name} agregado al equipo`)
      }
    } else if (editing) {
      const { error } = await supabase.from('team_members').update(draft).eq('id', editing.id)
      if (!error) {
        setMembers(prev => prev.map(m => m.id === editing.id ? { ...m, ...draft } : m))
        if (selected?.id === editing.id) setSelected({ ...editing, ...draft })
        showToast('Actualizado')
      }
    }
    setSaving(false)
    setCreating(false)
    setEditing(null)
    setDraft(BLANK)
  }

  async function toggleActive(m: Member) {
    const active = !m.active
    await supabase.from('team_members').update({ active }).eq('id', m.id)
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, active } : x))
    if (selected?.id === m.id) setSelected({ ...m, active })
  }

  async function deleteMember(id: number) {
    if (!confirm('¿Eliminar este miembro del equipo?')) return
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
    showToast('Eliminado')
  }

  function openEdit(m: Member) {
    setEditing(m)
    setCreating(false)
    setDraft({
      name: m.name, role: m.role, area: m.area,
      description: m.description ?? '',
      responsibilities: m.responsibilities,
      tools: m.tools,
      color: m.color, emoji: m.emoji, active: m.active,
    })
  }

  function openCreate() {
    setCreating(true)
    setEditing(null)
    setDraft(BLANK)
    setSelected(null)
  }

  const activeMembers   = members.filter(m => m.active)
  const inactiveMembers = members.filter(m => !m.active)

  // Group active by area for the org chart
  const byArea = AREAS.map(a => ({
    ...a,
    members: activeMembers.filter(m => m.area === a.key),
  })).filter(a => a.members.length > 0)

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-7 rounded-full bg-violet-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Equipo</h1>
            <p className="text-slate-500 text-sm">{activeMembers.length} miembros activos</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/25 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo miembro
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Organigrama ── */}
        <div className="lg:col-span-2 space-y-6">
          {byArea.map(area => (
            <div key={area.key}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${area.color}`}>
                  {area.label}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {area.members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(selected?.id === m.id ? null : m)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      selected?.id === m.id
                        ? `${AVATAR_COLORS[m.color] ?? AVATAR_COLORS.cyan} shadow-lg`
                        : 'bg-[#0A0F1E] border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${
                        AVATAR_COLORS[m.color] ?? AVATAR_COLORS.cyan
                      }`}>
                        {m.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm">{m.name}</p>
                        <p className="text-slate-500 text-xs truncate">{m.role}</p>
                      </div>
                    </div>
                    {m.description && (
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{m.description}</p>
                    )}
                    {m.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.tools.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-500 rounded-md">{t}</span>
                        ))}
                        {m.tools.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-600 rounded-md">+{m.tools.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Inactivos */}
          {inactiveMembers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider bg-slate-800/50 text-slate-600 border-slate-700/30">
                  Inactivos
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {inactiveMembers.map(m => (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-800/50 bg-[#0A0F1E]/50 opacity-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">{m.emoji}</div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{m.name}</p>
                      <p className="text-slate-600 text-xs">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Panel derecho: detalle / form ── */}
        <div className="space-y-4">

          {/* Detalle del miembro seleccionado */}
          {selected && !creating && !editing && (
            <div className={`rounded-xl border p-5 ${AVATAR_COLORS[selected.color] ?? AVATAR_COLORS.cyan}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl ${AVATAR_COLORS[selected.color] ?? AVATAR_COLORS.cyan}`}>
                    {selected.emoji}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{selected.name}</h3>
                    <p className="text-slate-400 text-xs">{selected.role}</p>
                    <AreaBadge area={selected.area} />
                  </div>
                </div>
              </div>

              {selected.description && (
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{selected.description}</p>
              )}

              {selected.responsibilities.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Responsabilidades</p>
                  <ul className="space-y-1">
                    {selected.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-slate-600 mt-0.5">·</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.tools.length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Herramientas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tools.map(t => (
                      <span key={t} className="text-xs px-2 py-1 bg-slate-900/50 text-slate-300 rounded-lg border border-slate-700/50">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex-1 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(selected)}
                  className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
                >
                  {selected.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => deleteMember(selected.id)}
                  className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-red-400 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Formulario crear / editar */}
          {(creating || editing) && (
            <div className="bg-[#0A0F1E] border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">
                {creating ? 'Nuevo miembro' : `Editar — ${editing?.name}`}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Emoji</label>
                    <input
                      type="text"
                      value={draft.emoji}
                      onChange={e => setDraft(p => ({ ...p, emoji: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400"
                      placeholder="🤖"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Color</label>
                    <select
                      value={draft.color}
                      onChange={e => setDraft(p => ({ ...p, color: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer"
                    >
                      {Object.keys(AVATAR_COLORS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Nombre *</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400"
                    placeholder="Nombre del miembro"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Rol *</label>
                  <input
                    type="text"
                    value={draft.role}
                    onChange={e => setDraft(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400"
                    placeholder="CMO, Media Buyer, etc."
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Área</label>
                  <select
                    value={draft.area}
                    onChange={e => setDraft(p => ({ ...p, area: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer"
                  >
                    {AREAS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Descripción</label>
                  <textarea
                    value={draft.description ?? ''}
                    onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
                    placeholder="Qué hace este miembro, cómo piensa…"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Responsabilidades <span className="text-slate-600">(una por línea)</span></label>
                  <textarea
                    value={draft.responsibilities.join('\n')}
                    onChange={e => setDraft(p => ({ ...p, responsibilities: parseList(e.target.value) }))}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
                    placeholder="Revisar métricas diarias&#10;Escalar campañas&#10;…"
                  />
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Herramientas <span className="text-slate-600">(una por línea)</span></label>
                  <textarea
                    value={draft.tools.join('\n')}
                    onChange={e => setDraft(p => ({ ...p, tools: parseList(e.target.value) }))}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
                    placeholder="Meta Ads&#10;Supabase&#10;…"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={save}
                    disabled={saving || !draft.name.trim() || !draft.role.trim()}
                    className="flex-1 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer"
                  >
                    {saving ? 'Guardando…' : creating ? 'Agregar' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setCreating(false); setEditing(null); setDraft(BLANK) }}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder si nada seleccionado */}
          {!selected && !creating && !editing && (
            <div className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-600 text-sm">Hacé click en un miembro para ver su perfil completo.</p>
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
