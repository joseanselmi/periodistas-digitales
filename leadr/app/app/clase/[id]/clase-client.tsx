'use client'

import { useState } from 'react'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { createClient } from '@/lib/supabase/client'
import PromptView, { type PromptData } from './prompt-view'

type SlidesJson = { slides: unknown[]; body?: string | null } | { type: 'prompt' } & PromptData | unknown[]

type Clase = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  slides_url: string | null
  slides_json: SlidesJson | null
  plan_required: string
  groups: { id: number; name: string; category: string } | null
}

type NavClass = { id: number; title: string; plan_required: string } | null

type Props = {
  clase: Clase
  userPlan: string
  alreadyWatched: boolean
  prevClass: NavClass
  nextClass: NavClass
  existingRating: { rating: number; comment: string | null } | null
}

function extractYouTubeId(url: string | null): string | null {
  if (!url) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? url
}

function getBody(slides_json: SlidesJson | null): string | null {
  if (!slides_json) return null
  if (Array.isArray(slides_json)) return null
  if ((slides_json as { type?: string }).type === 'prompt') return null
  return (slides_json as { body?: string | null }).body ?? null
}

function getPromptData(slides_json: SlidesJson | null): PromptData | null {
  if (!slides_json || Array.isArray(slides_json)) return null
  if ((slides_json as { type?: string }).type === 'prompt') return slides_json as PromptData
  return null
}

