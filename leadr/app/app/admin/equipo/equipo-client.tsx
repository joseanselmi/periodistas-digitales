'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

// ─── Orbital chart ────────────────────────────────────────────────────────────

const BRANCHES = [
  { key: 'marketing',   label: 'Marketing',   cmd: '/equipo',               color: '#6366f1', emoji: '📣', areas: ['estrategia','ads','contenido','email','conversion','datos'] },
  { key: 'it',          label: 'IT',           cmd: '/it',                   color: '#22d3ee', emoji: '🖥️', areas: ['tech'] },
  { key: 'universidad', label: 'Universidad',  cmd: '/director-universidad', color: '#22c55e', emoji: '🎓', areas: ['educacion'] },
]

function getBranch(m: Member) {
  return BRANCHES.find(b => b.areas.includes(m.area)) ?? BRANCHES[0]
}

function OrbitalChart({ members, selected, onSelect }: {
  members: Member[]
  selected: Member | null
  onSelect: (m: Member | null) => void
}) {
  const [rotation, setRotation]         = useState(0)
  const [autoRotate, setAutoRotate]     = useState(true)
  const [activeBranch, setActiveBranch] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoRotate) return
    const t = setInterval(() => setRotation(r => (r + 0.22) % 360), 50)
    return () => clearInterval(t)
  }, [autoRotate])

  const calcPos = (index: number, total: number, radius: number, startOffset = -90) => {
    const deg = (index / total) * 360 + rotation + startOffset
    const rad = (deg * Math.PI) / 180
    return {
      x:       radius * Math.cos(rad),
      y:       radius * Math.sin(rad),
      opacity: Math.max(0.3, 0.3 + 0.7 * ((1 + Math.sin(rad)) / 2)),
      zIndex:  Math.round(60 + 40 * Math.cos(rad)),
    }
  }

  const grouped: Record<string, Member[]> = {}
  BRANCHES.forEach(b => { grouped[b.key] = [] })
  members.forEach(m => { grouped[getBranch(m).key].push(m) })

  const handleBranchClick = useCallback((key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeBranch === key) {
      setActiveBranch(null)
      setAutoRotate(true)
    } else {
      setActiveBranch(key)
      setAutoRotate(false)
      onSelect(null)
    }
  }, [activeBranch, onSelect])

  const handleMemberClick = useCallback((m: Member, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selected?.id === m.id) {
      onSelect(null)
      setAutoRotate(true)
    } else {
      onSelect(m)
      setAutoRotate(false)
      setActiveBranch(null)
    }
  }, [selected, onSelect])

  const handleBgClick = useCallback(() => {
    setActiveBranch(null)
    setAutoRotate(true)
    onSelect(null)
  }, [onSelect])

  const R_INNER = 148
  const R_OUTER = 285

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ background: '#07070f', perspective: '1000px' }}
      onClick={handleBgClick}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Orbit ring decorations */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_INNER * 2, height: R_INNER * 2,
        border: '1px solid rgba(99,102,241,0.12)',
        animation: 'equipo-orb 7s ease-in-out infinite',
      }} />
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_OUTER * 2, height: R_OUTER * 2,
        border: '1px solid rgba(51,65,85,0.2)',
        animation: 'equipo-orb 10s ease-in-out infinite reverse',
      }} />

      <style>{`
        @keyframes equipo-orb  { 0%,100%{opacity:.06}  50%{opacity:.18} }
        @keyframes equipo-pulse{ 0%,100%{opacity:.15; transform:scale(1)} 50%{opacity:.4; transform:scale(1.08)} }
        @keyframes equipo-ping { 75%,100%{ transform:scale(2); opacity:0 } }
      `}</style>

      {/* ── Branch nodes (inner ring) ── */}
      {BRANCHES.map((b, i) => {
        const { x, y, opacity, zIndex } = calcPos(i, BRANCHES.length, R_INNER)
        const active = activeBranch === b.key
        const dim    = !!activeBranch && !active
        const count  = grouped[b.key].length
        return (
          <div
            key={b.key}
            className="absolute transition-all duration-500 cursor-pointer"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              zIndex: active ? 100 : zIndex,
              opacity: dim ? 0.18 : active ? 1 : opacity,
            }}
            onClick={(e) => handleBranchClick(b.key, e)}
          >
            {/* Glow halo */}
            {active && (
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                width: 80, height: 80, left: -22, top: -15,
                background: `radial-gradient(circle, ${b.color}25 0%, transparent 70%)`,
              }} />
            )}
            <div
              className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-300"
              style={{
                background: active ? `${b.color}18` : '#0d1426',
                border: `${active ? 1.5 : 0.8}px solid ${b.color}`,
                boxShadow: active ? `0 0 18px ${b.color}40` : 'none',
                minWidth: 82,
              }}
            >
              <div className="absolute top-0 left-2 right-2 h-0.5 rounded-full" style={{ background: b.color, opacity: active ? 1 : 0.6 }} />
              <span className="text-sm leading-none">{b.emoji}</span>
              <span className="text-xs font-bold mt-1" style={{ color: active ? '#f1f5f9' : b.color }}>{b.label}</span>
              <span className="text-[9px] mt-0.5" style={{ color: active ? b.color : '#334155' }}>{b.cmd}</span>
              <span className="text-[8px]" style={{ color: '#1e293b' }}>{count} {count === 1 ? 'miembro' : 'miembros'}</span>
            </div>
          </div>
        )
      })}

      {/* ── Member nodes (outer ring) ── */}
      {members.map((m, i) => {
        const { x, y, opacity, zIndex } = calcPos(i, members.length, R_OUTER)
        const branch      = getBranch(m)
        const col         = branch.color
        const sel         = selected?.id === m.id
        const branchActive = activeBranch === branch.key
        const dim         = !!activeBranch && !branchActive && !sel
        return (
          <div
            key={m.id}
            className="absolute transition-all duration-700 cursor-pointer"
            style={{
              transform: `translate(${x}px, ${y}px) ${sel ? 'scale(1.15)' : ''}`,
              zIndex: sel ? 200 : zIndex,
              opacity: dim ? 0.08 : sel ? 1 : branchActive ? 1 : opacity,
            }}
            onClick={(e) => handleMemberClick(m, e)}
          >
            {/* Energy pulse */}
            {(sel || branchActive) && (
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                width: 70, height: 56, left: -9, top: -3,
                background: `radial-gradient(circle, ${col}20 0%, transparent 70%)`,
                animation: 'equipo-orb 2s ease-in-out infinite',
              }} />
            )}
            <div
              className="relative flex flex-col items-center justify-center rounded-xl px-2.5 py-2 transition-all duration-300"
              style={{
                background: sel || branchActive ? `${col}12` : '#0b1220',
                border: `${sel ? 1.2 : branchActive ? 0.8 : 0.4}px solid ${col}`,
                boxShadow: sel ? `0 0 22px ${col}50, 0 0 6px ${col}30` : branchActive ? `0 0 10px ${col}25` : 'none',
                minWidth: 72,
              }}
            >
              <div className="absolute top-0 left-1.5 right-1.5 h-0.5 rounded-full" style={{ background: col, opacity: sel || branchActive ? 1 : 0.3 }} />
              <span className="text-sm leading-none">{m.emoji}</span>
              <span className="text-[10px] font-semibold mt-1" style={{ color: sel ? '#f1f5f9' : branchActive ? '#e2e8f0' : '#94a3b8' }}>
                {m.name}
              </span>
              <span className="text-[8px] mt-0.5 truncate max-w-[64px]" style={{ color: sel || branchActive ? col : '#475569' }}>
                {m.role.length > 16 ? m.role.slice(0, 15) + '…' : m.role}
              </span>
            </div>
          </div>
        )
      })}

      {/* ── Center — Jose ── */}
      <div className="absolute z-10 flex flex-col items-center justify-center" style={{ pointerEvents: 'none' }}>
        {/* Outer ping */}
        <div className="absolute rounded-full" style={{
          width: 96, height: 96,
          border: '1px solid rgba(99,102,241,0.25)',
          animation: 'equipo-ping 2.5s cubic-bezier(0,0,0.2,1) infinite',
        }} />
        {/* Pulse ring */}
        <div className="absolute rounded-full" style={{
          width: 86, height: 86,
          border: '1px solid rgba(99,102,241,0.3)',
          animation: 'equipo-pulse 3s ease-in-out infinite',
        }} />
        {/* Core */}
        <div className="relative flex flex-col items-center justify-center rounded-full" style={{
          width: 72, height: 72,
          background: 'radial-gradient(circle at 40% 35%, #1e1b4b, #0d1526)',
          border: '1.5px solid #6366f1',
          boxShadow: '0 0 28px rgba(99,102,241,0.35), inset 0 0 20px rgba(99,102,241,0.1)',
        }}>
          <span className="text-xl leading-none">👤</span>
          <span className="text-[11px] font-bold text-white mt-0.5">Jose</span>
          <span className="text-[8px]" style={{ color: '#818cf8' }}>Fundador</span>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col h-screen p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
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

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">

        {/* ── Radial chart ── */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="rounded-2xl border border-slate-800 overflow-hidden flex-1 min-h-0" style={{ background: '#07070f' }}>
            <OrbitalChart
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
        <div className="space-y-4 overflow-y-auto min-h-0 pr-1">

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
