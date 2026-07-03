/**
 * meta-spend-sync.mjs — Sincroniza el GASTO y métricas de Meta Ads hacia la tabla
 * `campanas` (Supabase periodistas-marketing). Es el complemento de hotmart-sync.mjs:
 * ese trae las VENTAS, este trae el GASTO — juntos permiten CPA/ROAS reales por anuncio.
 *
 * PARA QUÉ:
 *  - La tabla `campanas` guarda el gasto y métricas de Meta (no salen de la base). Este
 *    script las trae de la API de Meta y actualiza cada fila por su `src` (matrícula
 *    adN-angulo). Las VENTAS/CPA/ROAS se calculan cruzando `ventas.src = campanas.src`.
 *  - Solo ACTUALIZA fichas que ya existen en `campanas` (las crea Mateo en
 *    registro-anuncios.md). Si un anuncio de Meta no tiene ficha, lo reporta para que
 *    Mateo la agregue — no la inventa.
 *
 * CÓMO MATCHEA anuncio de Meta → fila de `campanas`:
 *  Extrae la matrícula (`adN-angulo`) del nombre del CONJUNTO o del ANUNCIO en Meta
 *  (el sistema de Mateo la pone en ambos, ej. "ad1-fomo · 30-55 intereses"). Aunque el
 *  anuncio todavía se llame "Nuevo anuncio de Ventas", el conjunto suele tener la matrícula.
 *
 * CREDENCIALES (las genera Jose una sola vez — pegar en ads-agent/.env.local):
 *   META_ACCESS_TOKEN=...       ← token con permiso `ads_read` (System User de Business
 *                                  Manager, no vence; o token de usuario con ads_read).
 *   META_AD_ACCOUNT_ID=act_123  ← ID de la cuenta publicitaria (con o sin "act_").
 *   SUPABASE_URL=https://wxyimqkjlwfncvzozpjy.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=...   (service_role; escribe saltando RLS)
 *
 * USO:
 *   node meta-spend-sync.mjs                 → actualiza el gasto de todas las fichas
 *   node meta-spend-sync.mjs --dry-run       → solo reporta lo que haría, no escribe
 *   node meta-spend-sync.mjs --preset last_30d   → ventana (default maximum = lifetime)
 *
 * NOTA: construido contra la Marketing API v21.0 (mismo patrón que fetch-meta.mjs).
 * La primera corrida con credenciales reales confirma el matcheo de nombres.
 */

import dotenv from 'dotenv'
dotenv.config({ path: new URL('./.env.local', import.meta.url) })

// ─── Config ─────────────────────────────────────────────────────────────────
const TOKEN       = (process.env.META_ACCESS_TOKEN || '').trim()
const ACCOUNT     = (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^act_/, '')
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://wxyimqkjlwfncvzozpjy.supabase.co').trim().replace(/\/$/, '')
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const API = 'https://graph.facebook.com/v21.0'

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const PRESET = (args.includes('--preset') ? args[args.indexOf('--preset') + 1] : 'maximum')

function fail(msg) { console.error('\n❌ ' + msg + '\n'); process.exit(1) }
if (!TOKEN || !ACCOUNT) fail('Faltan META_ACCESS_TOKEN (con ads_read) y/o META_AD_ACCOUNT_ID en ads-agent/.env.local')
if (!DRY && !SUPABASE_KEY) fail('Falta SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (o usá --dry-run)')

// La matrícula adN-angulo dentro de un nombre de Meta ("ad1-fomo · 30-55 intereses").
const MATRICULA = /(ad\d+-[a-z0-9-]+?)(?=\s|·|$)/i
function extraerSrc(...nombres) {
  for (const n of nombres) {
    const m = String(n || '').match(MATRICULA)
    if (m) return m[1].toLowerCase().replace(/-+$/, '')
  }
  return null
}

async function fetchInsights() {
  const url = new URL(`${API}/act_${ACCOUNT}/insights`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('level', 'ad')
  url.searchParams.set('date_preset', PRESET)
  url.searchParams.set('limit', '500')
  url.searchParams.set('fields', [
    'adset_name', 'ad_name', 'spend', 'impressions', 'clicks', 'reach', 'ctr', 'frequency',
  ].join(','))
  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.error) fail(`Meta API: ${data.error.message} (code ${data.error.code}). ¿El token tiene ads_read y acceso a act_${ACCOUNT}?`)
  return data.data || []
}

// Agrupa las filas por matrícula src (varios anuncios pueden compartir conjunto/src).
function agruparPorSrc(rows) {
  const g = {}
  for (const r of rows) {
    const src = extraerSrc(r.adset_name, r.ad_name)
    if (!src) continue
    const a = (g[src] = g[src] || { src, spend: 0, impressions: 0, clicks: 0, reach: 0 })
    a.spend += parseFloat(r.spend || 0)
    a.impressions += parseInt(r.impressions || 0)
    a.clicks += parseInt(r.clicks || 0)
    a.reach += parseInt(r.reach || 0)
  }
  return Object.values(g).map(a => ({
    ...a,
    ctr: a.impressions > 0 ? +(a.clicks / a.impressions * 100).toFixed(2) : null,
    frecuencia: a.reach > 0 ? +(a.impressions / a.reach).toFixed(2) : null,
  }))
}

async function patchCampana(src, campos) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/campanas?src=eq.${encodeURIComponent(src)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(campos),
  })
  const rows = await res.json().catch(() => [])
  if (!res.ok) { console.error(`  ⚠️  ${src}: HTTP ${res.status} ${JSON.stringify(rows)}`); return 0 }
  return Array.isArray(rows) ? rows.length : 0
}

// ─── Main ─────────────────────────────────────────────────────────────────
console.log(`\n📡 META SPEND SYNC → campanas  (cuenta act_${ACCOUNT}, ventana ${PRESET})${DRY ? '  [DRY-RUN]' : ''}\n`)

const rows = await fetchInsights()
const grupos = agruparPorSrc(rows)
if (grupos.length === 0) {
  console.log('  No se encontró ninguna matrícula adN-angulo en los nombres de Meta.')
  console.log('  Revisá que el conjunto/anuncio tenga la matrícula (ej. "ad1-fomo · 30-55 intereses").')
  process.exit(0)
}

const hoy = new Date().toISOString().slice(0, 10)
let actualizadas = 0
const sinFicha = []

for (const g of grupos) {
  const campos = {
    gasto_usd: +g.spend.toFixed(2),
    impresiones: g.impressions,
    clics: g.clicks,
    ctr: g.ctr,
    frecuencia: g.frecuencia,
    ultimo_chequeo_en: hoy,
  }
  console.log(`  ${g.src.padEnd(16)} gasto $${campos.gasto_usd}  ·  ${g.impressions} impr  ·  CTR ${g.ctr ?? '—'}%  ·  freq ${g.frecuencia ?? '—'}`)
  if (DRY) continue
  const n = await patchCampana(g.src, campos)
  if (n > 0) actualizadas++
  else sinFicha.push(g.src)
}

console.log('')
if (DRY) {
  console.log(`  DRY-RUN: ${grupos.length} anuncios detectados. Corré sin --dry-run para escribir en campanas.`)
} else {
  console.log(`  ✅ ${actualizadas} ficha(s) de campanas actualizadas.`)
  if (sinFicha.length) {
    console.log(`  ⚠️  Sin ficha en campanas (Mateo debería registrarlas en registro-anuncios.md): ${sinFicha.join(', ')}`)
  }
}
