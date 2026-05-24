'use client'

import { useEffect, useState } from 'react'
import { HOTMART_PRO_URL, HOTMART_ANNUAL_URL } from '@/lib/plans'

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

const ANNUAL_EXTRAS = [
  'Roadmap personalizado de 12 meses',
  'Votás qué clases se crean cada mes',
  '1 mes gratis para regalar a un colega',
  'Certificado verificable al completar el año',
]

export default function UpgradeModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<'annual' | 'monthly'>('annual')

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const isAnnual = selected === 'annual'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
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

          <h2 id="upgrade-title" className="text-white font-bold text-xl mb-1">
            Desbloqueá todo Leadr
          </h2>
          <p className="text-slate-400 text-sm">Elegí el plan que mejor se adapta a vos</p>
        </div>

        {/* Toggle de planes */}
        <div className="px-7 pb-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Tarjeta anual */}
            <button
              onClick={() => setSelected('annual')}
              className={`relative text-left rounded-xl border p-4 transition-all cursor-pointer ${
                isAnnual
                  ? 'border-cyan-400/50 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              {isAnnual && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-cyan-400 text-[#020617] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                  Más popular
                </div>
              )}
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${isAnnual ? 'text-cyan-400' : 'text-slate-500'}`}>
                Anual
              </p>
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-2xl font-bold text-white">$7</span>
                <span className="text-slate-400 text-xs">/mes</span>
              </div>
              <p className="text-slate-500 text-[11px]">$84 facturado una vez</p>
              <p className="text-emerald-400 text-[11px] font-semibold mt-1">Ahorrás $36 al año</p>
            </button>

            {/* Tarjeta mensual */}
            <button
              onClick={() => setSelected('monthly')}
              className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                !isAnnual
                  ? 'border-violet-400/50 bg-violet-500/10'
                  : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${!isAnnual ? 'text-violet-400' : 'text-slate-500'}`}>
                Mensual
              </p>
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="text-2xl font-bold text-white">$10</span>
                <span className="text-slate-400 text-xs">/mes</span>
              </div>
              <p className="text-slate-500 text-[11px]">Cancelás cuando querés</p>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="px-7 pb-5">
          <ul className="space-y-2">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-4 h-4 rounded-full bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
            {isAnnual && ANNUAL_EXTRAS.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-cyan-200">
                <span className="w-4 h-4 rounded-full bg-cyan-400/25 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>
                  {f}
                  <span className="ml-1.5 text-[10px] bg-cyan-400/15 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">Solo anual</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-7 border-t border-slate-800" />

        {/* CTA */}
        <div className="px-7 py-5 flex flex-col gap-3">
          <p className="text-xs text-slate-500 text-center">
            Al hacer clic vas a Hotmart, nuestra plataforma de pagos segura.
          </p>
          <a
            href={isAnnual ? HOTMART_ANNUAL_URL : HOTMART_PRO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl transition-colors min-h-[52px] ${
              isAnnual
                ? 'bg-cyan-500 hover:bg-cyan-400'
                : 'bg-violet-500 hover:bg-violet-400'
            }`}
          >
            {isAnnual ? 'Suscribirme por $84/año' : 'Suscribirme por $10/mes'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm transition-colors cursor-pointer py-1">
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
