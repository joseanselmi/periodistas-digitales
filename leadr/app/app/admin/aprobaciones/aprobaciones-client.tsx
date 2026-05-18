'use client'

import { useEffect, useState } from 'react'

type NewsItem = {
  id: string
  titulo: string
  resumen: string
  fuente_nombre: string
  fuente_url: string
  imagen_url: string | null
  imagen_prompt: string | null
  status: string
  created_at: string
}

export default function AprobacionesClient() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [imageEdit, setImageEdit] = useState<{ id: string; url: string } | null>(null)

  async function fetchDrafts() {
    setLoading(true)
    const res = await fetch('/api/admin/news')
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchDrafts() }, [])

  async function handleAction(id: string, action: 'publish' | 'reject') {
    setActionLoading(id + action)
    await fetch(`/api/admin/news/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setActionLoading(null)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function looksEnglish(text: string) {
    const englishWords = /\b(the|and|for|with|are|this|that|have|from|they|will|been|when|their|what|said|about|which|were|there|your|more|also|into|than|can|its|our|has|was|not|but|his|her|you|how|who|all|would|could|should|may|any|new|one|two|out|get|use|why|just|now|need|make|know|take|find|give|look|come|over|think|most|some|time|only|long|down|way|each|few|very|after|before|during|while|without|between|through|against|across|along|around|behind|beyond|within|upon|toward)\b/i
    return englishWords.test(text)
  }

  async function handleTranslate(id: string) {
    setActionLoading(id + 'translate')
    const res = await fetch(`/api/admin/news/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'translate' }),
    })
    const data = await res.json()
    if (data.titulo) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, titulo: data.titulo, resumen: data.resumen } : i))
    }
    setActionLoading(null)
  }

  async function handleUpdateImage(id: string) {
    if (!imageEdit || imageEdit.id !== id || !imageEdit.url) return
    setActionLoading(id + 'img')
    await fetch(`/api/admin/news/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_image', imagen_url: imageEdit.url }),
    })
    setActionLoading(null)
    setItems(prev => prev.map(i => i.id === id ? { ...i, imagen_url: imageEdit.url } : i))
    setImageEdit(null)
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'hace menos de 1 hora'
    if (h < 24) return `hace ${h}h`
    return `hace ${Math.floor(h / 24)}d`
  }

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold text-white mb-6">Aprobaciones</h1>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/40 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Aprobaciones</h1>
            <p className="text-sm text-slate-500 mt-0.5">Drafts de Clara pendientes de revisión</p>
          </div>
          <button
            onClick={fetchDrafts}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">Sin drafts pendientes.</p>
            <p className="text-xs mt-1 text-slate-600">Clara entrega el próximo a las 8am.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Imagen */}
                  <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-800 relative">
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="text-cyan-400/80">{item.fuente_nombre}</span> · {timeAgo(item.created_at)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.resumen}</p>
                  </div>
                </div>

                {/* Editor de imagen (si está abierto) */}
                {imageEdit?.id === item.id && (
                  <div className="px-4 pb-3 flex gap-2 border-t border-slate-800/60 pt-3">
                    <input
                      type="url"
                      placeholder="Pegar URL de imagen..."
                      value={imageEdit.url}
                      onChange={e => setImageEdit({ id: item.id, url: e.target.value })}
                      className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50"
                    />
                    <button
                      onClick={() => handleUpdateImage(item.id)}
                      disabled={actionLoading === item.id + 'img'}
                      className="text-xs px-3 py-2 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors disabled:opacity-40"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setImageEdit(null)}
                      className="text-xs px-3 py-2 rounded-lg text-slate-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 px-4 pb-4 pt-1">
                  <a
                    href={item.fuente_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    Ver fuente
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <button
                    onClick={() => setImageEdit(imageEdit?.id === item.id ? null : { id: item.id, url: item.imagen_url ?? '' })}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 ml-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Cambiar imagen
                  </button>

                  {looksEnglish(item.titulo) && (
                    <button
                      onClick={() => handleTranslate(item.id)}
                      disabled={!!actionLoading}
                      className="text-xs text-amber-500/80 hover:text-amber-400 transition-colors flex items-center gap-1 ml-2"
                    >
                      {actionLoading === item.id + 'translate' ? (
                        <span className="w-3 h-3 border border-amber-400/40 border-t-amber-400 rounded-full animate-spin inline-block" />
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      )}
                      Traducir
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => handleAction(item.id, 'reject')}
                      disabled={!!actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20 transition-colors disabled:opacity-40"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'publish')}
                      disabled={!!actionLoading}
                      className="text-xs px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {actionLoading === item.id + 'publish' ? (
                        <span className="w-3 h-3 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Publicar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
