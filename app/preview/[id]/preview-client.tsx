'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Clase = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  slides_url: string | null
  plan_required: string
  status: string
  groups: { name: string; category: string } | null
}

export default function PreviewClient({ clase }: { clase: Clase }) {
  const [status, setStatus] = useState(clase.status)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  async function toggleStatus() {
    setSaving(true)
    const supabase = createClient()
    const newStatus = status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('classes')
      .update({ status: newStatus })
      .eq('id', clase.id)
    if (!error) {
      setStatus(newStatus)
      showToast(newStatus === 'published' ? 'Clase publicada' : 'Movida a borrador')
    }
    setSaving(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const isDraft = status === 'draft'

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Banner de preview */}
      <div className={`sticky top-0 z-50 border-b ${isDraft ? 'bg-amber-950/60 border-amber-500/30' : 'bg-emerald-950/60 border-emerald-500/30'} backdrop-blur`}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Volver al admin"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-sm font-medium text-slate-300">Vista previa</span>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isDraft
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {isDraft ? 'Borrador' : 'Publicada'}
            </span>
          </div>

          <button
            onClick={toggleStatus}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              isDraft
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
            }`}
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isDraft ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publicar
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Despublicar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Contenido de la clase */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Titulo y badge de plan */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">{clase.title}</h1>
            {clase.description && (
              <p className="text-slate-400 text-sm leading-relaxed">{clase.description}</p>
            )}
            {clase.groups && (
              <p className="text-slate-500 text-xs mt-2">{clase.groups.category} · {clase.groups.name}</p>
            )}
          </div>
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
            clase.plan_required === 'pro'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              : 'bg-slate-700 text-slate-300'
          }`}>
            {clase.plan_required === 'pro' ? 'Pro' : 'Free'}
          </span>
        </div>

        {/* Video */}
        {clase.video_url && (
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Video</p>
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
              <iframe
                src={`https://www.youtube.com/embed/${clase.video_url}`}
                title={clase.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Slides */}
        {clase.slides_url && (
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Presentación</p>
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
              <iframe
                src={`/api/slides?url=${encodeURIComponent(clase.slides_url)}`}
                title={`${clase.title} — slides`}
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Sin contenido */}
        {!clase.video_url && !clase.slides_url && (
          <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-2 mb-6">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.869v6.262a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-slate-500 text-sm">Sin video ni slides todavía</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
