/**
 * meta-embudo-diario-por-anuncio.mjs — Baja el EMBUDO de cada anuncio DÍA POR DÍA
 * (gasto, clics, vistas de la landing, pagos iniciados y compras) a la tabla
 * `meta_insights_diario` (Supabase periodistas-marketing).
 *
 * Solo mira los anuncios que llevan matrícula `adN-angulo` en el nombre del conjunto o
 * del anuncio. Lo que no tiene matrícula queda afuera — para ver la cuenta entera está
 * `meta-gasto-diario-toda-la-cuenta.mjs`.
 *
 * (Se llamaba `meta-daily-sync.mjs`. Renombrado el 07/08/2026 — ver el "historial de
 * nombres" en scripts/datos/README.md.)
 *
 * PARA QUÉ: la rutina autónoma de Mateo corre en la nube SIN salida a internet, así que no
 * puede pegarle a la API de Meta. Este sync corre donde SÍ hay internet (local o el cron de
 * Vercel) y deja los datos diarios en la base; Mateo los lee por MCP de Supabase. Es el
 * complemento "por día" de `meta-gasto-total-por-anuncio.mjs` (que trae el acumulado de
 * toda la vida del anuncio a `campanas`).
 *
 * OJO TIMEZONE: Meta reporta en el timezone de la CUENTA publicitaria (ARG). `time_increment=1`
 * devuelve un `date_start` por día ARG → la columna `fecha` ya queda en día argentino (que es
 * lo que Jose pidió: "Meta tiene horario de ARG").
 *
 * MÉTRICAS (las que pidió Jose): gasto, CTR de ENLACE (no el CTR total), pagos iniciados
 * (initiate checkout), ventas (purchase). Guarda los conteos crudos + impresiones + link_clicks
 * + landing_views para poder calcular en el reporte: % pago iniciado y % conversión a compra.
 *
 * CREDENCIALES (ads-agent/.env.local): META_ACCESS_TOKEN (ads_read), META_AD_ACCOUNT_ID,
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 *
 * USO (parado en ads-agent/):
 *   node scripts/datos/meta-embudo-diario-por-anuncio.mjs                 → últimos 30 días
 *   node scripts/datos/meta-embudo-diario-por-anuncio.mjs --preset last_7d
 *   node scripts/datos/meta-embudo-diario-por-anuncio.mjs --dry-run       → solo reporta
 */

import dotenv from 'dotenv'
dotenv.config({ path: new URL('../../.env.local', import.meta.url) })

const TOKEN        = (process.env.META_ACCESS_TOKEN || '').trim()
const ACCOUNT      = (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^act_/, '')
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://wxyimqkjlwfncvzozpjy.supabase.co').trim().replace(/\/$/, '')
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const API = 'https://graph.facebook.com/v21.0'

const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const PRESET = args.includes('--preset') ? args[args.indexOf('--preset') + 1] : 'last_30d'

function fail(m) { console.error('\n❌ ' + m + '\n'); process.exit(1) }
if (!TOKEN || !ACCOUNT) fail('Faltan META_ACCESS_TOKEN (ads_read) y/o META_AD_ACCOUNT_ID en ads-agent/.env.local')
if (!DRY && !SUPABASE_KEY) fail('Falta SUPABASE_SERVICE_ROLE_KEY en ads-agent/.env.local (o usá --dry-run)')

const MATRICULA = /(ad\d+-[a-z0-9-]+?)(?=\s|·|$)/i
function extraerSrc(...nombres) {
  for (const n of nombres) {
    const m = String(n || '').match(MATRICULA)
    if (m) return m[1].toLowerCase().replace(/-+$/, '')
  }
  return null
}

