'use client'

import { useState, useEffect, useRef } from 'react'
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
  estrategia: '#8b5cf6', ads: '#f59e0b', contenido: '#ec4899',
  email: '#10b981', conversion: '#f43f5e', datos: '#06b6d4',
  tech: '#94a3b8', educacion: '#6366f1',
}
const AREA_LABEL: Record<string, string> = {
  estrategia: 'Estrategia', ads: 'Ads', contenido: 'Contenido',
  email: 'Email', conversion: 'Conversión', datos: 'Datos',
  tech: 'Tech', educacion: 'Educación',
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
  { key: 'estrategia', label: 'Estrategia' }, { key: 'ads',       label: 'Ads'        },
  { key: 'contenido',  label: 'Contenido'  }, { key: 'email',     label: 'Email'      },
  { key: 'conversion', label: 'Conversión' }, { key: 'datos',     label: 'Datos'      },
  { key: 'tech',       label: 'Tech'       }, { key: 'educacion', label: 'Educación'  },
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
const BRANCH_ANGLES = [-90, 30, 150]

function getBranch(m: Member) {
  return BRANCHES.find(b => b.areas.includes(m.area)) ?? BRANCHES[0]
}

function OrbitalChart({ members, onEdit, onToggleActive, onDelete }: {
  members: Member[]
  onEdit: (m: Member) => void
  onToggleActive: (m: Member) => void
  onDelete: (id: number) => void
}) {
  const [rotation, setRotation]   = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [expandedId, setExpandedId] = useState<number | string | null>(null)
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
    const t = setInterval(() => setRotation(r => (r + 0.18) % 360), 50)
    return () => clearInterval(t)
  }, [autoRotate])

  const R_INNER = Math.min(size.w, size.h) * 0.24
  const R_OUTER = Math.min(size.w, size.h) * 0.43

  const grouped: Record<string, Member[]> = {}
  BRANCHES.forEach(b => { grouped[b.key] = [] })
  members.forEach(m => { grouped[getBranch(m).key].push(m) })

  const getBranchPos = (i: number) => {
    const rad = ((BRANCH_ANGLES[i] + rotation) * Math.PI) / 180
    return { x: R_INNER * Math.cos(rad), y: R_INNER * Math.sin(rad) }
  }
  const getMemberPos = (bi: number, mi: number, total: number) => {
    const base   = BRANCH_ANGLES[bi] + rotation
    const spread = total <= 1 ? 0 : Math.min(total * 16, 64)
    const angle  = total <= 1 ? base : base - spread / 2 + mi * (spread / (total - 1))
    const rad    = (angle * Math.PI) / 180
    return { x: R_OUTER * Math.cos(rad), y: R_OUTER * Math.sin(rad) }
  }

  const branchPositions = BRANCHES.map((_, i) => getBranchPos(i))
  const memberPositions: Record<number, { x: number; y: number }> = {}
  BRANCHES.forEach((branch, bi) => {
    grouped[branch.key].forEach((m, mi) => {
      memberPositions[m.id] = getMemberPos(bi, mi, grouped[branch.key].length)
    })
  })

  const cx = size.w / 2
  const cy = size.h / 2

  // Find expanded member or branch data
  const expandedMember = typeof expandedId === 'number'
    ? members.find(m => m.id === expandedId) ?? null : null
  const expandedBranch = typeof expandedId === 'string'
    ? BRANCHES.find(b => b.key === expandedId) ?? null : null

  function open(id: number | string, e: React.MouseEvent) {
    e.stopPropagation()
    if (expandedId === id) { setExpandedId(null); setAutoRotate(true) }
    else { setExpandedId(id); setAutoRotate(false) }
  }

  function close() { setExpandedId(null); setAutoRotate(true) }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ background: '#07070f', overflow: 'hidden' }}
      onClick={close}
    >
      <style>{`
        @keyframes eq-orb   { 0%,100%{opacity:.06}  50%{opacity:.18} }
        @keyframes eq-pulse { 0%,100%{opacity:.15; transform:translate(-50%,-50%) scale(1)} 50%{opacity:.35; transform:translate(-50%,-50%) scale(1.07)} }
        @keyframes eq-ping  { 75%,100%{ transform:translate(-50%,-50%) scale(2); opacity:0 } }
        @keyframes eq-flow  { to { stroke-dashoffset: -28; } }
        @keyframes eq-flowf { to { stroke-dashoffset: -18; } }
      `}</style>

      {/* Ring decorations */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_INNER*2, height: R_INNER*2, top:'50%', left:'50%',
        transform:'translate(-50%,-50%)', border:'1px solid rgba(99,102,241,0.12)',
        animation:'eq-orb 7s ease-in-out infinite',
      }}/>
      <div className="absolute rounded-full pointer-events-none" style={{
        width: R_OUTER*2, height: R_OUTER*2, top:'50%', left:'50%',
        transform:'translate(-50%,-50%)', border:'1px solid rgba(51,65,85,0.18)',
        animation:'eq-orb 10s ease-in-out infinite reverse',
      }}/>

      {/* SVG lines */}
      <svg className="absolute inset-0 pointer-events-none" width={size.w} height={size.h} style={{ zIndex:1 }}>
        {BRANCHES.map((b, i) => {
          const bp  = branchPositions[i]
          const act = expandedId === b.key
          const dim = !!expandedId && !act && typeof expandedId === 'string'
          const x2  = cx + bp.x, y2 = cy + bp.y
          return (
            <g key={`jb-${b.key}`}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={b.color} strokeWidth={act?1.5:0.8} opacity={dim?0.06:act?0.5:0.35}/>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={b.color} strokeWidth={act?1.8:1}
                strokeDasharray={act?'10 8':'6 12'} opacity={dim?0.04:act?0.9:0.4}
                style={{animation:`eq-flow${act?'f':''} ${act?'1.4s':'2.8s'} linear infinite`}}/>
            </g>
          )
        })}
        {BRANCHES.map((branch, bi) => {
          const bp  = branchPositions[bi]
          return grouped[branch.key].map(m => {
            const mp  = memberPositions[m.id]
            const sel = expandedId === m.id
            const bAct = expandedId === branch.key
            const dim = !!expandedId && !sel && !bAct
            const x1=cx+bp.x, y1=cy+bp.y, x2=cx+mp.x, y2=cy+mp.y
            return (
              <g key={`bm-${m.id}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={branch.color} strokeWidth={sel?1.2:bAct?0.8:0.6} opacity={dim?0.04:sel?0.6:bAct?0.45:0.28}/>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={branch.color} strokeWidth={sel?1.4:bAct?1:0.6}
                  strokeDasharray={sel?'8 5':bAct?'6 8':'4 12'} opacity={dim?0.03:sel?1:bAct?0.7:0.22}
                  style={{animation:`eq-flow${sel||bAct?'f':''} ${sel?'1.1s':bAct?'1.8s':'4s'} linear infinite`}}/>
              </g>
            )
          })
        })}
      </svg>

      {/* Branch nodes */}
      {BRANCHES.map((b, i) => {
        const { x, y } = branchPositions[i]
        const active = expandedId === b.key
        const dim    = !!expandedId && !active
        return (
          <div key={b.key} className="absolute cursor-pointer" style={{
            top:'50%', left:'50%',
            transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            zIndex: active ? 50 : 20, opacity: dim ? 0.35 : 1,
            transition:'opacity 0.3s ease',
          }} onClick={e => open(b.key, e)}>
            <div className="relative flex flex-col items-center justify-center rounded-2xl px-5 py-4 transition-all duration-300" style={{
              background: active ? `${b.color}28` : '#111827',
              border:`${active?2:1.5}px solid ${active?b.color:b.color+'88'}`,
              boxShadow: active
                ? `0 0 32px ${b.color}60, 0 0 12px ${b.color}30`
                : `0 6px 24px rgba(0,0,0,0.7), inset 0 1px 0 ${b.color}25`,
              minWidth: 140,
            }}>
              <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full" style={{background:b.color}}/>
              <span className="text-2xl leading-none">{b.emoji}</span>
              <span className="text-base font-bold mt-2 text-slate-100">{b.label}</span>
              <span className="text-xs mt-1 font-mono" style={{color: active?b.color:b.color+'cc'}}>{b.cmd}</span>
              <span className="text-[10px] mt-1 text-slate-500">{grouped[b.key].length} miembros</span>
            </div>
          </div>
        )
      })}

      {/* Member nodes */}
      {BRANCHES.map((branch, bi) =>
        grouped[branch.key].map((m) => {
          const { x, y } = memberPositions[m.id]
          const col   = branch.color
          const sel   = expandedId === m.id
          const bAct  = expandedId === branch.key
          const dim   = !!expandedId && !sel && !bAct
          return (
            <div key={m.id} className="absolute cursor-pointer" style={{
              top:'50%', left:'50%',
              transform:`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              zIndex: sel ? 50 : 15, opacity: dim ? 0.35 : 1,
              transition:'opacity 0.3s ease',
            }} onClick={e => open(m.id, e)}>
              <div className="relative flex flex-col items-center justify-center rounded-xl px-4 py-3 transition-all duration-300" style={{
                background: sel ? `${col}25` : bAct ? `${col}18` : '#111827',
                border:`${sel?2:1.5}px solid ${sel?col:bAct?col+'cc':col+'66'}`,
                boxShadow: sel
                  ? `0 0 28px ${col}60, 0 0 10px ${col}30`
                  : bAct ? `0 0 18px ${col}38, 0 4px 18px rgba(0,0,0,0.5)`
                  : `0 4px 18px rgba(0,0,0,0.6), inset 0 1px 0 ${col}20`,
                minWidth: 115,
              }}>
                <div className="absolute top-0 left-2.5 right-2.5 h-[2px] rounded-full" style={{background:col, opacity: sel||bAct?1:0.5}}/>
                <span className="text-xl leading-none">{m.emoji}</span>
                <span className="text-sm font-semibold mt-1.5 text-slate-100">{m.name}</span>
                <span className="text-xs mt-0.5" style={{color: sel||bAct?col:'#64748b'}}>
                  {m.role.length > 18 ? m.role.slice(0,17)+'…' : m.role}
                </span>
              </div>
            </div>
          )
        })
      )}

      {/* Center — Jose */}
      <div className="absolute flex flex-col items-center justify-center" style={{zIndex:10, pointerEvents:'none', top:'50%', left:'50%', transform:'translate(-50%,-50%)'}}>
        <div className="absolute rounded-full" style={{width:96,height:96,top:'50%',left:'50%',border:'1px solid rgba(99,102,241,0.22)',animation:'eq-ping 2.8s cubic-bezier(0,0,0.2,1) infinite'}}/>
        <div className="absolute rounded-full" style={{width:86,height:86,top:'50%',left:'50%',border:'1px solid rgba(99,102,241,0.28)',animation:'eq-pulse 3.2s ease-in-out infinite'}}/>
        <div className="relative flex flex-col items-center justify-center rounded-full" style={{
          width:88,height:88,
          background:'radial-gradient(circle at 40% 35%, #1e1b4b, #0d1526)',
          border:'2px solid #6366f1',
          boxShadow:'0 0 36px rgba(99,102,241,0.5), inset 0 0 24px rgba(99,102,241,0.12)',
        }}>
          <span className="text-2xl leading-none">👤</span>
          <span className="text-sm font-bold text-white mt-1">Jose</span>
          <span className="text-[10px]" style={{color:'#818cf8'}}>Fundador</span>
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {expandedId !== null && (
        <div className="absolute inset-0 flex items-center justify-center" style={{zIndex:300, background:'rgba(7,7,15,0.75)', backdropFilter:'blur(4px)'}} onClick={close}>

          {/* Member detail */}
          {expandedMember && (() => {
            const col = getBranch(expandedMember).color
            return (
              <div className="relative w-80 rounded-2xl p-6 border" style={{
                background:'#0d1526', borderColor: col+'55',
                boxShadow:`0 0 40px ${col}30, 0 24px 48px rgba(0,0,0,0.8)`,
              }} onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full" style={{background: col}}/>
                <button className="absolute top-3 right-3 text-slate-500 hover:text-white text-lg leading-none cursor-pointer" onClick={close}>✕</button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{background: col+'20', border:`1.5px solid ${col}55`}}>
                    {expandedMember.emoji}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">{expandedMember.name}</h2>
                    <p className="text-sm font-medium" style={{color: col}}>{expandedMember.role}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium mt-1 inline-block"
                      style={{color: AREA_HEX[expandedMember.area], borderColor:`${AREA_HEX[expandedMember.area]}44`, background:`${AREA_HEX[expandedMember.area]}18`}}>
                      {AREA_LABEL[expandedMember.area]}
                    </span>
                  </div>
                </div>
                {expandedMember.description && (
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{expandedMember.description}</p>
                )}
                {expandedMember.responsibilities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-2">Responsabilidades</p>
                    <ul className="space-y-1">
                      {expandedMember.responsibilities.slice(0,5).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="mt-0.5" style={{color: col}}>·</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {expandedMember.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {expandedMember.tools.slice(0,6).map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-lg border text-slate-300"
                        style={{background:'#1e293b', borderColor:'#334155'}}>{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button onClick={() => { onEdit(expandedMember); close() }}
                    className="flex-1 py-2 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    Editar
                  </button>
                  <button onClick={() => onToggleActive(expandedMember)}
                    className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-amber-300 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    {expandedMember.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => { onDelete(expandedMember.id); close() }}
                    className="py-2 px-3 text-slate-600 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Branch detail */}
          {expandedBranch && (() => {
            const mems = members.filter(m => getBranch(m).key === expandedBranch.key)
            return (
              <div className="relative w-72 rounded-2xl p-6 border" style={{
                background:'#0d1526', borderColor: expandedBranch.color+'55',
                boxShadow:`0 0 40px ${expandedBranch.color}25, 0 24px 48px rgba(0,0,0,0.8)`,
              }} onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full" style={{background: expandedBranch.color}}/>
                <button className="absolute top-3 right-3 text-slate-500 hover:text-white text-lg leading-none cursor-pointer" onClick={close}>✕</button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{background: expandedBranch.color+'20', border:`1.5px solid ${expandedBranch.color}55`}}>
                    {expandedBranch.emoji}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{expandedBranch.label}</h2>
                    <span className="text-xs font-mono" style={{color: expandedBranch.color}}>{expandedBranch.cmd}</span>
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  Integrantes — {mems.length}
                </p>
                <div className="space-y-2">
                  {mems.map(m => (
                    <button key={m.id}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left cursor-pointer hover:opacity-90 transition-opacity"
                      style={{background:'#111827', border:`1px solid ${expandedBranch.color}33`}}
                      onClick={() => { setExpandedId(m.id) }}>
                      <span className="text-lg">{m.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{m.name}</p>
                        <p className="text-[11px]" style={{color: expandedBranch.color+'cc'}}>{m.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EquipoClient({ members: initialMembers }: { members: Member[] }) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [editing, setEditing] = useState<Member | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft]     = useState<Omit<Member, 'id' | 'order_index'>>(BLANK)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function parseList(val: string) { return val.split('\n').map(s => s.trim()).filter(Boolean) }

  async function save() {
    if (!draft.name.trim() || !draft.role.trim()) return
    setSaving(true)
    if (creating) {
      const { data, error } = await supabase.from('team_members').insert({ ...draft, order_index: members.length }).select().single()
      if (!error && data) { setMembers(prev => [...prev, data as Member]); showToast(`${draft.name} agregado`) }
    } else if (editing) {
      const { error } = await supabase.from('team_members').update(draft).eq('id', editing.id)
      if (!error) { setMembers(prev => prev.map(m => m.id === editing.id ? { ...m, ...draft } : m)); showToast('Actualizado') }
    }
    setSaving(false); setCreating(false); setEditing(null); setDraft(BLANK)
  }

  async function handleToggleActive(m: Member) {
    const active = !m.active
    await supabase.from('team_members').update({ active }).eq('id', m.id)
    setMembers(prev => prev.map(x => x.id === m.id ? { ...x, active } : x))
    showToast(active ? `${m.name} activado` : `${m.name} desactivado`)
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este miembro?')) return
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    showToast('Eliminado')
  }

  function openEdit(m: Member) {
    setEditing(m); setCreating(false)
    setDraft({ name: m.name, role: m.role, area: m.area, description: m.description ?? '',
      responsibilities: m.responsibilities, tools: m.tools, color: m.color, emoji: m.emoji, active: m.active })
  }

  function openCreate() { setCreating(true); setEditing(null); setDraft(BLANK) }

  const activeMembers   = members.filter(m => m.active)
  const inactiveMembers = members.filter(m => !m.active)
  const showForm = creating || editing

  return (
    <div className="flex flex-col h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-7 rounded-full bg-violet-400"/>
          <div>
            <h1 className="text-2xl font-bold text-white">Equipo</h1>
            <p className="text-slate-500 text-sm">{activeMembers.length} agentes activos</p>
          </div>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/25 rounded-xl text-sm font-medium transition-all cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo agente
        </button>
      </div>

      <div className={`grid gap-6 flex-1 min-h-0 ${showForm ? 'lg:grid-cols-4' : 'grid-cols-1'}`}>

        {/* Chart — full width or 3/4 */}
        <div className={`flex flex-col min-h-0 ${showForm ? 'lg:col-span-3' : ''}`} style={{minHeight:'520px'}}>
          <div className="rounded-2xl border border-slate-800 overflow-hidden flex-1" style={{background:'#07070f', minHeight:'520px'}}>
            <OrbitalChart
              members={activeMembers}
              onEdit={openEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          </div>
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

        {/* Form panel — only when editing/creating */}
        {showForm && (
          <div className="space-y-4 overflow-y-auto min-h-0 pr-1">
            <div className="bg-[#0A0F1E] border border-slate-700 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">
                {creating ? 'Nuevo agente' : `Editar — ${editing?.name}`}
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Emoji</label>
                    <input type="text" value={draft.emoji} onChange={e => setDraft(p => ({...p, emoji: e.target.value}))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="🤖"/>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Color</label>
                    <select value={draft.color} onChange={e => setDraft(p => ({...p, color: e.target.value}))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer">
                      {Object.keys(AVATAR_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Nombre *</label>
                  <input type="text" value={draft.name} onChange={e => setDraft(p => ({...p, name: e.target.value}))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="Nombre del agente"/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Rol *</label>
                  <input type="text" value={draft.role} onChange={e => setDraft(p => ({...p, role: e.target.value}))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" placeholder="CMO, Media Buyer, etc."/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Área</label>
                  <select value={draft.area} onChange={e => setDraft(p => ({...p, area: e.target.value}))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none cursor-pointer">
                    {AREAS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Descripción</label>
                  <textarea value={draft.description ?? ''} onChange={e => setDraft(p => ({...p, description: e.target.value}))}
                    rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"
                    placeholder="Qué hace, cómo piensa…"/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Responsabilidades <span className="text-slate-600">(una por línea)</span></label>
                  <textarea value={draft.responsibilities.join('\n')} onChange={e => setDraft(p => ({...p, responsibilities: parseList(e.target.value)}))}
                    rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"/>
                </div>
                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Herramientas <span className="text-slate-600">(una por línea)</span></label>
                  <textarea value={draft.tools.join('\n')} onChange={e => setDraft(p => ({...p, tools: parseList(e.target.value)}))}
                    rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400 resize-none"/>
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
