'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ActivarPage() {
  return (
    <Suspense>
      <ActivarContent />
    </Suspense>
  )
}

function ActivarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('t') ?? 'LEADR2026'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState<'form' | 'activating'>('form')

  async function grantPro() {
    const res = await fetch('/api/activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.error ?? `HTTP ${res.status}`)
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/api/activar-redirect?t=${token}`,
      },
    })
    if (error) { setError('No se pudo conectar con Google.'); setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Intentar registrar. Si ya existe, hacer login.
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/api/activar-redirect?t=${token}`,
      },
    })

    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already')) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) {
          setError('Ya tenés cuenta con ese email — revisá tu contraseña.')
          setLoading(false)
          return
        }
      } else {
        setError(signUpError.message)
        setLoading(false)
        return
      }
    }

    // Verificar que la sesión está activa antes de llamar la API
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('No se pudo iniciar sesión. Intentá de nuevo.')
      setLoading(false)
      return
    }

    // Activar pro — si falla, mostrar error (no redirigir en silencio)
    setStep('activating')
    try {
      await grantPro()
      router.push('/dashboard?activated=1')
      router.refresh()
    } catch (err) {
      setStep('form')
      setError(err instanceof Error ? err.message : 'No se pudo activar el acceso. Escribinos a jose@sistemadeingresosdiariosia.com')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/leadr-home" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-white font-bold text-xl">Leadr</span>
          </Link>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">

          {/* Header destacado */}
          <div className="bg-gradient-to-br from-violet-500/15 to-cyan-400/10 border-b border-violet-500/20 px-8 pt-8 pb-6">
            <div className="inline-flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/30 rounded-full px-3 py-1 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-xs font-semibold tracking-wide uppercase">Acceso exclusivo</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-snug mb-2">
              Tu mes gratis de Leadr<br />está esperando
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Como comprador del Sistema de Ingresos Diarios, desbloqueaste <span className="text-white font-medium">30 días completos de Leadr Pro</span> — sin tarjeta, sin compromiso.
            </p>

            {/* Beneficios */}
            <ul className="mt-4 space-y-1.5">
              {[
                'Enciclopedia completa de periodismo + IA en español',
                'Actualización semanal con lo más útil de la industria',
                'Biblioteca de prompts listos para usar en tu trabajo',
              ].map(b => (
                <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-300 text-xs font-medium">Oferta válida hasta el 31 de mayo</span>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-7">
            {step === 'activating' ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">Activando tu acceso Pro...</p>
                <p className="text-slate-500 text-sm mt-1">Un momento</p>
              </div>
            ) : (
              <>
                <h2 className="text-white font-semibold mb-5">Creá tu cuenta y activá</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="el mismo con el que compraste el curso"
                      className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1.5">Elegí una contraseña</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-400 transition-colors"
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
                    className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold rounded-lg py-3 text-sm transition-all cursor-pointer shadow-lg shadow-violet-500/20"
                  >
                    {loading ? 'Un momento...' : 'Activar mi mes gratis →'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-slate-600 text-xs">o usá Google</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 font-medium rounded-lg py-2.5 text-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </button>

                <p className="text-slate-600 text-xs text-center mt-5">
                  ¿Ya tenés cuenta?{' '}
                  <Link href="/login" className="text-slate-400 hover:text-white transition-colors underline underline-offset-2">
                    Iniciá sesión — tu mes se activa igual
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
