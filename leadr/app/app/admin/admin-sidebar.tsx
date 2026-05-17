'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TIPOS = [
  { key: 'clases',           label: 'Clases',           dot: 'bg-cyan-400' },
  { key: 'prompts',          label: 'Prompts',          dot: 'bg-violet-400' },
  { key: 'automatizaciones', label: 'Automatizaciones', dot: 'bg-amber-400' },
  { key: 'bonus',            label: 'Bonus',            dot: 'bg-emerald-400' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cerrar drawer al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  function isActive(href: string) {
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <Link
          href="/admin/cerebro"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-3 ${
            isActive('/admin/cerebro')
              ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-400/25'
              : 'text-slate-200 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Cerebro
        </Link>

        <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Contenido</p>

        <Link
          href="/admin/grupos"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/admin/grupos') || isActive('/admin/clase/')
              ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
          </svg>
          Clases y grupos
        </Link>

        <Link
          href="/admin/prompts"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/admin/prompts')
              ? 'bg-violet-400/10 text-violet-400 border border-violet-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Prompts
        </Link>

        <Link
          href="/admin/bonus"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/admin/bonus')
              ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Bonus
        </Link>

        <div className="pt-3">
          <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Creación</p>
          <Link
            href="/admin/generar-clase"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/generar-clase')
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generar con IA
          </Link>
          <Link
            href="/admin/nueva-clase"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/nueva-clase')
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva clase
          </Link>
        </div>

        <div className="pt-3">
          <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Usuarios</p>
          <Link
            href="/admin/accesos"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/accesos')
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Links de acceso
          </Link>
        </div>

        <div className="pt-3">
          <p className="px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Análisis</p>
          <Link
            href="/admin/usuarios"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/usuarios')
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Usuarios y Clases
          </Link>
          <Link
            href="/admin/metricas"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/metricas')
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métricas Landing
          </Link>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-slate-800/60">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ver plataforma
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* ── DESKTOP: sidebar fija ── */}
      <aside className="hidden md:flex w-56 shrink-0 min-h-screen bg-[#0A0F1E] border-r border-slate-800 flex-col sticky top-0 h-screen" aria-label="Menú admin">
        <div className="px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Leadr</span>
              <span className="block text-xs text-slate-500 leading-none mt-0.5">Admin</span>
            </div>
          </div>
        </div>
        {navContent}
      </aside>

      {/* ── MOBILE: topbar + drawer ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0A0F1E] border-b border-slate-800">
        <div className="flex items-center gap-2" aria-label="Leadr Admin">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold text-xs">L</span>
          </div>
          <span className="font-semibold text-white text-sm">Leadr <span className="text-slate-500 font-normal">Admin</span></span>
        </div>
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0A0F1E] border-r border-slate-800 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú admin"
      >
        <div className="px-5 py-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0" aria-hidden="true">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Leadr</span>
              <span className="block text-xs text-slate-500 leading-none mt-0.5">Admin</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {navContent}
      </aside>

      {/* Spacer en mobile para que el contenido no quede debajo del topbar */}
      <div className="md:hidden h-[57px] shrink-0" aria-hidden="true" />
    </>
  )
}
