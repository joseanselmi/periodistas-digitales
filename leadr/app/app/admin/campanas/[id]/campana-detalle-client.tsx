'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

function fmt(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export default function CampanaDetalleClient({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/campanas')
      .then(r => r.json())
      .then((data: Campaign[]) => {
        setCampaign(data.find(c => c.id === id) ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!campaign) return (
    <div className="p-6 text-slate-500">Campaña no encontrada.</div>
  )

  const totalEnviados = campaign.emails.reduce((a, e) => a + e.enviados, 0)
  const convRate = ((campaign.activados / campaign.total_contactos) * 100).toFixed(1)
  const regRate  = ((campaign.registrados / campaign.total_contactos) * 100).toFixed(1)
  const daysLeft = Math.ceil((new Date(campaign.cierre_token).getTime() - Date.now()) / 86400000)

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/campanas" className="hover:text-white transition-colors">Campañas</Link>
        <span>/</span>
        <span className="text-white">{campaign.nombre}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${campaign.estado === 'activa' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <h1 className="text-2xl font-bold text-white">{campaign.nombre}</h1>
          </div>
          <p className="text-slate-400 text-sm">{campaign.descripcion}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500">Inicio: {fmt(campaign.inicio)}</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-500">Token: <code className="text-cyan-400">{campaign.token}</code></span>
            <span className="text-slate-700">·</span>
            {daysLeft > 0
              ? <span className="text-xs text-amber-300">vence en {daysLeft} días ({fmt(campaign.cierre_token)})</span>
              : <span className="text-xs text-red-400">token vencido</span>
            }
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Contactos', value: campaign.total_contactos, color: 'text-white', sub: null },
          { label: 'Emails enviados', value: totalEnviados, color: 'text-cyan-400', sub: `${campaign.emails.length} secuencias` },
          { label: 'Registros', value: campaign.registrados, color: 'text-violet-400', sub: `${regRate}% de contactos` },
          { label: 'Activaciones', value: campaign.activados, color: 'text-emerald-400', sub: `${convRate}% de contactos` },
          { label: 'Sin activar', value: campaign.registrados - campaign.activados, color: 'text-amber-400', sub: 'tienen cuenta' },
        ].map(k => (
          <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            {k.sub && <p className="text-slate-600 text-xs mt-0.5">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Embudo visual */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h2 className="text-white font-semibold text-sm mb-4">Embudo de conversión</h2>
        <div className="space-y-3">
          {[
            { label: 'Contactos en lista', n: campaign.total_contactos, max: campaign.total_contactos, color: 'bg-slate-600' },
            { label: 'Recibieron L3 (link)', n: campaign.total_contactos, max: campaign.total_contactos, color: 'bg-cyan-600' },
            { label: 'Se registraron', n: campaign.registrados, max: campaign.total_contactos, color: 'bg-violet-500' },
            { label: 'Activaron plan', n: campaign.activados, max: campaign.total_contactos, color: 'bg-emerald-500' },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-slate-400 text-sm w-44 shrink-0">{row.label}</span>
              <div className="flex-1 bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${row.color} transition-all`}
                  style={{ width: `${(row.n / row.max) * 100}%` }}
                />
              </div>
              <span className="text-white font-semibold text-sm w-12 text-right">{row.n}</span>
              <span className="text-slate-600 text-xs w-12">{((row.n / row.max) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Secuencia de emails */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Secuencia de emails</h2>
          <div className="space-y-3">
            {campaign.emails.map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                  <span className="text-cyan-400 text-xs font-bold">L{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm truncate">{e.asunto}</p>
                  <p className="text-slate-500 text-xs">{fmt(e.fecha)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-semibold text-sm">{e.enviados}</p>
                  {e.errores > 0 && <p className="text-red-400 text-xs">{e.errores} err</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Segmentos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Segmentos</h2>
          <div className="space-y-3">
            {campaign.segmentos.map(s => (
              <div key={s.nombre} className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium text-sm">{s.nombre}</span>
                  <span className="text-slate-400 text-sm">{s.contactos} contactos</span>
                </div>
                <div className="flex gap-2">
                  {['l1', 'l2', 'l3'].map((l, i) => (
                    <div key={l} className="flex-1 text-center">
                      <div className="text-xs text-slate-500 mb-1">L{i + 1}</div>
                      <div className="bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 text-xs py-0.5">
                        {fmt(s[l as 'l1' | 'l2' | 'l3'])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Usuarios que se registraron</h2>
          <span className="text-slate-500 text-xs">{campaign.usuarios.length} total</span>
        </div>
        {campaign.usuarios.length === 0 ? (
          <p className="text-slate-600 text-sm p-5">Nadie se registró todavía.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 font-medium px-5 py-3">Email</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Plan</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Registro</th>
                <th className="text-left text-slate-500 font-medium px-5 py-3">Vence</th>
              </tr>
            </thead>
            <tbody>
              {campaign.usuarios.map(u => (
                <tr key={u.email} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-3 text-slate-300">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      u.plan_expires_at
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {u.plan_expires_at ? 'Pro ✓' : 'Sin activar'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {u.plan_expires_at ? fmt(u.plan_expires_at) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