export default function ClaseClient({ clase, userPlan, alreadyWatched, prevClass, nextClass, existingRating }: Props) {
  const [watched, setWatched] = useState(alreadyWatched)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [rating, setRating] = useState(existingRating?.rating ?? 0)
  const [ratingHover, setRatingHover] = useState(0)
  const [comment, setComment] = useState(existingRating?.comment ?? '')
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingDone, setRatingDone] = useState(!!existingRating)

  const body = getBody(clase.slides_json)
  const promptData = getPromptData(clase.slides_json)
  const isPrompt = promptData !== null
  const hasVideo = !isPrompt && !!clase.video_url
  const hasSlides = !isPrompt && !!clase.slides_url
  const hasBoth = hasVideo && hasSlides

  const [activeTab, setActiveTab] = useState<'video' | 'slides'>(hasVideo ? 'video' : 'slides')

  async function markAsWatched() {
    if (watched) return
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase
      .from('user_progress')
      .upsert({ user_id: user.id, class_id: clase.id })

    if (!error) {
      setWatched(true)
      showToast('Clase marcada como vista')
    } else {
      showToast('Error al guardar el progreso. Intentá de nuevo.')
    }
    setLoading(false)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function submitRating() {
    if (!rating) return
    setRatingLoading(true)
    const res = await fetch('/api/rate-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ class_id: clase.id, rating, comment }),
    })
    setRatingLoading(false)
    if (res.ok) {
      setRatingDone(true)
      showToast('¡Gracias por tu valoración!')
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#020617]/95 backdrop-blur z-10">
        <Link
          href={clase.groups ? `/dashboard/grupo/${clase.groups.id}` : '/dashboard'}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-400 flex items-center justify-center" aria-hidden="true">
            <span className="text-[#020617] font-bold text-xs">L</span>
          </div>
          <span className="font-semibold text-sm">Leadr</span>
        </div>
        {clase.groups && (
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors capitalize">
              {clase.groups.category}
            </Link>
            <span>/</span>
            <Link href={`/dashboard/grupo/${clase.groups.id}`} className="hover:text-slate-300 transition-colors">
              {clase.groups.name}
            </Link>
            <span>/</span>
            <span className="text-slate-300 truncate max-w-[200px]">{clase.title}</span>
          </nav>
        )}
      </nav>

      {/* Título y badge */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold text-white mb-2">{clase.title}</h1>
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
      </div>

      {/* Prompt view */}
      {isPrompt && promptData && (
        <div className="max-w-5xl mx-auto px-6 pb-5">
          <PromptView data={promptData} />
        </div>
      )}

      {/* Tabs cuando hay video Y slides */}
      {hasBoth && (
        <div className="max-w-5xl mx-auto px-6 mb-3">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Video
            </button>
            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Slides
            </button>
          </div>
        </div>
      )}

      {/* Video */}
      {hasVideo && (!hasBoth || activeTab === 'video') && (
        <div className="px-4 pb-5">
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 max-w-5xl mx-auto">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(clase.video_url)}`}
              title={clase.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Slides */}
      {hasSlides && (!hasBoth || activeTab === 'slides') && (
        <div className="px-4 pb-5">
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 max-w-5xl mx-auto">
            <iframe
              src={`/api/slides?url=${encodeURIComponent(clase.slides_url!)}`}
              title={clase.title}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {!isPrompt && !hasVideo && !hasSlides && (
        <div className="px-4 pb-5">
          <div className="aspect-video rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center max-w-5xl mx-auto">
            <p className="text-slate-500 text-sm">Contenido próximamente</p>
          </div>
        </div>
      )}

      {/* Contenido + controles */}
      <div className="max-w-5xl mx-auto px-6 pb-16">

        {/* Contenido escrito — body generado por Claude */}
        {body && (
          <div className="pt-8 pb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold">Contenido completo</h2>
                <p className="text-slate-500 text-xs mt-0.5">Lectura detallada de la clase</p>
              </div>
            </div>
            <div
              className="prose-clase"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(body) }}
            />
          </div>
        )}

        {/* Marcar como vista */}
        <div className="flex items-center gap-4 py-6 border-t border-slate-800">
          <button
            onClick={markAsWatched}
            disabled={watched || loading}
            className={`flex items-center gap-2 px-3 sm:px-5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
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
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors py-2 px-1">
            Volver al dashboard
          </Link>
        </div>

        {/* Valoración de la clase */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {ratingDone ? 'Tu valoración' : '¿Qué te pareció esta clase?'}
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                {ratingDone ? 'Podés editarla cuando quieras' : 'Tu opinión nos ayuda a mejorar el contenido'}
              </p>
            </div>
          </div>

          {/* Estrellas */}
          <div className="flex items-center gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => { setRating(star); setRatingDone(false) }}
                onMouseEnter={() => setRatingHover(star)}
                onMouseLeave={() => setRatingHover(0)}
                className="cursor-pointer transition-transform hover:scale-110"
                aria-label={`Valorar ${star} estrellas`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (ratingHover || rating)
                      ? 'text-amber-400'
                      : 'text-slate-700'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="text-slate-400 text-sm ml-2">
                {['', 'Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'][rating]}
              </span>
            )}
          </div>

          {/* Comentario opcional */}
          {rating > 0 && !ratingDone && (
            <div className="space-y-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="¿Qué mejorarías? ¿Qué fue lo más útil? (opcional)"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 resize-none"
              />
              <button
                onClick={submitRating}
                disabled={ratingLoading}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-[#020617] text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 cursor-pointer"
              >
                {ratingLoading ? 'Enviando...' : 'Enviar valoración'}
              </button>
            </div>
          )}

          {ratingDone && (
            <button
              onClick={() => setRatingDone(false)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer underline"
            >
              Editar mi valoración
            </button>
          )}
        </div>

        {/* Navegación clase anterior / siguiente */}
        {(prevClass || nextClass) && (
          <div className="flex items-stretch justify-between gap-3 pt-2">
            {prevClass ? (
              <Link
                href={`/clase/${prevClass.id}`}
                className="flex items-center gap-3 group min-h-[56px] px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all max-w-[48%]"
              >
                <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="min-w-0">
                  <p className="text-slate-500 text-xs mb-0.5">Anterior</p>
                  <p className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors leading-snug">
                    {prevClass.title}
                  </p>
                </div>
              </Link>
            ) : <div />}

            {nextClass ? (
              <Link
                href={`/clase/${nextClass.id}`}
                className="flex items-center gap-3 group min-h-[56px] px-4 py-3 rounded-xl border transition-all max-w-[48%] ml-auto text-right
                  bg-slate-800/60 hover:bg-slate-800 border-slate-800 hover:border-slate-700"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <p className="text-slate-500 text-xs">Siguiente</p>
                    {nextClass.plan_required === 'pro' && userPlan !== 'pro' && (
                      <span className="text-xs px-1.5 py-0 rounded-full bg-violet-500/20 text-violet-300">Pro</span>
                    )}
                  </div>
                  <p className="text-white text-sm font-medium truncate group-hover:text-cyan-400 transition-colors leading-snug">
                    {nextClass.title}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}

      {/* Estilos del artículo */}
      <style>{`
        .prose-clase h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #F8FAFC;
          margin: 2.5rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #1E293B;
        }
        .prose-clase h2:first-child { margin-top: 0; }
        .prose-clase h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #22D3EE;
          margin: 1.75rem 0 0.75rem;
        }
        .prose-clase p {
          color: #94A3B8;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 0.975rem;
        }
        .prose-clase ul, .prose-clase ol {
          margin: 1rem 0 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .prose-clase li {
          color: #94A3B8;
          line-height: 1.7;
          font-size: 0.975rem;
        }
        .prose-clase ul li { list-style: disc; }
        .prose-clase ol li { list-style: decimal; }
        .prose-clase strong { color: #F8FAFC; font-weight: 600; }
        .prose-clase a {
          color: #22D3EE;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-clase a:hover { opacity: 0.8; }
        .prose-clase blockquote {
          border-left: 3px solid #22D3EE;
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          background: #0F172A;
          border-radius: 0 10px 10px 0;
          color: #CBD5E1;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
