'use client'

import { useState, useEffect, useCallback } from 'react'

type Status = {
  clara: { corrio_hoy: boolean; noticias_hoy: number; aprobaciones_pendientes: number }
  leadr: { clases: number; usuarios: number; pro: number }
  email: { l1: boolean; l2: boolean; l3: boolean; l4: boolean; total_contactos: number }
}

type EmailPreview = {
  total: number
  activados: number
  pendientes: number
  lista_preview: string[]
}

type RunState = 'idle' | 'loading' | 'ok' | 'error'

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-400/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
      {ok ? '✓ Listo' : '⏳ Pendiente'}
    </span>
  )
}

function ActionButton({
  label, state, onClick, color = 'cyan',
}: {
  label: string
  state: RunState
  onClick: () => void
  color?: 'cyan' | 'violet' | 'amber'
}) {
  const colors = {
    cyan:   'bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900 disabled:text-cyan-700',
    violet: 'bg-violet-500 hover:bg-violet-400 disabled:bg-violet-900 disabled:text-violet-700',
    amber:  'bg-amber-500 hover:bg-amber-400 disabled:bg-amber-900 disabled:text-amber-700',
  }
  return (
    <button
      onClick={onClick}
      disabled={state === 'loading'}
      className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-colors ${colors[color]} disabled:cursor-not-allowed`}
    >
      {state === 'loading' ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Ejecutando…
        </span>
      ) : state === 'ok' ? `✓ ${label}` : state === 'error' ? `✕ Error — reintentar` : label}
    </button>
  )
}

export default function ComandoClient() {
  const [status, setStatus] = useState<Status | null>(null)
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null)
  const [claraState, setClaraState] = useState<RunState>('idle')
  const [emailState, setEmailState] = useState<RunState>('idle')
  const [claraMsg, setClaraMsg] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [confirmEmail, setConfirmEmail] = useState(false)

  const loadStatus = useCallback(async () => {
    const [statusRes, emailRes] = await Promise.all([
      fetch('/api/admin/comando-status').then(r => r.json()).catch(() => null),
      fetch('/api/admin/send-email').then(r => r.json()).catch(() => null),
    ])
    if (statusRes && !statusRes.error) setStatus(statusRes)
    if (emailRes && !emailRes.error) setEmailPreview(emailRes)
  }, [])

  useEffect(() => { loadStatus() }, [loadStatus])

  async function runClara() {
    setClaraState('loading')
    setClaraMsg('')
    try {
      const res = await fetch('/api/admin/run-clara', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setClaraState('ok')
        setClaraMsg(data.message ?? `${data.saved} noticias guardadas como draft`)
        loadStatus()
      } else {
        setClaraState('error')
        setClaraMsg(data.message ?? 'Error desconocido')
      }
    } catch {
      setClaraState('error')
      setClaraMsg('No se pudo conectar')
    }
  }

  async function sendL4() {
    setEmailState('loading')
    setEmailMsg('')
    try {
      const res = await fetch('/api/admin/send-email', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setEmailState('ok')
        setEmailMsg(`${data.sent} emails enviados${data.errors ? ` · ${data.errors} errores` : ''}`)
        setConfirmEmail(false)
        loadStatus()
      } else {
        setEmailState('error')
        setEmailMsg(data.message ?? 'Error al enviar')
      }
    } catch {
      setEmailState('error')
      setEmailMsg('No se pudo conectar')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Centro de Comando</h1>
        <p className="text-sm text-slate-400 mt-0.5">Ejecutá tareas del equipo desde el móvil</p>
      </div>

      {/* ── Leadr stats ── */}
      {status && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Clases', value: status.leadr.clases, color: 'text-cyan-400' },
            { label: 'Usuarios', value: status.leadr.usuarios, color: 'text-violet-400' },
            { label: 'Pro activos', value: status.leadr.pro, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Clara ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Clara — Noticias del día</h2>
            <p className="text-xs text-slate-500 mt-0.5">Scrapea RSS, filtra con IA, genera imágenes</p>
          </div>
          {status && <Badge ok={status.clara.corrio_hoy} />}
        </div>

        {status && (
          <div className="flex gap-4 mb-3 text-xs text-slate-400">
            {status.clara.corrio_hoy && (
              <span className="text-emerald-400">✓ {status.clara.noticias_hoy} noticias generadas hoy</span>
            )}
            {status.clara.aprobaciones_pendientes > 0 && (
              <a href="/admin/aprobaciones" className="text-amber-400 underline underline-offset-2">
                {status.clara.aprobaciones_pendientes} draft{status.clara.aprobaciones_pendientes > 1 ? 's' : ''} por aprobar
              </a>
            )}
          </div>
        )}

        <ActionButton
          label={status?.clara.corrio_hoy ? 'Volver a ejecutar Clara' : 'Ejecutar Clara ahora'}
          state={claraState}
          onClick={runClara}
          color="cyan"
        />
        {claraMsg && (
          <p className={`text-xs mt-2 ${claraState === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{claraMsg}</p>
        )}
      </div>

      {/* ── Email L4 ── */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Sofía — Email L4</h2>
            <p className="text-xs text-slate-500 mt-0.5">Reminder a compradores que no activaron Leadr</p>
          </div>
          <Badge ok={emailState === 'ok'} />
        </div>

        {/* Progreso campaña */}
        {status && (
          <div className="flex gap-2 mb-3">
            {(['L1', 'L2', 'L3', 'L4'] as const).map((l, i) => {
              const key = l.toLowerCase() as 'l1' | 'l2' | 'l3' | 'l4'
              const done = status.email[key] || (emailState === 'ok' && l === 'L4')
              return (
                <div key={l} className={`flex-1 rounded-lg py-1.5 text-center text-xs font-semibold ${done ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25' : 'bg-slate-800 text-slate-500'}`}>
                  {l} {done ? '✓' : ''}
                </div>
              )
            })}
          </div>
        )}

        {emailPreview && (
          <div className="bg-slate-800/60 rounded-xl p-3 mb-3 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Total compradores</span>
              <span className="font-semibold text-white">{emailPreview.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Ya activaron Leadr</span>
              <span className="text-emerald-400 font-semibold">{emailPreview.activados}</span>
            </div>
            <div className="flex justify-between">
              <span>Recibirán L4</span>
              <span className="text-amber-400 font-semibold">{emailPreview.pendientes}</span>
            </div>
          </div>
        )}

        {!confirmEmail ? (
          <button
            onClick={() => setConfirmEmail(true)}
            disabled={emailState === 'loading' || emailState === 'ok'}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-violet-500 hover:bg-violet-400 disabled:bg-violet-900 disabled:text-violet-700 disabled:cursor-not-allowed transition-colors"
          >
            {emailState === 'ok' ? '✓ L4 enviado' : 'Enviar L4 ahora'}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-amber-400 text-center font-medium">
              ¿Confirmar envío a {emailPreview?.pendientes ?? '?'} contactos?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmEmail(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <ActionButton label="Sí, enviar" state={emailState} onClick={sendL4} color="violet" />
            </div>
          </div>
        )}

        {emailMsg && (
          <p className={`text-xs mt-2 ${emailState === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{emailMsg}</p>
        )}
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="/admin/aprobaciones"
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center hover:border-amber-400/30 transition-colors"
        >
          <div className="text-lg">📋</div>
          <div className="text-xs text-slate-300 font-medium mt-1">Aprobaciones</div>
          {status && status.clara.aprobaciones_pendientes > 0 && (
            <div className="text-xs text-amber-400 mt-0.5">{status.clara.aprobaciones_pendientes} pendientes</div>
          )}
        </a>
        <a
          href="/admin/campanas"
          className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center hover:border-violet-400/30 transition-colors"
        >
          <div className="text-lg">📧</div>
          <div className="text-xs text-slate-300 font-medium mt-1">Campañas</div>
          <div className="text-xs text-slate-500 mt-0.5">L1 L2 L3 ✓</div>
        </a>
      </div>

      <p className="text-center text-xs text-slate-700 mt-6">
        Clara corre automáticamente cada día a las 8am ARG
      </p>
    </div>
  )
}
