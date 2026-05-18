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

const AREA_HEX: Record<string, string> = {
  estrategia: '#8b5cf6',
  ads:        '#f59e0b',
  contenido:  '#ec4899',
  email:      '#10b981',
  conversion: '#f43f5e',
  datos:      '#06b6d4',
  tech:       '#94a3b8',
  educacion:  '#6366f1',
}

const AREA_LABEL: Record<string, string> = {
  estrategia: 'Estrategia',
  ads:        'Ads',
  contenido:  'Contenido',
  email:      'Email',
  conversion: 'Conversión',
  datos:      'Datos',
  tech:       'Tech',
  educacion:  'Educación',
}

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

const AREAS = [
  { key: 'estrategia', label: 'Estrategia',  color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { key: 'ads',        label: 'Ads',         color: 'bg-amber-500/20  text-amber-300  border-amber-500/30'  },
  { key: 'contenido',  label: 'Contenido',   color: 'bg-pink-500/20   text-pink-300   border-pink-500/30'   },
  { key: 'email',      label: 'Email',       color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { key: 'conversion', label: 'Conversión',  color: 'bg-rose-500/20   text-rose-300   border-rose-500/30'   },
  { key: 'datos',      label: 'Datos',       color: 'bg-cyan-500/20   text-cyan-300   border-cyan-500/30'   },
  { key: 'tech',       label: 'Tech',        color: 'bg-slate-500/20  text-slate-300  border-slate-500/30'  },
  { key: 'educacion',  label: 'Educación',   color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' },
]

const BLANK: Omit<Member, 'id' | 'order_index'> = {
  name: '', role: '', area: 'estrategia', description: '',
  responsibilities: [], tools: [], color: 'cyan', emoji: '🤖', active: true,
}

// ─── Radial SVG chart ──────────────────────────────────────────────────────────

const CX = 340
const CY = 260
const R  = 195
const VW = 680
const VH = 520

function RadialChart({ members, selected, onSelect }: {
  members: Member[]
  selected: Member | null
  onSelect: (m: Member | null) => void
}) {
  const n = members.length
  const positions = members.map((_, i) => {
    const angle = (-90 + i * (360 / n)) * (Math.PI / 180)
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
  })

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full h-full"
      style={{ maxHeight: 520 }}
    >
      <defs>
        {/* Grid pattern */}
        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.6" />
        </pattern>

        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Strong glow for selected */}
        <filter id="glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Line gradients per area */}
        {members.map(m => {
          const col = AREA_HEX[m.area] ?? '#6366f1'
          return (
            <linearGradient
              key={`grad-${m.id}`}
              id={`lg-${m.id}`}
              gradientUnits="userSpaceOnUse"
              x1={CX} y1={CY}
              x2={positions[members.indexOf(m)].x}
              y2={positions[members.indexOf(m)].y}
            >
              <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor={col}     stopOpacity="0.9" />
            </linearGradient>
          )
        })}

        {/* Center pulse gradient */}
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0"    />
        </radialGradient>

        {/* Dash animation */}
        <style>{`
          .flow-line {
            stroke-dasharray: 10 6;
            animation: dashFlow 1.8s linear infinite;
          }
          .flow-line-slow {
            stroke-dasharray: 6 14;
            animation: dashFlow 3s linear infinite;
          }
          @keyframes dashFlow {
            to { stroke-dashoffset: -32; }
          }
          .pulse-ring {
            animation: pulseRing 2.4s ease-in-out infinite;
          }
          @keyframes pulseRing {
            0%, 100% { opacity: 0.15; r: 52; }
            50%       { opacity: 0.35; r: 60; }
          }
          .orbit-ring {
            animation: orbitPulse 4s ease-in-out infinite;
          }
          @keyframes orbitPulse {
            0%, 100% { opacity: 0.06; }
            50%       { opacity: 0.14; }
          }
        `}</style>
      </defs>

      {/* Background grid */}
      <rect width={VW} height={VH} fill="#07070f" />
      <rect width={VW} height={VH} fill="url(#grid)" />

      {/* Orbit rings */}
      <circle cx={CX} cy={CY} r={R}      fill="none" stroke="#6366f1" strokeWidth="0.8" className="orbit-ring" />
      <circle cx={CX} cy={CY} r={R - 30} fill="none" stroke="#22d3ee" strokeWidth="0.4" className="orbit-ring" style={{ animationDelay: '-2s' }} />

      {/* Center glow blob */}
      <circle cx={CX} cy={CY} r={120} fill="url(#centerGlow)" />

      {/* Lines from center to each agent */}
      {members.map((m, i) => {
        const { x, y } = positions[i]
        const isSelected = selected?.id === m.id
        return (
          <line
            key={`line-${m.id}`}
            x1={CX} y1={CY} x2={x} y2={y}
            stroke={`url(#lg-${m.id})`}
            strokeWidth={isSelected ? 2 : 1.2}
            className={isSelected ? 'flow-line' : 'flow-line-slow'}
            opacity={isSelected ? 1 : 0.45}
          />
        )
      })}

      {/* Agent nodes */}
      {members.map((m, i) => {
        const { x, y } = positions[i]
        const col = AREA_HEX[m.area] ?? '#6366f1'
        const isSelected = selected?.id === m.id
        const NODE_W = 86
        const NODE_H = 68

        return (
          <g
            key={m.id}
            transform={`translate(${x}, ${y})`}
            onClick={() => onSelect(isSelected ? null : m)}
            style={{ cursor: 'pointer' }}
            filter={isSelected ? 'url(#glow-strong)' : undefined}
          >
            {/* Selection glow ring */}
            {isSelected && (
              <rect
                x={-NODE_W / 2 - 4} y={-NODE_H / 2 - 4}
                width={NODE_W + 8} height={NODE_H + 8}
                rx="16" fill="none"
                stroke={col} strokeWidth="1.5"
                opacity="0.6"
              />
            )}

            {/* Card body */}
            <rect
              x={-NODE_W / 2} y={-NODE_H / 2}
              width={NODE_W} height={NODE_H}
              rx="12"
              fill={isSelected ? `${col}22` : '#0d1526'}
              stroke={col}
              strokeWidth={isSelected ? 1.5 : 0.8}
              opacity={isSelected ? 1 : 0.85}
            />

            {/* Emoji */}
            <text
              textAnchor="middle"
              y={-NODE_H / 2 + 26}
              fontSize="20"
              style={{ userSelect: 'none' }}
            >
              {m.emoji}
            </text>

            {/* Name */}
            <text
              textAnchor="middle"
              y={-NODE_H / 2 + 44}
              fontSize="11"
              fontWeight="600"
              fill={isSelected ? '#f8fafc' : '#cbd5e1'}
              style={{ userSelect: 'none' }}
            >
              {m.name}
            </text>

            {/* Role */}
            <text
              textAnchor="middle"
              y={-NODE_H / 2 + 57}
              fontSize="8.5"
              fill={isSelected ? col : '#475569'}
              style={{ userSelect: 'none' }}
            >
              {m.role}
            </text>
          </g>
        )
      })}

      {/* Center node — Jose */}
      <g filter="url(#glow)">
        {/* Pulse ring */}
        <circle cx={CX} cy={CY} r={52} fill="none" stroke="#6366f1" strokeWidth="1" className="pulse-ring" />

        {/* Inner circle */}
        <circle cx={CX} cy={CY} r={46} fill="#0d1526" stroke="#6366f1" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={46} fill="#6366f1" fillOpacity="0.12" />

        {/* Emoji */}
        <text textAnchor="middle" y={CY - 6} fontSize="22" style={{ userSelect: 'none' }}>👤</text>

        {/* Name */}
        <text
          textAnchor="middle" y={CY + 14}
          fontSize="13" fontWeight="700" fill="#f8fafc"
          style={{ userSelect: 'none' }}
        >
          Jose
        </text>

        {/* Label */}
        <text
          textAnchor="middle" y={CY + 28}
          fontSize="9" fill="#818cf8"
          style={{ userSelect: 'none' }}
        >
          Fundador
        </text>
      </g>

      {/* Area label tags next to nodes */}
      {members.map((m, i) => {
        const { x, y } = positions[i]
        const col = AREA_HEX[m.area] ?? '#6366f1'
        const label = AREA_LABEL[m.area] ?? m.area
        const labelX = x + (x < CX ? -50 : 50)
        const labelY = y > CY ? y + 42 : y - 42
        return (
          <text
            key={`tag-${m.id}`}
            x={labelX} y={labelY}
            textAnchor="middle"
            fontSize="8"
            fill={col}
            opacity="0.7"
            style={{ userSelect: 'none' }}
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EquipoClient({ members: initialMembers }: { members: Member[] }) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [selected, setSelected] = useState<Member | null>(null)
  const [editing, setEditing]   = useState<Member | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft]       = useState<Omit<Member, 'id' | 'order_index'>>(BLANK)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function parseList(val: string) { return val.split('\n').map(s => s.trim()).filter(Boolean) }

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
        showToast(`${draft.name} agregado`)
      }
    } else if (editing) {
      const { error } = await supabase.from('team_members').update(draft).eq('id', editing.id)
      if (!error) {
        setMembers(prev => prev.map(m => m.id === editing.id ? { ...m, ...draft } : m))
        if (selected?.id === editing.id) setSelected({ ...editing, ...draft })
        showToast('Actualizado')
      }
    }
    setSaving(false); setCreating(false); setEditing(null); setDraft(BLANK)
  }

  async function toggleActive(m: Member) {
    const active = !m.active
    await supabase.from('team_members').update({ active }).eq('id', m.id)
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, active } : x))
    if (selected?.id === m.id) setSelected({ ...m, active })
  }

  async function deleteMember(id: number) {
    if (!confirm('¿Eliminar este miembro?')) return
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    if (selected?.id === id) setSelected(null)
    showToast('Eliminado')
  }

  function openEdit(m: Member) {
    setEditing(m); setCreating(false)
    setDraft({ name: m.name, role: m.role, area: m.area, description: m.description ?? '',
      responsibilities: m.responsibilities, tools: m.tools, color: m.color, emoji: m.emoji, active: m.active })
  }

  function openCreate() { setCreating(true); setEditing(null); setDraft(BLANK); setSelected(null) }

  const activeMembers   = members.filter(m => m.active)
  const inactiveMembers = members.filter(m => !m.active)

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-7 rounded-full bg-violet-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Equipo</h1>
            <p className="text-slate-500 text-sm">{activeMembers.length} agentes activos</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/25 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo agente
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Radial chart ── */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 overflow-hidden" style={{ background: '#07070f' }}>
            <RadialChart
              members={activeMembers}
              selected={selected}
              onSelect={m => { setSelected(m); setEditing(null); setCreating(false) }}
            />
          </div>

          {/* Inactivos */}
          {inactiveMembers.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Inactivos</p>
              <div className="flex flex-wrap gap-2">
                {inactiveMembers.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 opacity-50">
                    <span className="text-base">{m.emoji}</span>
                    <span className="text-slate-500 text-xs">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Panel derecho ── */}
        <div className="space-y-4">

          {/* Detalle */}
          {selected && !creating && !editing && (
            <div className={`rounded-xl border p-5 ${AVATAR_COLORS[selected.color] ?? AVATAR_COLORS.cyan}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl flex-shrink-0 ${AVATAR_COLORS[selected.color] ?? AVATAR_COLORS.cyan}`}>
                  {selected.emoji}
                </div>
                <div>
                  <h3 className="text-white font-bold">{selected.name}</h3>
                  <p className="text-slate-400 text-xs">{selected.role}</p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium mt-1 inline-block"
                    style={{ color: AREA_HEX[selected.area], borderColor: `${AREA_HEX[selected.area]}44`, background: `${AREA_HEX[selected.area]}18` }}
                  >
                    {AREA_LABEL[selected.area] ?? selected.area}
                  </span>
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
                        <span className="text-slate-600 mt-0.5">·</span>{r}
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
                <button onClick={() => openEdit(selected)} className="flex-1 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer">Editar</button>
                <button onClick={() => toggleActive(selected)} className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer">{selected.active ? 'Desactivar' : 'Activar'}</button>
                <button onClick={() => deleteMember(selected.id)} className="py-2 px-3 text-xs text-slate-600 hover:text-red-400 bg-slate-900/40 hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Formulario */}
          {(creating || editing) && (
            <div className="bg-[#0A0F1E] border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">
                {creating ? 'Nuevo agente' : `Editar — ${editing?.name}`}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Emoji</label>
                    <input type="text" value={draft.emoji} onChange={e => setDraft(p => ({ ...p, emoji: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="🤖" />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Color</label>
                    <select value={draft.color} onChange={e => setDraft(p => ({ ...p, color: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer">
                      {Object.keys(AVATAR_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Nombre *</label>
                  <input type="text" value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="Nombre del agente" />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Rol *</label>
                  <input type="text" value={draft.role} onChange={e => setDraft(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="CMO, Media Buyer, etc." />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Área</label>
                  <select value={draft.area} onChange={e => setDraft(p => ({ ...p, area: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer">
                    {AREAS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Descripción</label>
                  <textarea value={draft.description ?? ''} onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
                    placeholder="Qué hace, cómo piensa…" />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Responsabilidades <span className="text-slate-600">(una por línea)</span></label>
                  <textarea value={draft.responsibilities.join('\n')} onChange={e => setDraft(p => ({ ...p, responsibilities: parseList(e.target.value) }))}
                    rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none" />
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Herramientas <span className="text-slate-600">(una por línea)</span></label>
                  <textarea value={draft.tools.join('\n')} onChange={e => setDraft(p => ({ ...p, tools: parseList(e.target.value) }))}
                    rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={save} disabled={saving || !draft.name.trim() || !draft.role.trim()}
                    className="flex-1 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer">
                    {saving ? 'Guardando…' : creating ? 'Agregar' : 'Guardar'}
                  </button>
                  <button onClick={() => { setCreating(false); setEditing(null); setDraft(BLANK) }}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder */}
          {!selected && !creating && !editing && (
            <div className="rounded-xl border border-slate-800 p-8 text-center" style={{ background: '#07070f' }}>
              <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm">Seleccioná un agente del mapa para ver su perfil.</p>
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
