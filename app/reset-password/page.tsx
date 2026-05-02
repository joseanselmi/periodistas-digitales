'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase pone el token en el hash de la URL — solo verificamos que exista sesión
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { setError(error.message); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center" aria-hidden="true">
              <span className="text-[#020617] font-bold text-sm">L</span>
            </div>
            <span className="text-white font-semibold text-lg">Leadr</span>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8">
          {!ready ? (
            <div className="text-center py-4">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Verificando link...</p>
            </div>
          ) : (
            <>
              <h1 className="text-white font-semibold text-xl mb-2">Nueva contraseña</h1>
              <p className="text-slate-400 text-sm mb-6">Elegí una contraseña segura de al menos 8 caracteres.</p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Nueva contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    placeholder="••••••••"
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1.5">Confirmá la contraseña</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
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
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
