'use client'

import { useState } from 'react'

type Variable = { name: string; description: string; example: string }
type Variation = { title: string; prompt: string }

export type PromptData = {
  type: 'prompt'
  prompt: string
  variables?: Variable[]
  example?: { input: string; output: string }
  use_cases?: string[]
  variations?: Variation[]
}

export default function PromptView({ data }: { data: PromptData }) {
  const [copied, setCopied] = useState(false)
  const [copiedVariation, setCopiedVariation] = useState<number | null>(null)
  const [exampleOpen, setExampleOpen] = useState(false)

  function copyText(text: string) {
    navigator.clipboard.writeText(text)
  }

  function handleCopy() {
    copyText(data.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyVariation(i: number, text: string) {
    copyText(text)
    setCopiedVariation(i)
    setTimeout(() => setCopiedVariation(null), 2000)
  }

  return (
    <div className="space-y-5">

      {/* Prompt principal */}
      <div className="bg-[#0A1628] border border-cyan-400/25 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-400/15 bg-cyan-400/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">Prompt listo para usar</span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-400 hover:bg-cyan-300 text-[#020617]'
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
          {data.prompt}
        </pre>
      </div>

      {/* Variables */}
      {data.variables && data.variables.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">Variables</h3>
            <p className="text-slate-500 text-xs mt-0.5">Reemplazá estas partes con tu información antes de usar el prompt</p>
          </div>
          <div className="divide-y divide-slate-800/60">
            {data.variables.map((v, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-4">
                <code className="shrink-0 text-xs px-2.5 py-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/25 rounded-lg font-mono whitespace-nowrap">
                  {v.name}
                </code>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm">{v.description}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Ejemplo: <span className="text-slate-300 italic">{v.example}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ejemplo real — colapsable */}
      {data.example && (
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
                <p className="text-white text-sm font-medium">Ver ejemplo real</p>
                <p className="text-slate-500 text-xs">Input usado + output que generó la IA</p>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-500 transition-transform ${exampleOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {exampleOpen && (
            <div className="border-t border-slate-800">
              <div className="px-5 py-4">
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2.5">Cómo lo usé</p>
                <div className="bg-slate-900 rounded-xl px-4 py-3 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {data.example.input}
                </div>
              </div>
              <div className="px-5 pb-5">
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2.5">Respuesta de la IA</p>
                <div className="bg-emerald-950/30 border border-emerald-500/15 rounded-xl px-4 py-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {data.example.output}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cuándo usarlo */}
      {data.use_cases && data.use_cases.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Cuándo usarlo</h3>
          <ul className="space-y-3">
            {data.use_cases.map((uc, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <p className="text-slate-300 text-sm leading-relaxed">{uc}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Variaciones */}
      {data.variations && data.variations.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="text-white font-semibold text-sm">Variaciones</h3>
            <p className="text-slate-500 text-xs mt-0.5">El mismo prompt adaptado a distintos casos</p>
          </div>
          <div className="divide-y divide-slate-800/60">
            {data.variations.map((v, i) => (
              <div key={i} className="px-5 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-medium">{v.title}</p>
                  <button
                    onClick={() => handleCopyVariation(i, v.prompt)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      copiedVariation === i
                        ? 'border-emerald-500/30 text-emerald-400'
                        : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    {copiedVariation === i ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-slate-900/60 rounded-xl px-4 py-3">
                  {v.prompt}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
