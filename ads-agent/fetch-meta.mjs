/**
 * fetch-meta.mjs — Descarga todos los anuncios activos/pausados de Meta Ads
 * Uso: node fetch-meta.mjs
 * Variables requeridas: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const TOKEN = process.env.META_ACCESS_TOKEN
const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID?.replace('act_', '')
const API_VERSION = 'v21.0'
const BASE = `https://graph.facebook.com/${API_VERSION}`

if (!TOKEN || !AD_ACCOUNT) {
  console.error('\n❌ Faltan variables de entorno:')
  console.error('   META_ACCESS_TOKEN=<tu token>')
  console.error('   META_AD_ACCOUNT_ID=<ej: act_123456789 o solo 123456789>')
  process.exit(1)
}

async function api(path, params = {}) {
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('access_token', TOKEN)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API error en ${path}: ${data.error.message} (code ${data.error.code})`)
  }
  return data
}

async function paginate(path, params = {}) {
  const results = []
  let cursor = null

  do {
    const p = { ...params, limit: 100 }
    if (cursor) p.after = cursor

    const data = await api(path, p)
    results.push(...(data.data || []))
    cursor = data.paging?.cursors?.after
    const hasNext = !!data.paging?.next
    if (!hasNext) break
  } while (cursor)

  return results
}

// ─── Fetch campaigns ──────────────────────────────────────────────────────────
async function fetchCampaigns() {
  console.log('  Fetching campaigns...')
  return paginate(`/act_${AD_ACCOUNT}/campaigns`, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,buying_type',
  })
}

// ─── Fetch ad sets ────────────────────────────────────────────────────────────
async function fetchAdSets() {
  console.log('  Fetching ad sets...')
  return paginate(`/act_${AD_ACCOUNT}/adsets`, {
    fields: 'id,name,status,campaign_id,daily_budget,lifetime_budget,optimization_goal,billing_event,bid_amount,targeting,start_time,end_time',
  })
}

// ─── Fetch ads + creatives ────────────────────────────────────────────────────
async function fetchAds() {
  console.log('  Fetching ads + creatives...')
  return paginate(`/act_${AD_ACCOUNT}/ads`, {
    fields: [
      'id',
      'name',
      'status',
      'adset_id',
      'campaign_id',
      'effective_status',
      'created_time',
      'creative{id,name,body,title,image_url,image_hash,video_id,thumbnail_url,call_to_action_type,object_story_spec,asset_feed_spec}',
    ].join(','),
  })
}

// ─── Fetch insights (últimos 30 días) ─────────────────────────────────────────
async function fetchInsights() {
  console.log('  Fetching insights (histórico completo)...')
  const data = await api(`/act_${AD_ACCOUNT}/insights`, {
    fields: [
      'campaign_id',
      'campaign_name',
      'adset_id',
      'adset_name',
      'ad_id',
      'ad_name',
      'impressions',
      'clicks',
      'spend',
      'reach',
      'frequency',
      'ctr',
      'cpm',
      'cpp',
      'actions',
      'cost_per_action_type',
      'video_play_actions',
      'video_thruplay_watched_actions',
    ].join(','),
    level: 'ad',
    date_preset: 'maximum',
    limit: 500,
  })
  return data.data || []
}

// ─── Fetch account info ───────────────────────────────────────────────────────
async function fetchAccountInfo() {
  console.log('  Fetching account info...')
  return api(`/act_${AD_ACCOUNT}`, {
    fields: 'id,name,currency,timezone_name,account_status,spend_cap,amount_spent,balance',
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log('\n📡 META ADS FETCHER')
console.log(`   Account: act_${AD_ACCOUNT}`)
console.log(`   API: ${API_VERSION}\n`)

console.log('Descargando datos...')

const [account, campaigns, adsets, ads, insights] = await Promise.all([
  fetchAccountInfo(),
  fetchCampaigns(),
  fetchAdSets(),
  fetchAds(),
  fetchInsights(),
]).catch(err => {
  console.error('\n❌', err.message)
  process.exit(1)
})

// Indexar insights por ad_id para fácil lookup
const insightsByAdId = {}
for (const row of insights) {
  insightsByAdId[row.ad_id] = row
}

// Enriquecer ads con sus insights
const enrichedAds = ads.map(ad => ({
  ...ad,
  insights: insightsByAdId[ad.id] || null,
}))

// Agrupar ads por campaña para vista organizada
const campaignMap = {}
for (const c of campaigns) {
  campaignMap[c.id] = {
    ...c,
    adsets: adsets.filter(a => a.campaign_id === c.id),
    ads: enrichedAds.filter(a => a.campaign_id === c.id),
  }
}

const output = {
  exportedAt: new Date().toISOString(),
  account,
  summary: {
    totalCampaigns: campaigns.length,
    totalAdSets: adsets.length,
    totalAds: ads.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    activeAds: ads.filter(a => a.effective_status === 'ACTIVE').length,
  },
  campaigns: Object.values(campaignMap),
  rawInsights: insights,
}

// Guardar resultado
const today = new Date().toISOString().slice(0, 10)
mkdirSync('campaigns', { recursive: true })
const outPath = join('campaigns', `meta-export-${today}.json`)
writeFileSync(outPath, JSON.stringify(output, null, 2))

console.log('\n✅ Listo!')
console.log(`   ${output.summary.totalCampaigns} campañas | ${output.summary.totalAdSets} ad sets | ${output.summary.totalAds} anuncios`)
console.log(`   ${output.summary.activeCampaigns} campañas activas | ${output.summary.activeAds} anuncios activos`)
console.log(`\n📁 Guardado en: ${outPath}`)
console.log('\n🔍 Para que Claude analice: comparte el path del JSON')
