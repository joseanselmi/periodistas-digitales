'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export type Prompt = {
  id: number
  title: string
  description: string
  objective: string
  use_case: 'investigacion' | 'redaccion' | 'verificacion' | 'redes' | 'multimedia' | 'automatizacion'
  tool: 'claude' | 'chatgpt' | 'gemini' | 'perplexity' | 'veo' | 'otro'
  difficulty: 'principiante' | 'intermedio' | 'avanzado'
  time_estimate: string
  prompt_text: string
  variables: { name: string; description: string }[]
  why_it_works: string | null
  how_to_use: string | null
  example_output: string | null
  limitations: string | null
  related_ids: number[]
  module_slug: string | null
  status: string
  order_index: number
}

const USE_CASES: { key: string; label: string }[] = [
  { key: 'todos',          label: 'Todos' },
  { key: 'investigacion',  label: 'Investigación' },
  { key: 'redaccion',      label: 'Redacción' },
  { key: 'verificacion',   label: 'Verificación' },
  { key: 'redes',          label: 'Redes sociales' },
  { key: 'multimedia',     label: 'Multimedia' },
  { key: 'automatizacion', label: 'Automatización' },
]

const TOOLS: { key: string; label: string; color?: string }[] = [
  { key: 'todos',     label: 'Todas las herramientas' },
  { key: 'claude',    label: 'Claude',     color: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  { key: 'chatgpt',   label: 'ChatGPT',    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  { key: 'gemini',    label: 'Gemini',     color: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  { key: 'perplexity',label: 'Perplexity', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25' },
  { key: 'veo',       label: 'Veo',        color: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  { key: 'otro',      label: 'Otro',       color: 'bg-slate-500/15 text-slate-300 border-slate-500/25' },
]

const TOOL_STYLES: Record<string, string> = {
  claude:     'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  chatgpt:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  gemini:     'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  perplexity: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  veo:        'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  otro:       'bg-slate-500/15 text-slate-300 border border-slate-500/25',
}

const DIFFICULTY_STYLES: Record<string, string> = {
  principiante: 'text-emerald-400',
  intermedio:   'text-amber-400',
  avanzado:     'text-rose-400',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  principiante: 'Principiante',
  intermedio:   'Intermedio',
  avanzado:     'Avanzado',
}

export default function PromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUseCase, setActiveUseCase] = useState<string>('todos')
  const [activeTool, setActiveTool] = useState<string>('todos')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('prompts')
      .select('*')
      .eq('status', 'published')
      .order('order_index')
      .then(({ data }) => {
        setPrompts((data as Prompt[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = prompts.filter(p => {
    const matchUC = activeUseCase === 'todos' || p.use_case === activeUseCase
    const matchTool = activeTool === 'todos' || p.tool === activeTool
    return matchUC && matchTool
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-7 rounded-full bg-violet-400" />
        <div>
          <h1 className="text-2xl font-bold text-violet-400">Prompts</h1>
          {prompts.length > 0 && (
            <p className="text-slate-500 text-sm mt-0.5">{prompts.length} prompts listos para usar</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Categorías por caso de uso */}
          <div className="flex gap-2 flex-wrap mb-4">
            {USE_CASES.map(uc => (
              <button
                key={uc.key}
                onClick={() => setActiveUseCase(uc.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeUseCase === uc.key
                    ? 'bg-violet-400/15 text-violet-300 border-violet-400/30'
                    : 'text-slate-400 border-slate-800 hover:text-white hover:border-slate-600'
                }`}
              >
                {uc.label}
                {uc.key !== 'todos' && (
                  <span className="ml-1.5 text-[10px] font-mono opacity-60">
                    {prompts.filter(p => p.use_case === uc.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filtro por herramienta */}
          <div className="flex gap-2 flex-wrap mb-8">
            {TOOLS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTool(t.key)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                  activeTool === t.key
                    ? t.key === 'todos'
                      ? 'bg-slate-700 text-white border-slate-600'
                      : `${t.color ?? ''} border`
                    : 'text-slate-600 border-slate-800/60 hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No hay prompts con ese filtro todavía.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(prompt => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group bg-[#0A0F1E] border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-lg hover:shadow-violet-900/10"
                >
                  {/* Tool + difficulty */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${TOOL_STYLES[prompt.tool]}`}>
                      {prompt.tool === 'chatgpt' ? 'ChatGPT' : prompt.tool.charAt(0).toUpperCase() + prompt.tool.slice(1)}
                    </span>
                    <span className={`text-[10px] font-medium ${DIFFICULTY_STYLES[prompt.difficulty]}`}>
                      {DIFFICULTY_LABELS[prompt.difficulty]}
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-violet-200 transition-colors">
                    {prompt.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                    {prompt.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-600 text-[11px] flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {prompt.time_estimate}
                    </span>
                    <svg className="w-4 h-4 text-slate-700 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
