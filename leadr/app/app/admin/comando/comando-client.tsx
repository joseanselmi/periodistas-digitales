'use client'

import { useState, useEffect, useCallback } from 'react'

type AgentEstado = 'ok' | 'pendiente' | 'bloqueado'
type RunState = 'idle' | 'loading' | 'ok' | 'error'

type AgentState = {
  agent_id: string
  ultima_accion: string | null
  proxima_accion: string | null
  estado: AgentEstado
  datos: Record<string, unknown>
}

type LeadrStats = { clases: number; usuarios: number; pro: number }

const AGENTS = [
  { id: 'clara',     nombre: 'Clara',     rol: 'Noticias del día',     color: 'cyan'    as const, endpoint: '/api/admin/run-clara',   confirm: false },
  { id: 'sofia',     nombre: 'Sofía',     rol: 'Email Marketing',      color: 'violet'  as const, endpoint: '/api/admin/send-email',  confirm: true  },
  { id: 'valentina', nombre: 'Valentina', rol: 'Contenido Orgánico',   color: 'emerald' as const, endpoint: null,                     confirm: false },
  { id: 'mateo',     nombre: 'Mateo',     rol: 'Media Buyer',          color: 'amber'   as const, endpoint: null,                     confirm: false },
  { id: 'dante',     nombre: 'Dante',     rol: 'Analytics',            color: 'blue'    as const, endpoint: null,                     confirm: false },
  { id: 'ricardo',   nombre: 'Ricardo',   rol: 'CMO',                  color: 'rose'    as const, endpoint: null,                     confirm: false },
  { id: 'luna',      nombre: 'Luna',      rol: 'CRO / Landing',        color: 'yellow'  as const, endpoint: null,                     confirm: false },
]

const COLORS = {
  cyan:    { border: 'border-cyan-500/20',    dot: 'bg-cyan-400',    btn: 'bg-cyan-500 hover:bg-cyan-400'    },
  violet:  { border: 'border-violet-500/20',  dot: 'bg-violet-400',  btn: 'bg-violet-500 hover:bg-violet-400'  },
  emerald: { border: 'border-emerald-500/20', dot: 'bg-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-400' },
  amber:   { border: 'border-amber-500/20',   dot: 'bg-amber-400',   btn: 'bg-amber-500 hover:bg-amber-400'   },
  blue:    { border: 'border-blue-500/20',    dot: 'bg-blue-400',    btn: 'bg-blue-500 hover:bg-blue-400'    },
  rose:    { border: 'border-rose-500/20',    dot: 'bg-rose-400',    btn: 'bg-rose-500 hover:bg-rose-400'    },
  yellow:  { border: 'border-yellow-500/20',  dot: 'bg-yellow-400',  btn: 'bg-yellow-500 hover:bg-yellow-400'  },
}

