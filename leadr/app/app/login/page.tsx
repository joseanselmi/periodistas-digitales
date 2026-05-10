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

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('No se pudo conectar con Google. Intentá de nuevo.')
      setLoading(false)
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-600 text-xs">o continuá con</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
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