// UN action_type por metrica, nunca varios sumados.
//
// Meta devuelve el MISMO evento bajo varios nombres a la vez: el especifico del
// pixel (offsite_conversion.fb_pixel_purchase) y agregados que YA lo contienen
// (purchase, onsite_web_purchase, omni_purchase...). Sumarlos multiplica.
// Medido el 31/08/2026 sobre ad1-fomo del 27/08: initiate_checkout=5 y
// offsite_conversion.fb_pixel_initiate_checkout=5 son los mismos 5; purchase=1,
// offsite_conversion.fb_pixel_purchase=1 y onsite_web_purchase=1 son la misma 1.
// Este script los sumaba: pagos_iniciados salia x2 y compras x3 TODOS los dias.
// La huella era visible sin mirar el codigo: 31 dias seguidos de pagos_iniciados
// sin un solo numero impar.
//
// El dueno del dato es el evento del pixel, que es lo que manda la landing
// (navegador + CAPI, ya deduplicado por event_id). Si alguna vez hay ventas que
// NO pasen por el pixel, se agrega otra COLUMNA, no otro sumando en esta.
const sumAction = (actions, type) => {
  const a = (actions || []).find(x => x.action_type === type)
  return a ? Number(a.value || 0) : 0
}

async function fetchDaily() {
  const url = new URL(`${API}/act_${ACCOUNT}/insights`)
  url.searchParams.set('access_token', TOKEN)
  url.searchParams.set('level', 'ad')
  url.searchParams.set('time_increment', '1')
  url.searchParams.set('date_preset', PRESET)
  url.searchParams.set('limit', '500')
  url.searchParams.set('fields', ['adset_name', 'ad_name', 'spend', 'impressions', 'inline_link_clicks', 'actions', 'date_start'].join(','))
  const rows = []
  let next = url.toString()
  while (next) {
    const res = await fetch(next)
    const data = await res.json()
    if (data.error) fail(`Meta API: ${data.error.message} (code ${data.error.code})`)
    rows.push(...(data.data || []))
    next = data.paging && data.paging.next ? data.paging.next : null
  }
  return rows
}

// Agrupa por (fecha, src): varios anuncios pueden compartir conjunto/src.
function agrupar(rows) {
  const g = {}
  for (const r of rows) {
    const src = extraerSrc(r.adset_name, r.ad_name)
    if (!src) continue
    const key = `${r.date_start}|${src}`
    const a = (g[key] = g[key] || {
      fecha: r.date_start, src, spend_usd: 0, impresiones: 0, link_clicks: 0,
      landing_views: 0, pagos_iniciados: 0, compras: 0,
    })
    a.spend_usd += Number(r.spend || 0)
    a.impresiones += Number(r.impressions || 0)
    a.link_clicks += Number(r.inline_link_clicks || 0)
    a.landing_views += sumAction(r.actions, 'landing_page_view')
    a.pagos_iniciados += sumAction(r.actions, 'offsite_conversion.fb_pixel_initiate_checkout')
    a.compras += sumAction(r.actions, 'offsite_conversion.fb_pixel_purchase')
  }
  return Object.values(g).map(a => ({ ...a, spend_usd: +a.spend_usd.toFixed(2) }))
}

async function upsert(filas) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/meta_insights_diario?on_conflict=fecha,src`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(filas.map(f => ({ ...f, actualizado_en: new Date().toISOString() }))),
  })
  if (!res.ok) fail(`Supabase upsert HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`)
}

// ─── Main ───────────────────────────────────────────────────────────────────
console.log(`\n📅 EMBUDO DIARIO POR ANUNCIO → meta_insights_diario  (act_${ACCOUNT}, ${PRESET})${DRY ? '  [DRY-RUN]' : ''}\n`)
const rows = await fetchDaily()
const filas = agrupar(rows).sort((a, b) => (a.fecha < b.fecha ? 1 : -1) || (a.src < b.src ? -1 : 1))
if (!filas.length) { console.log('  No se encontró ninguna matrícula adN-angulo en Meta.'); process.exit(0) }

console.log('  fecha        src           gasto  linkclk  LPV  pagoIni  compras')
for (const f of filas) {
  console.log(`  ${f.fecha}  ${f.src.padEnd(12)} $${String(f.spend_usd).padStart(6)}  ${String(f.link_clicks).padStart(6)}  ${String(f.landing_views).padStart(3)}  ${String(f.pagos_iniciados).padStart(6)}  ${String(f.compras).padStart(6)}`)
}
console.log(`\n  ${filas.length} filas (fecha×anuncio).`)
if (DRY) { console.log('  DRY-RUN: no se escribió. Corré sin --dry-run para guardar.\n'); process.exit(0) }
await upsert(filas)
console.log(`  ✅ Upsert OK en meta_insights_diario.\n`)