function EstadoBadge({ estado }: { estado: AgentEstado }) {
  if (estado === 'ok')
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-400">✓ Al día</span>
  if (estado === 'pendiente')
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">⏳ Pendiente</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-400/15 text-red-400">⛔ Bloqueado</span>
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin inline-block" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function ComandoClient() {
  const [leadr, setLeadr] = useState<LeadrStats | null>(null)
  const [agentes, setAgentes] = useState<Record<string, AgentState>>({})
  const [runStates, setRunStates] = useState<Record<string, RunState>>({})
  const [messages, setMessages] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/agent-states').then(r => r.json()).catch(() => null)
    if (!res || res.error) return
    setLeadr(res.leadr)
    setAgentes(res.agentes ?? {})
  }, [])

  useEffect(() => { load() }, [load])

  async function runAgent(id: string, endpoint: string) {
    setRunStates(p => ({ ...p, [id]: 'loading' }))
    setMessages(p => ({ ...p, [id]: '' }))
    setConfirming(null)
    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.ok !== false) {
        setRunStates(p => ({ ...p, [id]: 'ok' }))
        const msg = data.message ?? (data.sent ? `${data.sent} enviados` : data.saved ? `${data.saved} guardados` : 'Completado')
        setMessages(p => ({ ...p, [id]: msg }))
        load()
      } else {
        setRunStates(p => ({ ...p, [id]: 'error' }))
        setMessages(p => ({ ...p, [id]: data.message ?? 'Error desconocido' }))
      }
    } catch {
      setRunStates(p => ({ ...p, [id]: 'error' }))
      setMessages(p => ({ ...p, [id]: 'No se pudo conectar' }))
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Centro de Comando</h1>
        <p className="text-sm text-slate-400 mt-0.5">Estado del equipo en tiempo real</p>
      </div>

      {/* Leadr stats */}
      {leadr && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Clases',    value: leadr.clases,   color: 'text-cyan-400'    },
            { label: 'Usuarios',  value: leadr.usuarios, color: 'text-violet-400'  },
            { label: 'Pro activos', value: leadr.pro,    color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Agent cards */}
      <div className="space-y-3">
        {AGENTS.map(agent => {
          const state = agentes[agent.id]
          const runState = runStates[agent.id] ?? 'idle'
          const msg = messages[agent.id] ?? ''
          const c = COLORS[agent.color]
          const isConfirming = confirming === agent.id
          const datos = state?.datos ?? {}
          const efectivoEstado: AgentEstado = runState === 'ok' ? 'ok' : (state?.estado ?? 'ok')

          return (
            <div key={agent.id} className={`bg-slate-900/60 border ${c.border} rounded-2xl p-4`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <h2 className="text-sm font-semibold text-white">{agent.nombre}</h2>
                  <span className="text-xs text-slate-500">· {agent.rol}</span>
                </div>
                {state && <EstadoBadge estado={efectivoEstado} />}
              </div>

              {/* Próxima acción */}
              {state?.proxima_accion && (
                <p className="text-xs text-slate-400 mt-2 mb-3 leading-relaxed pl-4">
                  {state.proxima_accion}
                </p>
              )}

              {/* Clara: detalles live */}
              {agent.id === 'clara' && datos.corrio_hoy != null && (
                <div className="flex gap-3 mb-3 text-xs pl-4">
                  {datos.corrio_hoy && (
                    <span className="text-emerald-400">✓ {String(datos.noticias_hoy)} noticias hoy</span>
                  )}
                  {Number(datos.aprobaciones_pendientes) > 0 && (
                    <a href="/admin/aprobaciones" className="text-amber-400 underline underline-offset-2">
                      {String(datos.aprobaciones_pendientes)} por aprobar
                    </a>
                  )}
                </div>
              )}

              {/* Sofía: tabla de stats */}
              {agent.id === 'sofia' && datos.total != null && (
                <div className="bg-slate-800/60 rounded-xl p-3 mb-3 text-xs text-slate-300 space-y-1">
                  {[
                    { label: 'Total compradores', value: String(datos.total),    color: 'text-white'       },
                    { label: 'Ya activaron Leadr', value: String(datos.activados), color: 'text-emerald-400' },
                    { label: 'Recibirán L4',       value: String(datos.pendientes), color: 'text-amber-400'   },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between">
                      <span>{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón ejecutar */}
              {agent.endpoint && (
                <>
                  {agent.confirm && isConfirming ? (
                    <div className="space-y-2">
                      <p className="text-xs text-amber-400 text-center font-medium">
                        ¿Confirmar envío a {String(datos.pendientes ?? '?')} contactos?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => runAgent(agent.id, agent.endpoint!)}
                          disabled={runState === 'loading'}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors ${c.btn} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {runState === 'loading'
                            ? <span className="flex items-center justify-center gap-1.5"><Spinner /> Enviando…</span>
                            : 'Sí, enviar'
                          }
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => agent.confirm ? setConfirming(agent.id) : runAgent(agent.id, agent.endpoint!)}
                      disabled={runState === 'loading' || runState === 'ok'}
                      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-colors ${c.btn} disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {runState === 'loading'
                        ? <span className="flex items-center justify-center gap-2"><Spinner /> Ejecutando…</span>
                        : runState === 'ok'
                          ? `✓ ${agent.nombre} completado`
                          : efectivoEstado === 'ok' && agent.id === 'clara'
                            ? `Volver a ejecutar ${agent.nombre}`
                            : `Ejecutar ${agent.nombre}`
                      }
                    </button>
                  )}
                </>
              )}

              {msg && (
                <p className={`text-xs mt-2 pl-4 ${runState === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <a href="/admin/aprobaciones" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center hover:border-amber-400/30 transition-colors">
          <div className="text-lg">📋</div>
          <div className="text-xs text-slate-300 font-medium mt-1">Aprobaciones</div>
        </a>
        <a href="/admin/campanas" className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center hover:border-violet-400/30 transition-colors">
          <div className="text-lg">📧</div>
          <div className="text-xs text-slate-300 font-medium mt-1">Campañas</div>
        </a>
      </div>

      <p className="text-center text-xs text-slate-700 mt-6">
        Clara corre automáticamente cada día a las 8am ARG
      </p>
    </div>
  )
}
