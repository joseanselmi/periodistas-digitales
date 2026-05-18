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
  const [size, setSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!autoRotate) return
    const t = setInterval(() => setRotation(r => (r + 0.22) % 360), 50)
    return () => clearInterval(t)
  }, [autoRotate])

  const R_INNER = 190
  const R_OUTER = 360

  // Group members clustered near their branch angle
  const grouped: Record<string, Member[]> = {}
  BRANCHES.forEach(b => { grouped[b.key] = [] })
  members.forEach(m => { grouped[getBranch(m).key].push(m) })

  const getBranchPos = (branchIndex: number) => {
    const deg = (branchIndex / BRANCHES.length) * 360 + rotation - 90
    const rad = (deg * Math.PI) / 180
    return {
      x:       R_INNER * Math.cos(rad),
      y:       R_INNER * Math.sin(rad),
      opacity: Math.max(0.3, 0.3 + 0.7 * ((1 + Math.sin(rad)) / 2)),
      zIndex:  Math.round(60 + 40 * Math.cos(rad)),
    }
  }

  const getMemberPos = (branchIndex: number, memberIndex: number, totalInBranch: number) => {
    const baseAngle   = (branchIndex / BRANCHES.length) * 360 - 90
    const spread      = totalInBranch <= 1 ? 0 : Math.min(totalInBranch * 14, 50)
    const memberAngle = totalInBranch <= 1
      ? baseAngle
      : baseAngle - spread / 2 + memberIndex * (spread / (totalInBranch - 1))
    const deg = memberAngle + rotation
    const rad = (deg * Math.PI) / 180
    return {
      x:       R_OUTER * Math.cos(rad),
      y:       R_OUTER * Math.sin(rad),
      opacity: Math.max(0.3, 0.3 + 0.7 * ((1 + Math.sin(rad)) / 2)),
      zIndex:  Math.round(60 + 40 * Math.cos(rad)),
    }
  }

  // Pre-compute all positions (needed for SVG lines + div nodes)
  const branchPositions = BRANCHES.map((_, i) => getBranchPos(i))
  const memberPositions: Record<number, ReturnType<typeof getMemberPos>> = {}
  BRANCHES.forEach((branch, bi) => {
    grouped[branch.key].forEach((m, mi) => {
      memberPositions[m.id] = getMemberPos(bi, mi, grouped[branch.key].length)
    })
  })

  const handleBranchClick = useCallback((key: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (activeBranch === key) {
      setActiveBranch(null); setAutoRotate(true)
    } else {
      setActiveBranch(key); setAutoRotate(false); onSelect(null)
    }
  }, [activeBranch, onSelect])

  const handleMemberClick = useCallback((m: Member, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selected?.id === m.id) {
      onSelect(null); setAutoRotate(true)
    } else {
      onSelect(m); setAutoRotate(false); setActiveBranch(null)
    }
  }, [selected, onSelect])

  const handleBgClick = useCallback(() => {
    setActiveBranch(null); setAutoRotate(true); onSelect(null)
  }, [onSelect])

  const cx = size.w / 2
  const cy = size.h / 2

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
      style={{ background: '#07070f' }}
      onClick={handleBgClick}
    >
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <style>{`
        @keyframes equipo-orb   { 0%,100%{opacity:.06}  50%{opacity:.2} }
        @keyframes equipo-pulse { 0%,100%{opacity:.15; transform:scale(1)} 50%{opacity:.4; transform:scale(1.08)} }
        @keyframes equipo-ping  { 75%,100%{ transform:scale(2); opacity:0 } }
        @keyframes equipo-flow  { to { stroke-dashoffset: -28; } }
        @keyframes equipo-flow-fast { to { stroke-dashoffset: -18; } }
      `}</style>

      {/* Orbit ring decorations */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_INNER * 2, height: R_INNER * 2,
        border: '1px solid rgba(99,102,241,0.1)',
        animation: 'equipo-orb 7s ease-in-out infinite',
      }} />
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_OUTER * 2, height: R_OUTER * 2,
        border: '1px solid rgba(51,65,85,0.15)',
        animation: 'equipo-orb 10s ease-in-out infinite reverse',
      }} />

      {/* ── SVG lines overlay ── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={size.w} height={size.h}
        style={{ zIndex: 1 }}
      >
        <defs>
          {BRANCHES.map(b => (
            <radialGradient key={`sec-${b.key}`} id={`sec-${b.key}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={b.color} stopOpacity="0.07" />
              <stop offset="100%" stopColor={b.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        {/* Sector backgrounds per branch (faint colored slice) */}
        {BRANCHES.map((b, i) => {
          const active  = activeBranch === b.key
          const dim     = !!activeBranch && !active
          const mems    = grouped[b.key]
          const total   = mems.length
          const spread  = total <= 1 ? 30 : Math.min(total * 14, 50)
          const baseAng = (i / BRANCHES.length) * 360 - 90 + rotation

          // Draw a swept sector from center to R_OUTER covering the branch's arc
          const startDeg = baseAng - spread / 2 - 8
          const endDeg   = baseAng + spread / 2 + 8
          const sr = (startDeg * Math.PI) / 180
          const er = (endDeg   * Math.PI) / 180
          const x1 = cx + R_OUTER * Math.cos(sr)
          const y1 = cy + R_OUTER * Math.sin(sr)
          const x2 = cx + R_OUTER * Math.cos(er)
          const y2 = cy + R_OUTER * Math.sin(er)
          const largeArc = (endDeg - startDeg) > 180 ? 1 : 0
          return (
            <path key={`sec-${b.key}`}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={active ? `${b.color}10` : `${b.color}05`}
              opacity={dim ? 0 : 1}
              style={{ transition: 'opacity 0.4s' }}
            />
          )
        })}

        {/* Jose → Branch: solid base + animated dash */}
        {BRANCHES.map((b, i) => {
          const bp     = branchPositions[i]
          const active = activeBranch === b.key
          const dim    = !!activeBranch && !active
          const x2 = cx + bp.x, y2 = cy + bp.y
          return (
            <g key={`jb-${b.key}`}>
              {/* solid base */}
              <line x1={cx} y1={cy} x2={x2} y2={y2}
                stroke={b.color} strokeWidth={active ? 1.5 : 0.8}
                opacity={dim ? 0.06 : active ? 0.5 : 0.35}
              />
              {/* animated dash on top */}
              <line x1={cx} y1={cy} x2={x2} y2={y2}
                stroke={b.color} strokeWidth={active ? 1.8 : 1}
                strokeDasharray={active ? '10 8' : '6 12'}
                opacity={dim ? 0.04 : active ? 0.9 : 0.4}
                style={{ animation: `equipo-flow${active ? '-fast' : ''} ${active ? '1.4s' : '2.8s'} linear infinite` }}
              />
            </g>
          )
        })}

        {/* Branch → Member: solid base + animated dash */}
        {BRANCHES.map((branch, bi) => {
          const bp     = branchPositions[bi]
          const active = activeBranch === branch.key
          const dim    = !!activeBranch && !active
          return grouped[branch.key].map(m => {
            const mp  = memberPositions[m.id]
            const sel = selected?.id === m.id
            const x1 = cx + bp.x, y1 = cy + bp.y
            const x2 = cx + mp.x, y2 = cy + mp.y
            const lit = sel || active
            return (
              <g key={`bm-${m.id}`}>
                {/* solid base */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={branch.color} strokeWidth={sel ? 1.2 : active ? 0.8 : 0.6}
                  opacity={dim && !sel ? 0.04 : sel ? 0.6 : active ? 0.45 : 0.28}
                />
                {/* animated dash */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={branch.color} strokeWidth={sel ? 1.4 : active ? 1 : 0.6}
                  strokeDasharray={sel ? '8 5' : active ? '6 8' : '4 12'}
                  opacity={dim && !sel ? 0.03 : sel ? 1 : active ? 0.7 : 0.22}
                  style={{ animation: `equipo-flow${lit ? '-fast' : ''} ${sel ? '1.1s' : active ? '1.8s' : '4s'} linear infinite` }}
                />
              </g>
            )
          })
        })}
      </svg>

      {/* ── Branch nodes (inner ring) ── */}
      {BRANCHES.map((b, i) => {
        const { x, y, opacity, zIndex } = branchPositions[i]
        const active = activeBranch === b.key
        const dim    = !!activeBranch && !active
        const count  = grouped[b.key].length
        return (
          <div
            key={b.key}
            className="absolute transition-all duration-500 cursor-pointer"
            style={{
              transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
              zIndex: active ? 100 : zIndex + 2,
              opacity: dim ? 0.15 : active ? 1 : opacity,
            }}
            onClick={(e) => handleBranchClick(b.key, e)}
          >
            {active && (
              <div className="absolute rounded-full pointer-events-none" style={{
                width: 90, height: 90, left: -14, top: -18,
                background: `radial-gradient(circle, ${b.color}22 0%, transparent 70%)`,
              }} />
            )}
            <div
              className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2 transition-all duration-300"
              style={{
                background: active ? `${b.color}18` : '#0d1426',
                border: `${active ? 1.5 : 0.8}px solid ${b.color}`,
                boxShadow: active ? `0 0 20px ${b.color}50, 0 0 6px ${b.color}25` : 'none',
                minWidth: 84,
              }}
            >
              <div className="absolute top-0 left-2 right-2 h-0.5 rounded-full" style={{ background: b.color, opacity: active ? 1 : 0.55 }} />
              <span className="text-sm leading-none">{b.emoji}</span>
              <span className="text-xs font-bold mt-1" style={{ color: active ? '#f1f5f9' : b.color }}>{b.label}</span>
              <span className="text-[9px] mt-0.5" style={{ color: active ? b.color : '#334155' }}>{b.cmd}</span>
              <span className="text-[8px]" style={{ color: active ? '#475569' : '#1e293b' }}>{count} {count === 1 ? 'miembro' : 'miembros'}</span>
            </div>
          </div>
        )
      })}

      {/* ── Member nodes (outer ring, clustered by branch) ── */}
      {BRANCHES.map((branch, bi) =>
        grouped[branch.key].map((m, mi) => {
          const { x, y, opacity, zIndex } = memberPositions[m.id]
          const col          = branch.color
          const sel          = selected?.id === m.id
          const branchActive = activeBranch === branch.key
          const dim          = !!activeBranch && !branchActive && !sel
          return (
            <div
              key={m.id}
              className="absolute cursor-pointer"
              style={{
                transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%)) ${sel ? 'scale(1.15)' : ''}`,
                zIndex: sel ? 200 : zIndex + 2,
                opacity: dim ? 0.07 : sel ? 1 : branchActive ? 1 : opacity,
                transition: 'opacity 0.4s ease, box-shadow 0.3s ease',
              }}
              onClick={(e) => handleMemberClick(m, e)}
            >
              {(sel || branchActive) && (
                <div className="absolute rounded-full pointer-events-none" style={{
                  width: 72, height: 58, left: -10, top: -4,
                  background: `radial-gradient(circle, ${col}22 0%, transparent 70%)`,
                  animation: 'equipo-orb 2.2s ease-in-out infinite',
                }} />
              )}
              <div
                className="relative flex flex-col items-center justify-center rounded-xl px-2.5 py-2 transition-all duration-300"
                style={{
                  background: sel || branchActive ? `${col}12` : '#0b1220',
                  border: `${sel ? 1.4 : branchActive ? 0.9 : 0.45}px solid ${col}`,
                  boxShadow: sel
                    ? `0 0 24px ${col}55, 0 0 8px ${col}30`
                    : branchActive ? `0 0 12px ${col}28` : 'none',
                  minWidth: 72,
                }}
              >
                <div className="absolute top-0 left-1.5 right-1.5 h-0.5 rounded-full" style={{ background: col, opacity: sel || branchActive ? 1 : 0.28 }} />
                <span className="text-sm leading-none">{m.emoji}</span>
                <span className="text-[10px] font-semibold mt-1" style={{ color: sel ? '#f1f5f9' : branchActive ? '#e2e8f0' : '#94a3b8' }}>
                  {m.name}
                </span>
                <span className="text-[8px] mt-0.5" style={{ color: sel || branchActive ? col : '#475569' }}>
                  {m.role.length > 16 ? m.role.slice(0, 15) + '…' : m.role}
                </span>
              </div>
            </div>
          )
        })
      )}

      {/* ── Center — Jose ── */}
      <div className="absolute flex flex-col items-center justify-center" style={{ zIndex: 10, pointerEvents: 'none' }}>
        <div className="absolute rounded-full" style={{
          width: 96, height: 96,
          border: '1px solid rgba(99,102,241,0.22)',
          animation: 'equipo-ping 2.8s cubic-bezier(0,0,0.2,1) infinite',
        }} />
        <div className="absolute rounded-full" style={{
          width: 86, height: 86,
          border: '1px solid rgba(99,102,241,0.28)',
          animation: 'equipo-pulse 3.2s ease-in-out infinite',
        }} />
        <div className="relative flex flex-col items-center justify-center rounded-full" style={{
          width: 72, height: 72,
          background: 'radial-gradient(circle at 40% 35%, #1e1b4b, #0d1526)',
          border: '1.5px solid #6366f1',
          boxShadow: '0 0 30px rgba(99,102,241,0.4), inset 0 0 20px rgba(99,102,241,0.1)',
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

      <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-0">

        {/* ── Radial chart ── */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
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
