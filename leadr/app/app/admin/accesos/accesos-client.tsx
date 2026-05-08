'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Token = {
  id: string
  token: string
  used_at: string | null
  used_by: string | null
  expires_at: string
  pro_days: number
  created_at: string
}

type Props = {
  tokens: Token[]
  siteUrl: string
}

export default function AccesosClient({ tokens: initialTokens, siteUrl }: Props) {
  const router = useRouter()
  const [tokens, setTokens] = useState(initialTokens)
  const [count, setCount] = useState(10)
  const [proDays, setProDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [allCopied, setAllCopied] = useState(false)

  const unused = tokens.filter(t => !t.used_at && new Date(t.expires_at) > new Date())
  const used = tokens.filter(t => t.used_at)
  const expired = tokens.filter(t => !t.used_at && new Date(t.expires_at) <= new Date())

  function makeUrl(token: string) {
    return `${siteUrl}/activar/${token}`
  }

  async function generate() {
    setGenerating(true)
    const res = await fetch('/api/admin/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count, pro_days: proDays }),
    })
    if (res.ok) {
      router.refresh()
      const data = await res.json()
      const newTokens: Token[] = data.tokens.map((t: string) => ({
        id: t,
        token: t,
        used_at: null,
        used_by: null,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        pro_days: proDays,
        created_at: new Date().toISOString(),
      }))
      setTokens(prev => [...newTokens, ...prev])
    }
    setGenerating(false)
  }

  async function deleteToken(token: string) {
    await fetch('/api/admin/tokens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    setTokens(prev => prev.filter(t => t.token !== token))
  }

  function copyOne(token: string) {
    navigator.clipboard.writeText(makeUrl(token))
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyAll() {
    const links = unused.map(t => makeUrl(t.token)).join('\n')
    navigator.clipboard.writeText(links)
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Links de activación</h1>
        <p className="text-slate-400 text-sm">Generá links para que los alumnos de tu curso activen {proDays} días Pro gratis.</p>
      </div>

      {/* Generador */}
      <div className="bg-[#0A0F1E] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-5">Generar nuevos links</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Cantidad de links</label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1.5">Días de Pro</label>
            <input
              type="number"
              min={1}
              max={365}
              value={proDays}
              onChange={e => setProDays(Number(e.target.value))}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {generating ? 'Generando...' : `Generar ${count} link${count !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Disponibles', value: unused.length, color: 'text-cyan-400' },
          { label: 'Usados', value: used.length, color: 'text-emerald-400' },
          { label: 'Expirados', value: expired.length, color: 'text-slate-500' },
        ].map(s => (
          <div key={s.label} className="bg-[#0A0F1E] border border-slate-800 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Links disponibles */}
      {unused.length > 0 && (
        <div className="bg-[#0A0F1E] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div>
              <h2 className="text-white font-semibold">Links disponibles</h2>
              <p className="text-slate-500 text-xs mt-0.5">Un link por alumno — cada uno es de un solo uso</p>
            </div>
            <button
              onClick={copyAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                allCopied
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {allCopied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  ¡Copiados!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar todos
                </>
              )}
            </button>
          </div>
          <div className="divide-y divide-slate-800/60">
            {unused.map(t => (
              <div key={t.token} className="flex items-center gap-3 px-6 py-3.5">
                <code className="flex-1 text-slate-400 text-xs font-mono truncate">
                  {makeUrl(t.token)}
                </code>
                <span className="text-slate-600 text-xs whitespace-nowrap">{t.pro_days}d</span>
                <button
                  onClick={() => copyOne(t.token)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex-shrink-0 ${
                    copied === t.token
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {copied === t.token ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={() => deleteToken(t.token)}
                  className="p-1.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer flex-shrink-0"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links usados */}
      {used.length > 0 && (
        <div className="bg-[#0A0F1E] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Ya utilizados</h2>
          </div>
          <div className="divide-y divide-slate-800/60">
            {used.map(t => (
              <div key={t.token} className="flex items-center gap-3 px-6 py-3.5 opacity-50">
                <code className="flex-1 text-slate-500 text-xs font-mono truncate">{makeUrl(t.token)}</code>
                <span className="text-emerald-500 text-xs whitespace-nowrap">
                  Activado {new Date(t.used_at!).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
