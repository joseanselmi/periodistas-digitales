'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Range = '1d' | '7d' | '30d' | 'all'

interface Stats {
  visits: number
  uniqueSessions: number
  ctaHero: number
  ctaPricing: number
  ctaFinal: number
  ctaSticky: number
  mobile: number
  desktop: number
  topCities: { city: string; count: number }[]
  scrollDepth: { depth: number; count: number }[]
  conversionRate: string
}

const RANGES: { label: string; value: Range }[] = [
  { label: 'Hoy', value: '1d' },
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: 'Todo', value: 'all' },
]

export default function MetricasClient() {
  const [range, setRange] = useState<Range>('7d')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      const since: Record<Range, string | null> = {
        '1d': new Date(Date.now() - 86400000).toISOString(),
        '7d': new Date(Date.now() - 7 * 86400000).toISOString(),
        '30d': new Date(Date.now() - 30 * 86400000).toISOString(),
        'all': null,
      }

      let q = supabase.from('landing_events').select('*')
      if (since[range]) q = q.gte('created_at', since[range]!)
      const { data } = await q

      if (!data) { setLoading(false); return }

      const pageviews = data.filter(e => e.event_type === 'pageview')
      const clicks = data.filter(e => e.event_type === 'click')
      const sessions = new Set(data.map(e => e.session_id))
      const buyClicks = clicks.filter(e => ['cta_pricing', 'cta_final', 'cta_sticky'].includes(e.element))

      const cityMap: Record<string, number> = {}
      for (const e of pageviews) {
        if (e.city) cityMap[e.city] = (cityMap[e.city] || 0) + 1
      }
      const topCities = Object.entries(cityMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([city, count]) => ({ city, count }))

      const depthMap: Record<number, number> = {}
      for (const e of data.filter(x => x.event_type === 'scroll_depth')) {
        depthMap[e.scroll_depth] = (depthMap[e.scroll_depth] || 0) + 1
      }
      const scrollDepth = [25, 50, 75, 90].map(d => ({ depth: d, count: depthMap[d] || 0 }))

      const mobileCount = data.filter(e => e.event_type === 'pageview' && e.device === 'mobile').length
      const desktopCount = pageviews.length - mobileCount

      const rate = pageviews.length > 0
        ? ((buyClicks.length / pageviews.length) * 100).toFixed(1)
        : '0.0'

      setStats({
        visits: pageviews.length,
        uniqueSessions: sessions.size,
        ctaHero: clicks.filter(e => e.element === 'cta_hero').length,
        ctaPricing: clicks.filter(e => e.element === 'cta_pricing').length,
        ctaFinal: clicks.filter(e => e.element === 'cta_final').length,
        ctaSticky: clicks.filter(e => e.element === 'cta_sticky').length,
        mobile: mobileCount,
        desktop: desktopCount,
        topCities,
        scrollDepth,
        conversionRate: rate,
      })
      setLoading(false)
    }
    load()
  }, [range])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Métricas de la Landing</h1>
          <p className="text-slate-400 text-sm mt-1">Seguimiento en tiempo real de la página de ventas</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                range === r.value
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* KPIs principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Visitas', value: stats.visits, color: 'text-white' },
              { label: 'Sesiones únicas', value: stats.uniqueSessions, color: 'text-cyan-400' },
              { label: 'Tasa conversión', value: `${stats.conversionRate}%`, color: 'text-green-400' },
              { label: 'Clics en compra', value: stats.ctaPricing + stats.ctaFinal + stats.ctaSticky, color: 'text-violet-400' },
            ].map(k => (
              <div key={k.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <p className="text-slate-500 text-xs mb-2">{k.label}</p>
                <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          {/* Embudo de CTAs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-5">Embudo de clics</h2>
            <div className="space-y-3">
              {[
                { label: 'Botón Hero → Ver bonos', count: stats.ctaHero, color: 'bg-indigo-500' },
                { label: 'Botón Pricing → Comprar', count: stats.ctaPricing, color: 'bg-violet-500' },
                { label: 'Botón Final CTA → Comprar', count: stats.ctaFinal, color: 'bg-cyan-500' },
                { label: 'Barra sticky → Comprar', count: stats.ctaSticky, color: 'bg-green-500' },
              ].map(item => {
                const max = Math.max(stats.ctaHero, stats.ctaPricing, stats.ctaFinal, stats.ctaSticky, 1)
                return (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-xs text-slate-400 w-52 shrink-0">{item.label}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color} transition-all duration-700`}
                        style={{ width: `${(item.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-white w-8 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scroll depth + Dispositivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scroll depth */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-5">¿Hasta dónde llegan?</h2>
              <div className="space-y-3">
                {stats.scrollDepth.map(({ depth, count }) => {
                  const max = Math.max(...stats.scrollDepth.map(x => x.count), 1)
                  return (
                    <div key={depth} className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 w-12">{depth}%</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-cyan-500 transition-all duration-700"
                          style={{ width: `${(count / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Dispositivos */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 mb-5">Dispositivos</h2>
              <div className="flex items-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-violet-400">{stats.mobile}</p>
                  <p className="text-xs text-slate-500 mt-1">Móvil</p>
                </div>
                <div className="flex-1 bg-slate-800 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                    style={{
                      width: `${stats.mobile + stats.desktop > 0 ? (stats.mobile / (stats.mobile + stats.desktop)) * 100 : 50}%`
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400">{stats.desktop}</p>
                  <p className="text-xs text-slate-500 mt-1">Desktop</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top ciudades */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-5">Top ciudades</h2>
            {stats.topCities.length === 0 ? (
              <p className="text-slate-600 text-sm">Sin datos aún</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stats.topCities.map(({ city, count }) => (
                  <div key={city} className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3">
                    <span className="text-sm text-slate-300">{city}</span>
                    <span className="text-sm font-bold text-cyan-400">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-center mt-20">Sin datos disponibles</p>
      )}
    </div>
  )
}
