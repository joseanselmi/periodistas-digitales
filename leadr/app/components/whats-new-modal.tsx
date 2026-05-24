'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'leadr_whats_new_seen_at'

interface NewClass {
  id: number
  title: string
  groups: { name: string } | null
}

interface NewNews {
  id: string
  titulo: string
}

interface NewPrompt {
  id: number
  title: string
}

interface WhatsNewData {
  hasNew: boolean
  classes: NewClass[]
  news: NewNews[]
  prompts: NewPrompt[]
}

export default function WhatsNewModal() {
  const [data, setData] = useState<WhatsNewData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString()

    fetch(`/api/whats-new?since=${encodeURIComponent(lastSeen)}`)
      .then(r => r.json())
      .then((d: WhatsNewData) => {
        if (d.hasNew) {
          setData(d)
          setVisible(true)
        }
      })
      .catch(() => {})
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
    setVisible(false)
  }

  if (!visible || !data) return null

  const totalItems = data.classes.length + data.news.length + data.prompts.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-violet-500/15 to-cyan-400/10 border-b border-slate-700/60 px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h2 className="text-white font-bold text-lg">Novedades en Leadr</h2>
            </div>
            <button
              onClick={dismiss}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            {totalItems === 1 ? '1 novedad' : `${totalItems} novedades`} desde tu última visita
          </p>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-5 max-h-80 overflow-y-auto">

          {data.classes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-md bg-cyan-400/15 flex items-center justify-center">
                  <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                <span className="text-cyan-400 font-semibold text-sm">
                  {data.classes.length === 1 ? '1 clase nueva' : `${data.classes.length} clases nuevas`}
                </span>
              </div>
              <ul className="space-y-2 pl-1">
                {data.classes.map(c => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span className="text-slate-600 mt-0.5">→</span>
                    <div>
                      <p className="text-slate-200 text-sm leading-snug">{c.title}</p>
                      {c.groups?.name && (
                        <p className="text-slate-600 text-xs mt-0.5">{c.groups.name}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.news.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-md bg-rose-400/15 flex items-center justify-center">
                  <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </span>
                <span className="text-rose-400 font-semibold text-sm">
                  {data.news.length === 1 ? '1 noticia nueva' : `${data.news.length} noticias nuevas`}
                </span>
              </div>
              <ul className="space-y-2 pl-1">
                {data.news.map(n => (
                  <li key={n.id} className="flex items-start gap-2">
                    <span className="text-slate-600 mt-0.5">→</span>
                    <p className="text-slate-200 text-sm leading-snug">{n.titulo}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.prompts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-md bg-violet-400/15 flex items-center justify-center">
                  <svg className="w-3 h-3 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <span className="text-violet-400 font-semibold text-sm">
                  {data.prompts.length === 1 ? '1 prompt nuevo' : `${data.prompts.length} prompts nuevos`}
                </span>
              </div>
              <ul className="space-y-2 pl-1">
                {data.prompts.map(p => (
                  <li key={p.id} className="flex items-start gap-2">
                    <span className="text-slate-600 mt-0.5">→</span>
                    <p className="text-slate-200 text-sm leading-snug">{p.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center gap-3">
          <Link
            href="/dashboard"
            onClick={dismiss}
            className="flex-1 text-center py-2.5 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Ver todo →
          </Link>
          <button
            onClick={dismiss}
            className="px-4 py-2.5 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
          >
            Ya lo vi
          </button>
        </div>
      </div>
    </div>
  )
}
