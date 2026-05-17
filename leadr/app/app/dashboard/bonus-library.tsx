'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export type BonusItem = {
  id: number
  title: string
  description: string
  why_read: string | null
  group_name: string
  file_url: string | null
  file_name: string | null
  cover_url: string | null
  status: string
  order_index: number
}

const GROUP_COLORS: Record<string, string> = {
  default: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
}

function groupColor(name: string) {
  return GROUP_COLORS[name] ?? GROUP_COLORS.default
}

export default function BonusLibrary() {
  const [items, setItems] = useState<BonusItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGroup, setActiveGroup] = useState('todos')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('bonus_items')
      .select('*')
      .eq('status', 'published')
      .order('order_index')
      .then(({ data }) => {
        setItems((data as BonusItem[]) ?? [])
        setLoading(false)
      })
  }, [])

  const groups = ['todos', ...Array.from(new Set(items.map(i => i.group_name)))]
  const filtered = activeGroup === 'todos' ? items : items.filter(i => i.group_name === activeGroup)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-7 rounded-full bg-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Bonus</h1>
          {items.length > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">{items.length} recursos para descargar</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mb-5">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Próximamente</h2>
          <p className="text-slate-500 text-sm max-w-xs">
            Estamos preparando recursos exclusivos para los miembros de Leadr.
          </p>
        </div>
      ) : (
        <>
          {/* Filtro por grupo */}
          {groups.length > 2 && (
            <div className="flex gap-2 flex-wrap mb-8">
              {groups.map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    activeGroup === g
                      ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30'
                      : 'text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {g === 'todos' ? 'Todos' : g}
                  {g !== 'todos' && (
                    <span className="ml-1.5 text-[10px] font-mono opacity-60">
                      {items.filter(i => i.group_name === g).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(item => (
              <Link
                key={item.id}
                href={`/bonus/${item.id}`}
                className="group bg-[#0A0F1E] border border-slate-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-lg hover:shadow-emerald-900/10"
              >
                {/* Cover */}
                {item.cover_url ? (
                  <div className="h-36 overflow-hidden">
                    <img
                      src={item.cover_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-br from-emerald-900/30 to-slate-900 flex items-center justify-center">
                    <svg className="w-12 h-12 text-emerald-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Grupo */}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg w-fit border ${groupColor(item.group_name)}`}>
                    {item.group_name}
                  </span>

                  {/* Título */}
                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-200 transition-colors">
                    {item.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-emerald-400 text-xs flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </span>
                    <svg className="w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
