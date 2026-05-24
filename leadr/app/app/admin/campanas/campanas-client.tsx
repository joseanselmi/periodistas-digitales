'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Email {
  id: string
  asunto: string
  enviados: number
  errores: number
  fecha: string
}

interface Segmento {
  nombre: string
  contactos: number
  l1: string
  l2: string
  l3: string
}

interface Usuario {
  email: string
  plan: string
  plan_expires_at: string | null
  created_at: string
}

interface Campaign {
  id: string
  nombre: string
  descripcion: string
  estado: string
  inicio: string
  cierre_token: string
  token: string
  total_contactos: number
  emails: Email[]
  segmentos: Segmento[]
  registrados: number
  activados: number
  usuarios: Usuario[]
}

export default function CampanasClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/campanas')
      .then(r => r.json())
      .then(data => { setCampaigns(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalEnviados = campaigns.reduce((a, c) => a + c.emails.reduce((b, e) => b + e.enviados, 0), 0)
  const totalActivados = campaigns.reduce((a, c) => a + c.activados, 0)
  const totalRegistrados = campaigns.reduce((a, c) => a + c.registrados, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Campañas de email</h1>
        <p className="text-slate-400 text-sm mt-1">Historial, métricas y activaciones por campaña</p>
      </div>

      {/* KPIs globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Campañas', value: campaigns.length, color: 'text-white' },
          { label: 'Emails enviados', value: totalEnviados, color: 'text-cyan-400' },
          { label: 'Registros', value: totalRegistrados, color: 'text-violet-400' },
          { label: 'Activaciones', value: totalActivados, color: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-slate-500 text-xs mb-2">{k.label}</p>
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Lista de campañas */}
      <div className="space-y-3">
        {campaigns.map(c => {
          const convRate = c.total_contactos > 0 ? ((c.activados / c.total_contactos) * 100).toFixed(1) : '0'
          const regRate  = c.total_contactos > 0 ? ((c.registrados / c.total_contactos) * 100).toFixed(1) : '0'
          const daysLeft = Math.ceil((new Date(c.cierre_token).getTime() - Date.now()) / 86400000)

          return (
            <div
              key={c.id}
              onClick={() => router.push(`/admin/campanas/${c.id}`)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-800/60 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      c.estado === 'activa' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`} />
                    <h2 className="text-white font-semibold text-base truncate">{c.nombre}</h2>
                    {daysLeft > 0 && (
                      <span className="text-xs bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-full px-2 py-0.5 flex-shrink-0">
                        token vence en {daysLeft}d
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm mb-4 truncate">{c.descripcion}</p>

                  {/* Métricas en línea */}
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-slate-500 text-xs">Contactos</p>
                      <p className="text-white font-semibold">{c.total_contactos}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Emails</p>
                      <p className="text-cyan-400 font-semibold">{c.emails.reduce((a, e) => a + e.enviados, 0)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Registros</p>
                      <p className="text-violet-400 font-semibold">{c.registrados} <span className="text-slate-600 font-normal text-xs">({regRate}%)</span></p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Activaciones</p>
                      <p className="text-emerald-400 font-semibold">{c.activados} <span className="text-slate-600 font-normal text-xs">({convRate}%)</span></p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Inicio</p>
                      <p className="text-white font-semibold">{new Date(c.inicio).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                </div>

                {/* Flecha */}
                <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Barra de progreso emails */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-slate-600 text-xs">Secuencia</p>
                </div>
                <div className="flex gap-2">
                  {c.emails.map((e, i) => (
                    <div key={e.id} className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">L{i + 1}</span>
                        <span className="text-slate-400">{e.enviados}</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(e.enviados / c.total_contactos) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {campaigns.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <p className="text-lg">Sin campañas todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}
