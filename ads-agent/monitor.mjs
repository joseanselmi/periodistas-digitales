/**
 * monitor.mjs — Monitor diario de Meta Ads
 * Compara ayer vs. anteayer, alerta si algo cae, guarda reporte.
 * Uso: node monitor.mjs
 * Variables: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

const TOKEN     = process.env.META_ACCESS_TOKEN
const ACCOUNT   = process.env.META_AD_ACCOUNT_ID?.replace('act_', '')
const BASE      = 'https://graph.facebook.com/v21.0'

if (!TOKEN || !ACCOUNT) {
  console.error('❌ Faltan META_ACCESS_TOKEN y/o META_AD_ACCOUNT_ID')
  process.exit(1)
}

const FIELDS = [
  'campaign_name', 'adset_name', 'ad_name',
  'impressions', 'clicks', 'spend', 'reach',
  'ctr', 'cpm', 'cpp', 'frequency',
  'actions', 'cost_per_action_type',
].join(',')

async function fetchInsights(datePreset) {
  const url = new URL(`${BASE}/act_${ACCOUNT}/insights`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('fields', FIELDS)
  url.searchParams.set('level', 'ad')
  url.searchParams.set('date_preset', datePreset)
  url.searchParams.set('limit', '500')

  const res  = await fetch(url.toString())
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.data || []
}

function purchases(row) {
  return parseInt((row.actions || []).find(a => a.action_type === 'purchase')?.value || 0)
}

function summarize(rows) {
  return {
    spend:       rows.reduce((s, r) => s + parseFloat(r.spend || 0), 0),
    impressions: rows.reduce((s, r) => s + parseInt(r.impressions || 0), 0),
    clicks:      rows.reduce((s, r) => s + parseInt(r.clicks || 0), 0),
    purchases:   rows.reduce((s, r) => s + purchases(r), 0),
    ctr:         rows.length ? (rows.reduce((s, r) => s + parseFloat(r.ctr || 0), 0) / rows.length) : 0,
    cpm:         rows.length ? (rows.reduce((s, r) => s + parseFloat(r.cpm || 0), 0) / rows.length) : 0,
    activeAds:   rows.length,
  }
}

function delta(now, prev, key) {
  if (!prev[key] || prev[key] === 0) return null
  return ((now[key] - prev[key]) / prev[key] * 100).toFixed(1)
}

function arrow(pct) {
  if (pct === null) return '—'
  const n = parseFloat(pct)
  if (n > 10)  return `🟢 +${pct}%`
  if (n > 0)   return `🟡 +${pct}%`
  if (n > -10) return `🟡 ${pct}%`
  return `🔴 ${pct}%`
}

function cpa(row) {
  const p = purchases(row)
  return p > 0 ? (parseFloat(row.spend) / p).toFixed(2) : null
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📊 MONITOR DIARIO — META ADS')
console.log(`   Cuenta: act_${ACCOUNT}\n`)

const [yesterday, twoDaysAgo] = await Promise.all([
  fetchInsights('yesterday'),
  fetchInsights('last_3d'),
]).catch(err => { console.error('❌', err.message); process.exit(1) })

const now  = summarize(yesterday)
const prev = summarize(twoDaysAgo)

// ─── Resumen general ──────────────────────────────────────────────────────────

console.log('═'.repeat(60))
console.log('AYER vs. PROMEDIO 3 DÍAS')
console.log('═'.repeat(60))
console.log(`  Gasto:       $${now.spend.toFixed(2)}   ${arrow(delta(now, prev, 'spend'))}`)
console.log(`  Impresiones: ${now.impressions.toLocaleString()}   ${arrow(delta(now, prev, 'impressions'))}`)
console.log(`  Clicks:      ${now.clicks}   ${arrow(delta(now, prev, 'clicks'))}`)
console.log(`  CTR:         ${now.ctr.toFixed(2)}%   ${arrow(delta(now, prev, 'ctr'))}`)
console.log(`  CPM:         $${now.cpm.toFixed(2)}   ${arrow(delta(now, { cpm: prev.cpm }, 'cpm'))}`)
console.log(`  Compras:     ${now.purchases}   ${arrow(delta(now, prev, 'purchases'))}`)
if (now.purchases > 0) {
  console.log(`  CPA:         $${(now.spend / now.purchases).toFixed(2)}`)
}
console.log(`  Ads activos: ${now.activeAds}`)

// ─── Top ads de ayer ──────────────────────────────────────────────────────────

const topBySpend = [...yesterday]
  .sort((a, b) => parseFloat(b.spend) - parseFloat(a.spend))
  .slice(0, 5)

if (topBySpend.length) {
  console.log('\n─── TOP 5 ADS AYER (por gasto) ───')
  topBySpend.forEach(r => {
    const p   = purchases(r)
    const c   = cpa(r)
    const tag = p > 0 ? `🟢 ${p} compras · CPA $${c}` : `⚪ 0 compras`
    console.log(`  ${r.ad_name?.slice(0, 35).padEnd(35)} | $${parseFloat(r.spend).toFixed(2)} | CTR ${parseFloat(r.ctr).toFixed(2)}% | ${tag}`)
  })
}

// ─── Alertas ──────────────────────────────────────────────────────────────────

const alerts = []

if (now.purchases === 0 && now.spend > 5)
  alerts.push('🔴 ALERTA: Gasto sin ninguna compra ayer')

if (parseFloat(delta(now, prev, 'ctr')) < -20)
  alerts.push('🔴 ALERTA: CTR cayó más del 20% vs. promedio')

if (parseFloat(delta(now, prev, 'spend')) < -50)
  alerts.push('🟡 AVISO: Gasto cayó más del 50% — ¿ads pausados?')

if (now.purchases > 0 && (now.spend / now.purchases) > 18)
  alerts.push(`🟡 AVISO: CPA $${(now.spend / now.purchases).toFixed(2)} — por encima del límite ($18)`)

if (now.cpm > 8)
  alerts.push(`🟡 AVISO: CPM alto ($${now.cpm.toFixed(2)}) — auditoría de creativos recomendada`)

if (alerts.length) {
  console.log('\n─── ALERTAS ───')
  alerts.forEach(a => console.log(' ', a))
} else {
  console.log('\n✅ Todo dentro de parámetros normales')
}

// ─── Guardar reporte ──────────────────────────────────────────────────────────

mkdirSync('campaigns/reports', { recursive: true })
const today    = new Date().toISOString().slice(0, 10)
const report   = { date: today, now, prev, alerts, topAds: topBySpend }
const outPath  = `campaigns/reports/monitor-${today}.json`
writeFileSync(outPath, JSON.stringify(report, null, 2))

console.log(`\n📁 Reporte guardado: ${outPath}`)
console.log('─'.repeat(60))
