'use client'

import { useEffect } from 'react'
import { HOTMART_PRO_URL } from '@/lib/plans'

type Props = {
  open: boolean
  onClose: () => void
}

const PRO_FEATURES = [
  'Todo el contenido sin restricciones',
  'Clases de automatización con Make',
  'Prompts exclusivos para periodistas',
  'Clases nuevas cada semana',
  'Acceso desde cualquier dispositivo',
]

export default function UpgradeModal({ open, onClose }: Props) {
  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Glow decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-violet-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative px-7 pt-7 pb-5">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Plan Pro</p>
              <h2 id="upgrade-title" className="text-white font-bold text-lg leading-snug">
                Desbloqueá todo Leadr
              </h2>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Con Pro accedés a todo el contenido — clases avanzadas, automatizaciones y prompts exclusivos — sin límites ni restricciones.
          </p>
        </div>

        {/* Features */}
        <div className="px-7 pb-5">
          <ul className="space-y-2.5">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="mx-7 border-t border-slate-800" />

        {/* Footer */}
        <div className="px-7 py-5 flex flex-col gap-3">
          <p className="text-xs text-slate-500 text-center">
            Al hacer clic vas a Hotmart, nuestra plataforma de pagos segura.
            Podés cancelar cuando quieras.
          </p>
          <a
            href={HOTMART_PRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-500 hover:bg-violet-400 text-white font-bold rounded-xl transition-colors min-h-[52px]"
          >
            Ver planes y precios
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors cursor-pointer py-1"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
