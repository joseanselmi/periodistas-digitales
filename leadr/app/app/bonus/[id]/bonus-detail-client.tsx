'use client'

import Link from 'next/link'
import type { BonusItem } from '@/app/dashboard/bonus-library'

export default function BonusDetailClient({ item }: { item: BonusItem }) {
  function handleDownload() {
    if (!item.file_url) return
    const a = document.createElement('a')
    a.href = item.file_url
    a.download = item.file_name ?? item.title
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-[#020617]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Bonus
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-400 text-sm truncate">{item.group_name}</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Cover */}
        {item.cover_url ? (
          <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-72">
            <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-slate-800 flex items-center justify-center">
            <svg className="w-16 h-16 text-emerald-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}

        {/* Grupo + título */}
        <div className="space-y-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            {item.group_name}
          </span>
          <h1 className="text-2xl font-bold text-white leading-tight">{item.title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
        </div>

        {/* Botón de descarga */}
        {item.file_url ? (
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-colors cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar {item.file_name ? `— ${item.file_name}` : 'recurso'}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-800 text-slate-500 font-semibold rounded-2xl text-sm">
            Archivo próximamente disponible
          </div>
        )}

        {/* Por qué leerlo */}
        {item.why_read && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-sm">Por qué tenés que leerlo</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{item.why_read}</p>
          </div>
        )}

        {/* Volver */}
        <div className="pt-2 pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al bonus
          </Link>
        </div>

      </div>
    </div>
  )
}
