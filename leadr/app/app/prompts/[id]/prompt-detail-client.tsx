'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Prompt } from '@/app/dashboard/prompt-library'

const USE_CASE_LABELS: Record<string, string> = {
  investigacion:  'Investigación',
  redaccion:      'Redacción',
  verificacion:   'Verificación',
  redes:          'Redes sociales',
  multimedia:     'Multimedia',
  automatizacion: 'Automatización',
}

const TOOL_STYLES: Record<string, string> = {
  claude:     'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  chatgpt:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  gemini:     'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  perplexity: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  veo:        'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  otro:       'bg-slate-500/15 text-slate-300 border border-slate-500/25',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  principiante: 'Principiante',
  intermedio:   'Intermedio',
  avanzado:     'Avanzado',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  principiante: 'text-emerald-400',
  intermedio:   'text-amber-400',
  avanzado:     'text-rose-400',
}

type RelatedPrompt = Pick<Prompt, 'id' | 'title' | 'use_case' | 'tool' | 'difficulty' | 'time_estimate' | 'description'>

type Props = {
  prompt: Prompt
  related: RelatedPrompt[]
}

export default function PromptDetailClient({ prompt, related }: Props) {
  const [copied, setCopied] = useState(false)
  const [exampleOpen, setExampleOpen] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(prompt.prompt_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toolLabel = prompt.tool === 'chatgpt' ? 'ChatGPT' : prompt.tool.charAt(0).toUpperCase() + prompt.tool.slice(1)

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
          Prompts
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-400 text-sm truncate">{USE_CASE_LABELS[prompt.use_case]}</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${TOOL_STYLES[prompt.tool]}`}>
            {toolLabel}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
            {USE_CASE_LABELS[prompt.use_case]}
          </span>
          <span className={`text-xs font-medium ${DIFFICULTY_COLORS[prompt.difficulty]}`}>
            {DIFFICULTY_LABELS[prompt.difficulty]}
          </span>
          <span className="text-slate-600 text-xs flex items-center gap-1 ml-auto">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {prompt.time_estimate}
          </span>
        </div>

        {/* Título + descripción + objetivo */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white leading-tight">{prompt.title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{prompt.description}</p>
          {prompt.objective && (
            <div className="flex items-start gap-2.5 bg-violet-500/8 border border-violet-500/20 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="text-violet-200 text-sm leading-relaxed">{prompt.objective}</p>
            </div>
          )}
        </div>

        {/* El prompt */}
        <div className="bg-[#0A1628] border border-violet-400/25 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-violet-400/15 bg-violet-400/5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Prompt listo para usar</span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-violet-500 hover:bg-violet-400 text-white'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  ¡Copiado!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar prompt
                </>
              )}
            </button>
          </div>
          <pre className="px-5 py-5 text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {prompt.prompt_text}
          </pre>
        </div>

        {/* Variables */}
        {prompt.variables && prompt.variables.length > 0 && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-white font-semibold text-sm">Variables a completar</h3>
              <p className="text-slate-500 text-xs mt-0.5">Reemplazá estas partes con tu información antes de usar el prompt</p>
            </div>
            <div className="divide-y divide-slate-800/60">
              {prompt.variables.map((v, i) => (
                <div key={i} className="px-5 py-4 flex items-start gap-4">
                  <code className="shrink-0 text-xs px-2.5 py-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-lg font-mono whitespace-nowrap">
                    {v.name}
                  </code>
                  <p className="text-slate-300 text-sm">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Por qué funciona */}
        {prompt.why_it_works && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-sm">Por qué funciona</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{prompt.why_it_works}</p>
          </div>
        )}

        {/* Cómo usarlo */}
        {prompt.how_to_use && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">Cómo usarlo paso a paso</h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{prompt.how_to_use}</div>
          </div>
        )}

        {/* Ejemplo de output — colapsable */}
        {prompt.example_output && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExampleOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Ver ejemplo de output</p>
                  <p className="text-slate-500 text-xs">Qué deberías obtener al usar este prompt</p>
                </div>
              </div>
              <svg className={`w-4 h-4 text-slate-500 transition-transform ${exampleOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {exampleOpen && (
              <div className="border-t border-slate-800 px-5 py-5">
                <div className="bg-emerald-950/30 border border-emerald-500/15 rounded-xl px-4 py-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.example_output}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Limitaciones */}
        {prompt.limitations && (
          <div className="bg-[#0F172A] border border-rose-500/15 rounded-2xl p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-white font-semibold text-sm">Cuándo NO usar este prompt</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{prompt.limitations}</p>
          </div>
        )}

        {/* Módulo relacionado */}
        {prompt.module_slug && (
          <div className="border border-violet-500/20 rounded-2xl p-5 bg-violet-500/5">
            <p className="text-slate-400 text-xs mb-2">Este prompt se trabaja en profundidad en:</p>
            <Link
              href={`/dashboard`}
              className="text-violet-300 text-sm font-medium hover:text-violet-200 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {prompt.module_slug}
            </Link>
          </div>
        )}

        {/* Prompts relacionados */}
        {related.length > 0 && (
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Prompts relacionados</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={`/prompts/${r.id}`}
                  className="group bg-[#0A0F1E] border border-slate-800 hover:border-violet-500/40 rounded-xl p-4 flex flex-col gap-2 transition-all"
                >
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded w-fit ${TOOL_STYLES[r.tool]}`}>
                    {r.tool === 'chatgpt' ? 'ChatGPT' : r.tool.charAt(0).toUpperCase() + r.tool.slice(1)}
                  </span>
                  <p className="text-white text-sm font-medium leading-snug group-hover:text-violet-200 transition-colors">
                    {r.title}
                  </p>
                  <p className="text-slate-500 text-xs line-clamp-2">{r.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Volver */}
        <div className="pt-4 pb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a la biblioteca
          </Link>
        </div>

      </div>
    </div>
  )
}
