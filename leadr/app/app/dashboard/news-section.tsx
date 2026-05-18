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
      <div className="max-w-2xl divide-y divide-slate-800/60">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="py-6 flex gap-6 animate-pulse">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-24 bg-slate-800 rounded" />
              <div className="h-5 bg-slate-800 rounded w-full" />
              <div className="h-5 bg-slate-800 rounded w-4/5" />
              <div className="h-3 bg-slate-800/60 rounded w-full" />
              <div className="h-3 bg-slate-800/60 rounded w-3/4" />
            </div>
            <div className="shrink-0 w-28 h-20 rounded-lg bg-slate-800" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h2 className="text-white font-semibold mb-1.5">Sin noticias aún</h2>
        <p className="text-slate-500 text-sm max-w-xs">Clara prepara el digest cada mañana. Volvé después de las 8am.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      {/* Featured — primer artículo destacado */}
      {items[0] && (
        <a
          href={items[0].fuente_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block mb-2"
        >
          {items[0].imagen_url && (
            <div className="w-full h-48 rounded-xl overflow-hidden mb-4 bg-slate-800/60">
              <img
                src={items[0].imagen_url}
                alt=""
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
              />
            </div>
          )}
          <p className="text-[10px] text-slate-600 mb-2">{timeAgo(items[0].published_at)}</p>
          <h2 className="text-xl font-bold text-white leading-snug group-hover:text-slate-200 transition-colors mb-2">
            {items[0].titulo}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-3">
            {items[0].resumen}
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400/80 group-hover:text-rose-400 transition-colors">
            Leer nota
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </a>
      )}

      {/* Resto — lista editorial */}
      {items.length > 1 && (
        <div className="divide-y divide-slate-800/60 border-t border-slate-800/60 mt-6">
          {items.slice(1).map(item => (
            <a
              key={item.id}
              href={item.fuente_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-5 py-5 cursor-pointer"
            >
              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-600 mb-1.5">{timeAgo(item.published_at)}</p>
                <h3 className="text-[15px] font-bold text-white leading-snug line-clamp-2 group-hover:text-slate-200 transition-colors mb-1.5">
                  {item.titulo}
                </h3>
                <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.resumen}
                </p>
              </div>

              {/* Imagen */}
              <div className="shrink-0 w-28 h-[72px] rounded-lg overflow-hidden bg-slate-800/60 mt-0.5">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
