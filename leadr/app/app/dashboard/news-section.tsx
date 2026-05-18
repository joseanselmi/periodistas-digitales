'use client'

import { useEffect, useState } from 'react'

type NewsItem = {
  id: string
  titulo: string
  resumen: string
  fuente_nombre: string
  fuente_url: string
  imagen_url: string | null
  published_at: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'hace menos de 1h'
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'ayer'
  if (d < 7) return `hace ${d} días`
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function NewsSection() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-[#0A0F1E] border border-slate-800 rounded-2xl h-28 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold text-lg mb-2">Sin noticias aún</h2>
        <p className="text-slate-500 text-sm max-w-xs">Clara prepara el digest diario cada mañana. Volvé después de las 8am.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-3">
      {items.map(item => (
        <a
          key={item.id}
          href={item.fuente_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex gap-4 bg-[#0A0F1E] border border-slate-800 hover:border-slate-600 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-black/20 cursor-pointer"
        >
          {/* Imagen */}
          <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-800/60">
            {item.imagen_url ? (
              <img
                src={item.imagen_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold text-rose-400/80 bg-rose-400/10 border border-rose-400/15 px-2 py-0.5 rounded-full">
                {item.fuente_nombre}
              </span>
              <span className="text-[10px] text-slate-600">{timeAgo(item.published_at)}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-slate-200 transition-colors mb-1.5">
              {item.titulo}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {item.resumen}
            </p>
          </div>

          {/* Flecha */}
          <div className="flex-shrink-0 self-center">
            <svg className="w-4 h-4 text-slate-700 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  )
}
