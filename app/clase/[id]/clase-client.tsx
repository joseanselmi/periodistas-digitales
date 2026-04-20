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
  groups: { name: string; category: string } | null
}

type Props = {
  clase: Clase
  userPlan: string
  alreadyWatched: boolean
}

export default function ClaseClient({ clase, userPlan: _userPlan, alreadyWatched }: Props) {
  const [watched, setWatched] = useState(alreadyWatched)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  async function markAsWatched() {
    if (watched) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('user_progress')
      .upsert({ user_id: user.id, class_id: clase.id })

    if (!error) {
      setWatched(true)
      showToast('Clase marcada como vista')
    }
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#020617]/95 backdrop-blur z-10">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-400 flex items-center justify-center">
            <span className="text-[#020617] font-bold text-xs">L</span>
          </div>
          <span className="font-semibold text-sm">Leadr</span>
        </div>
        {clase.groups && (
          <span className="text-slate-500 text-sm hidden sm:block">
            / {clase.groups.name}
          </span>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Titulo y badge */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">{clase.title}</h1>
            {clase.description && (
              <p className="text-slate-400 text-sm leading-relaxed">{clase.description}</p>
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

        {/* Video embed */}
        {clase.video_url ? (
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${clase.video_url}`}
              title={clase.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : clase.slides_url ? (
          <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 mb-6">
            <iframe
              src={`/api/slides?url=${encodeURIComponent(clase.slides_url)}`}
              title={clase.title}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
            <p className="text-slate-500 text-sm">Contenido proximamente</p>
          </div>
        )}

        {/* Boton marcar como visto */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={markAsWatched}
            disabled={watched || loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              watched
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 cursor-default'
                : 'bg-cyan-400 hover:bg-cyan-300 text-[#020617]'
            } disabled:opacity-60`}
          >
            {watched ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Vista
              </>
            ) : loading ? 'Guardando...' : 'Marcar como vista'}
          </button>

          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Volver al dashboard
          </Link>
        </div>

        {/* Contenido adicional placeholder */}
        <div className="border-t border-slate-800 pt-8">
          <h2 className="text-white font-medium mb-4">Recursos de esta clase</h2>
          <p className="text-slate-500 text-sm">
            Los recursos se agregarán junto con el contenido de la clase.
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
