'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [forgotSent, setForgotSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) { setError('No pudimos enviar el email. Revisá la dirección.'); return }
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#020617] font-bold text-sm">L</span>
            </div>
            <span className="text-white font-semibold text-lg">Leadr</span>
          </div>
          <p className="text-slate-400 text-sm">Periodistas Digitales</p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8">

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <h1 className="text-white font-semibold text-xl mb-6">Iniciar sesión</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-400 text-sm">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setError('') }}
                      className="text-xs text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#020617] font-semibold rounded-lg py-3 text-sm transition-colors cursor-pointer"
                >
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            </>
          )}

          {/* FORGOT */}
          {mode === 'forgot' && !forgotSent && (
            <>
              <button
                onClick={() => { setMode('login'); setError('') }}
                className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-5 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
              <h1 className="text-white font-semibold text-xl mb-2">Recuperar contraseña</h1>
              <p className="text-slate-400 text-sm mb-6">Te enviamos un link para que elijas una nueva.</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="tu@email.com"
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-[#020617] font-semibold rounded-lg py-3 text-sm transition-colors cursor-pointer"
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
            </>
          )}

          {/* SENT */}
          {mode === 'forgot' && forgotSent && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-cyan-400/10 border border-cyan-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-white font-semibold mb-2">Revisá tu email</h2>
              <p className="text-slate-400 text-sm mb-6">
                Enviamos un link a <span className="text-white">{email}</span>. Expira en 1 hora.
              </p>
              <button
                onClick={() => { setMode('login'); setForgotSent(false); setEmail('') }}
                className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Volver al login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
