'use client'

import { useState, useCallback } from 'react'
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

// ─── Two-level radial chart ────────────────────────────────────────────────────

const CX = 410
const CY = 320
const R_INNER = 148   // team ring
const R_OUTER = 295   // member ring
const VW = 820
const VH = 640

const BRANCHES = [
  { key: 'marketing',   label: 'Marketing',   cmd: '/equipo',               color: '#6366f1', emoji: '📣', areas: ['estrategia','ads','contenido','email','conversion','datos'] },
  { key: 'it',          label: 'IT',           cmd: '/it',                   color: '#22d3ee', emoji: '🖥️', areas: ['tech'] },
  { key: 'universidad', label: 'Universidad',  cmd: '/director-universidad', color: '#22c55e', emoji: '🎓', areas: ['educacion'] },
]

function getBranch(m: Member) {
  return BRANCHES.find(b => b.areas.includes(m.area)) ?? BRANCHES[0]
}

function RadialChart({ members, selected, onSelect }: {
  members: Member[]
  selected: Member | null
  onSelect: (m: Member | null) => void
}) {
  const [activeBranch, setActiveBranch] = useState<string | null>(null)

  const handleBranchClick = useCallback((key: string) => {
    setActiveBranch(prev => prev === key ? null : key)
    onSelect(null)
  }, [onSelect])

  // Group members per branch
  const grouped: Record<string, Member[]> = {}
  BRANCHES.forEach(b => { grouped[b.key] = [] })
  members.forEach(m => { grouped[getBranch(m).key].push(m) })

  // Team node positions (inner ring, 120° apart)
  const teamPos = BRANCHES.map((_, i) => {
    const a = (-90 + i * 120) * (Math.PI / 180)
    return { x: CX + R_INNER * Math.cos(a), y: CY + R_INNER * Math.sin(a) }
  })

  // Member positions (outer ring, spread around their team angle)
  const memberPos: Record<number, { x: number; y: number }> = {}
  BRANCHES.forEach((branch, bi) => {
    const mems = grouped[branch.key]
    const n = mems.length
    if (n === 0) return
    const baseAngle = -90 + bi * 120
    const arc = n === 1 ? 0 : Math.min(n * 22, 90)
    mems.forEach((m, mi) => {
      const deg = n === 1 ? baseAngle : baseAngle - arc / 2 + mi * (arc / (n - 1))
      const rad = deg * (Math.PI / 180)
      memberPos[m.id] = { x: CX + R_OUTER * Math.cos(rad), y: CY + R_OUTER * Math.sin(rad) }
    })
  })

  const NWT = 86; const NHT = 52  // team node size
  const NWM = 76; const NHM = 50  // member node size

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full">
      <defs>
        <pattern id="grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0f172a" strokeWidth="1" />
        </pattern>
        <filter id="glow-node" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>
        <filter id="center-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="center-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0d1526" />
        </radialGradient>
        {BRANCHES.map(b => (
          <radialGradient key={`bg-${b.key}`} id={`bg-${b.key}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={b.color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={b.color} stopOpacity="0" />
          </radialGradient>
        ))}
        <style>{`
          .dash-team { stroke-dasharray: 6 10; animation: flow 2.5s linear infinite; }
          .dash-mem  { stroke-dasharray: 4 10; animation: flow 3.5s linear infinite; }
          .dash-sel  { stroke-dasharray: 8 5;  animation: flow 1.4s linear infinite; }
          @keyframes flow { to { stroke-dashoffset: -28; } }
          .pulse { animation: pulse 3s ease-in-out infinite; }
          @keyframes pulse { 0%,100% { opacity:.15; r:52 } 50% { opacity:.35; r:58 } }
          .orbit-inner { animation: orb 6s ease-in-out infinite; }
          .orbit-outer { animation: orb 8s ease-in-out infinite reverse; }
          @keyframes orb { 0%,100% { opacity:.04 } 50% { opacity:.1 } }
        `}</style>
      </defs>

      {/* Background */}
      <rect width={VW} height={VH} fill="#07070f" />
      <rect width={VW} height={VH} fill="url(#grid)" />

      {/* Orbit rings */}
      <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#6366f1" strokeWidth="0.5" className="orbit-inner" />
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#334155" strokeWidth="0.4" className="orbit-outer" />

      {/* Branch glow halos */}
      {BRANCHES.map((b, i) => {
        const active = activeBranch === b.key
        return active ? (
          <circle key={`halo-${b.key}`}
            cx={teamPos[i].x} cy={teamPos[i].y} r={70}
            fill={`url(#bg-${b.key})`}
          />
        ) : null
      })}

      {/* Lines: Jose → Team */}
      {BRANCHES.map((b, i) => {
        const { x, y } = teamPos[i]
        const active = activeBranch === b.key
        return (
          <line key={`jt-${b.key}`}
            x1={CX} y1={CY} x2={x} y2={y}
            stroke={b.color}
            strokeWidth={active ? 1.2 : 0.6}
            className="dash-team"
            opacity={activeBranch && !active ? 0.15 : active ? 0.9 : 0.4}
          />
        )
      })}

      {/* Lines: Team → Member */}
      {members.map(m => {
        const branch = getBranch(m)
        const bi = BRANCHES.findIndex(b => b.key === branch.key)
        const tp = teamPos[bi]
        const mp = memberPos[m.id]
        if (!mp) return null
        const sel = selected?.id === m.id
        const branchActive = activeBranch === branch.key
        const dim = activeBranch && !branchActive && !sel
        return (
          <line key={`tm-${m.id}`}
            x1={tp.x} y1={tp.y} x2={mp.x} y2={mp.y}
            stroke={branch.color}
            strokeWidth={sel ? 1.2 : 0.6}
            className={sel ? 'dash-sel' : 'dash-mem'}
            opacity={dim ? 0.08 : sel ? 1 : branchActive ? 0.6 : 0.25}
          />
        )
      })}

      {/* Member nodes (outer ring) */}
      {members.map(m => {
        const mp = memberPos[m.id]
        if (!mp) return null
        const branch = getBranch(m)
        const col = branch.color
        const sel = selected?.id === m.id
        const branchActive = activeBranch === branch.key
        const dim = activeBranch && !branchActive && !sel
        return (
          <g key={`mem-${m.id}`}
            transform={`translate(${mp.x},${mp.y})`}
            onClick={() => { setActiveBranch(null); onSelect(sel ? null : m) }}
            style={{ cursor: 'pointer' }}
            filter={sel ? 'url(#glow-node)' : 'url(#shadow)'}
            opacity={dim ? 0.2 : 1}
          >
            <rect x={-NWM/2} y={-NHM/2} width={NWM} height={NHM} rx="9"
              fill={sel || branchActive ? `${col}15` : '#0b1220'}
              stroke={col} strokeWidth={sel ? 1.2 : branchActive ? 0.8 : 0.4}
            />
            <rect x={-NWM/2+7} y={-NHM/2} width={NWM-14} height="2" rx="1"
              fill={col} opacity={sel || branchActive ? 1 : 0.3}
            />
            <text x="0" textAnchor="middle" y={-NHM/2+19} fontSize="15" style={{ userSelect:'none' }}>{m.emoji}</text>
            <text x="0" textAnchor="middle" y={-NHM/2+34} fontSize="10"
              fontWeight="600" fill={sel ? '#f1f5f9' : branchActive ? '#e2e8f0' : '#64748b'}
              style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>
              {m.name}
            </text>
            <text x="0" textAnchor="middle" y={-NHM/2+45} fontSize="7"
              fill={sel || branchActive ? col : '#1e293b'}
              style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>
              {m.role.length > 18 ? m.role.slice(0,17)+'…' : m.role}
            </text>
          </g>
        )
      })}

      {/* Team nodes (inner ring) */}
      {BRANCHES.map((b, i) => {
        const { x, y } = teamPos[i]
        const active = activeBranch === b.key
        const dim = activeBranch && !active
        const memberCount = grouped[b.key].length
        return (
          <g key={`team-${b.key}`}
            transform={`translate(${x},${y})`}
            onClick={() => handleBranchClick(b.key)}
            style={{ cursor: 'pointer' }}
            filter={active ? 'url(#glow-node)' : 'url(#shadow)'}
            opacity={dim ? 0.3 : 1}
          >
            <rect x={-NWT/2} y={-NHT/2} width={NWT} height={NHT} rx="10"
              fill={active ? `${b.color}20` : '#0d1426'}
              stroke={b.color} strokeWidth={active ? 1.5 : 0.8}
            />
            <rect x={-NWT/2+6} y={-NHT/2} width={NWT-12} height="2.5" rx="1"
              fill={b.color} opacity={active ? 1 : 0.6}
            />
            <text x="0" textAnchor="middle" y={-NHT/2+17} fontSize="11"
              fontWeight="700" fill={active ? '#f1f5f9' : b.color}
              style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>
              {b.emoji} {b.label}
            </text>
            <text x="0" textAnchor="middle" y={-NHT/2+30} fontSize="7.5"
              fill={active ? b.color : '#334155'}
              style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>
              {b.cmd}
            </text>
            <text x="0" textAnchor="middle" y={-NHT/2+42} fontSize="7"
              fill="#1e293b"
              style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>
              {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
            </text>
          </g>
        )
      })}

      {/* Center — Jose */}
      <g filter="url(#center-glow)">
        <circle cx={CX} cy={CY} r={52} fill="none" stroke="#6366f1" strokeWidth="0.8" className="pulse" />
        <circle cx={CX} cy={CY} r={44} fill="url(#center-fill)" stroke="#6366f1" strokeWidth="1.2" />
        <text x={CX} textAnchor="middle" y={CY-7} fontSize="20" style={{ userSelect:'none' }}>👤</text>
        <text x={CX} textAnchor="middle" y={CY+12} fontSize="12" fontWeight="700" fill="#f1f5f9"
          style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>Jose</text>
        <text x={CX} textAnchor="middle" y={CY+25} fontSize="8" fill="#818cf8"
          style={{ userSelect:'none', fontFamily:'system-ui,sans-serif' }}>Fundador</text>
      </g>
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
