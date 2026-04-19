'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Group = { id: number; name: string; category: string }
type Props = { groups: Group[] }

type Step = 'form' | 'generating' | 'done'

const BRAND_DEFAULTS = {
  primary: '#22D3EE',
  secondary: '#7C3AED',
  bg: '#020617',
  surface: '#0F172A',
  text: '#F8FAFC',
}

const PIPELINE_STEPS = [
  { id: 'claude', label: 'Claude genera el contenido', detail: 'Analizando instrucción y creando slides...' },
  { id: 'html', label: 'Generando presentación HTML', detail: 'Aplicando brand identity...' },
  { id: 'storage', label: 'Subiendo a Supabase Storage', detail: 'Guardando archivo de slides...' },
  { id: 'db', label: 'Creando clase en base de datos', detail: 'Guardando como borrador...' },
]

export default function GenerarClaseClient({ groups }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [instruction, setInstruction] = useState('')
  const [groupId, setGroupId] = useState('')
  const [plan, setPlan] = useState('basic')
  const [brand, setBrand] = useState(BRAND_DEFAULTS)
  const [pipelineStep, setPipelineStep] = useState(-1)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ id: number; title: string; slidesUrl: string } | null>(null)

  async function handleGenerate() {
    if (!instruction.trim()) { setError('Escribí una instrucción para Claude'); return }
    setError('')
    setStep('generating')
    setPipelineStep(0)

    try {
      // Simular progreso del pipeline mientras la API responde
      const progressInterval = setInterval(() => {
        setPipelineStep(prev => prev < 2 ? prev + 1 : prev)
      }, 2000)

      const res = await fetch('/api/generate-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction,
          groupId: groupId ? parseInt(groupId) : null,
          plan,
          brandColors: brand,
        }),
      })

      clearInterval(progressInterval)
      setPipelineStep(3)

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')

      await new Promise(r => setTimeout(r, 800))
      setResult({ id: data.class.id, title: data.class.title, slidesUrl: data.slidesUrl })
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generando la clase')
      setStep('form')
    }
  }

  const CATEGORIES = ['clases', 'prompts', 'automatizaciones', 'bonus']

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center gap-3 sticky top-0 bg-[#020617]/95 backdrop-blur z-10">
        <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-7 h-7 rounded-lg bg-cyan-400 flex items-center justify-center">
          <span className="text-[#020617] font-bold text-xs">L</span>
        </div>
        <span className="text-slate-400 text-sm">Admin</span>
        <span className="text-slate-600">/</span>
        <span className="text-white text-sm">Generar clase con IA</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* STEP: FORM */}
        {step === 'form' && (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-semibold mb-1">Generar clase con IA</h1>
              <p className="text-slate-400 text-sm">Claude crea la presentación completa a partir de tu instrucción.</p>
            </div>

            <div className="space-y-5">
              {/* Instrucción */}
              <div>
                <label className="block text-slate-400 text-sm mb-1.5">Instrucción para Claude *</label>
                <textarea
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  rows={5}
                  placeholder="Ej: Crea una clase sobre cómo usar Claude para investigar noticias. Incluye ejemplos prácticos, prompts útiles y recursos para periodistas digitales."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                />
              </div>

              {/* Grupo y Plan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Grupo</label>
                  <select
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                  >
                    <option value="">Sin grupo</option>
                    {CATEGORIES.map(cat => (
                      <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                        {groups.filter(g => g.category === cat).map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Plan requerido</label>
                  <select
                    value={plan}
                    onChange={e => setPlan(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                  >
                    <option value="basic">Basic (gratis)</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
              </div>

              {/* Brand Identity */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-3">Brand Identity</p>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(brand) as [keyof typeof brand, string][])
                    .filter(([key]) => ['primary', 'secondary', 'bg'].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-slate-500 text-xs mb-1 capitalize">{key}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={e => setBrand(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-slate-400 text-xs font-mono">{value}</span>
                        </div>
                      </div>
                    ))}
                </div>
                {/* Preview */}
                <div
                  className="mt-3 rounded-lg p-3 text-xs font-medium"
                  style={{ background: brand.surface, color: brand.text, border: `1px solid ${brand.primary}30` }}
                >
                  <span style={{ color: brand.primary }}>●</span> Preview con tus colores
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerate}
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold py-3 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar con Claude
              </button>
            </div>
          </>
        )}

        {/* STEP: GENERATING — pipeline animado */}
        {step === 'generating' && (
          <div className="py-8">
            <h2 className="text-xl font-semibold mb-2">Generando tu clase...</h2>
            <p className="text-slate-400 text-sm mb-8">Claude está trabajando. Esto puede tardar 15-30 segundos.</p>

            <div className="space-y-3">
              {PIPELINE_STEPS.map((s, i) => {
                const isDone = pipelineStep > i
                const isActive = pipelineStep === i
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isActive
                        ? 'bg-cyan-400/10 border-cyan-400/30'
                        : 'bg-[#0F172A] border-slate-800 opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-500/20' : isActive ? 'bg-cyan-400/20' : 'bg-slate-700'
                    }`}>
                      {isDone ? (
                        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : isActive ? (
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDone ? 'text-emerald-300' : isActive ? 'text-white' : 'text-slate-500'}`}>
                        {s.label}
                      </p>
                      {isActive && <p className="text-slate-400 text-xs mt-0.5">{s.detail}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP: DONE */}
        {step === 'done' && result && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Clase generada</h2>
            <p className="text-slate-400 text-sm mb-1">
              <span className="text-white font-medium">{result.title}</span>
            </p>
            <p className="text-slate-500 text-xs mb-8">Guardada como borrador. Revisá y publicá cuando estés listo.</p>

            {/* Preview de slides */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden mb-6 aspect-video">
              <iframe src={result.slidesUrl} className="w-full h-full" title="Preview slides" />
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href={`/admin/clase/${result.id}`}
                className="bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Editar y publicar
              </Link>
              <Link
                href="/admin"
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors border border-slate-700"
              >
                Ir al admin
              </Link>
              <button
                onClick={() => { setStep('form'); setResult(null); setPipelineStep(-1) }}
                className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Generar otra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
