'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Status = 'valid' | 'invalid' | 'used' | 'expired'

type Props = {
  token: string
  status: Status
  proDays?: number
}

export default function ActivarClient({ token, status, proDays = 30 }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (status === 'invalid') return <ErrorPage title="Link inválido" desc="Este link de activación no existe. Verificá que lo copiaste correctamente." />
  if (status === 'used') return <ErrorPage title="Link ya utilizado" desc="Este link de activación ya fue usado. Cada link es de un solo uso." />
  if (status === 'expired') return <ErrorPage title="Link expirado" desc="Este link de activación ya expiró. Pedile uno nuevo a tu instructor." />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (mode === 'register') {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password })
      if (signUpErr) {
        setError(signUpErr.message === 'User already registered' ? 'Ese email ya tiene cuenta. Iniciá sesión.' : signUpErr.message)
        setLoading(false)
        return
      }
    } else {
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
      if (loginErr) {
        setError('Email o contraseña incorrectos.')
        setLoading(false)
        return
      }
    }

    // Activar token
    const res = await fetch('/api/activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error activando el plan.')
      setLoading(false)
      return
    }

    router.push('/dashboard?activated=1')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center">
            <span className="text-[#020617] font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-xl">Leadr</span>
        </div>

        {/* Card */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
          {/* Banner Pro */}
          <div className="bg-gradient-to-r from-violet-500/20 to-cyan-400/10 border-b border-violet-500/20 px-7 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Acceso especial</p>
                <p className="text-white font-bold text-lg leading-snug">
                  {proDays} días de Leadr Pro — gratis
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Tu instructor te regaló acceso completo a Leadr. Creá tu cuenta o iniciá sesión para activarlo.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === 'register' ? 'text-white border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Crear cuenta
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                mode === 'login' ? 'text-white border-b-2 border-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Ya tengo cuenta
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5" htmlFor="password">
                {mode === 'register' ? 'Elegí una contraseña' : 'Contraseña'}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 text-[#020617] font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Activando...' : `Activar ${proDays} días Pro`}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ¿Problemas con el link?{' '}
          <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
            Ir al login
          </Link>
        </p>
      </div>
    </div>
  )
}

function ErrorPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-medium">
          Ir al login
        </Link>
      </div>
    </div>
  )
}
