/**
 * fetch-ga4.mjs — Lee métricas por página de GA4 (Google Analytics Data API)
 * Propiedad: "Periodistas digitales" (curso Sistema de Ingresos Diarios, ID medición G-J7J27BYHF0)
 *
 * Uso (el ID ya vive en ads-agent/.env.local como GA4_PROPERTY_ID=544961227):
 *   node --env-file=.env.local scripts/datos/fetch-ga4.mjs             # informe por página, últimos 7 días
 *   node --env-file=.env.local scripts/datos/fetch-ga4.mjs --realtime  # usuarios activos ahora (30 min)
 *   node --env-file=.env.local scripts/datos/fetch-ga4.mjs --days=30   # otro rango
 *   node scripts/datos/fetch-ga4.mjs 544961227                         # o pasando el ID a mano
 *     --days=N      rango del informe estándar (default 7)
 *     --realtime    usuarios activos AHORA (últimos 30 min), por página
 *
 * Auth: cuenta de servicio ga4-lector@periodistas-analytics.iam.gserviceaccount.com
 *       con la llave en ads-agent/ga4-service-account.json (GITIGNORED — secreta).
 *       El robot debe estar agregado como "Lector" en la propiedad GA4.
 *
 * El ID de la propiedad está en GA4 → Administrar → Configuración de la propiedad.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Este script vive en scripts/datos/; la credencial esta en la raiz de ads-agent.
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const KEY_FILE = join(RAIZ, 'ga4-service-account.json')

// --- argumentos ---
const args = process.argv.slice(2)
const flags = Object.fromEntries(
  args.filter(a => a.startsWith('--')).map(a => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  })
)
const positional = args.filter(a => !a.startsWith('--'))
const PROPERTY_ID = (positional[0] || process.env.GA4_PROPERTY_ID || '').toString().replace(/\D/g, '')
const DAYS = parseInt(flags.days || '7', 10)
const REALTIME = !!flags.realtime

if (!existsSync(KEY_FILE)) {
  console.error(`\n❌ Falta la llave del robot: ${KEY_FILE}`)
  console.error('   (cuenta de servicio ga4-lector, gitignored)\n')
  process.exit(1)
}
if (!PROPERTY_ID) {
  console.error('\n❌ Falta el ID de la propiedad GA4.')
  console.error('   Uso: node scripts/datos/fetch-ga4.mjs <propertyId> [--days=7] [--realtime]')
  console.error('   O poné GA4_PROPERTY_ID en .env.local')
  console.error('   El ID está en GA4 → Administrar → Configuración de la propiedad.\n')
  process.exit(1)
}

const client = new BetaAnalyticsDataClient({ keyFilename: KEY_FILE })
const property = `properties/${PROPERTY_ID}`
const fmt = n => Number(n).toLocaleString('es-AR')

try {
  if (REALTIME) {
    console.log(`\n⏱️  GA4 Tiempo Real — usuarios activos ahora (propiedad ${PROPERTY_ID})\n`)
    const [res] = await client.runRealtimeReport({
      property,
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [{ name: 'activeUsers' }],
    })
    const rows = res.rows || []
    const total = rows.reduce((s, r) => s + Number(r.metricValues[0].value), 0)
    console.log(`   👥 Usuarios activos ahora: ${total}`)
    if (rows.length) {
      console.log('\n   Página                                             Activos')
      console.log('   ' + '-'.repeat(58))
      for (const r of rows) {
        const page = (r.dimensionValues[0].value || '(sin título)').slice(0, 48).padEnd(48)
        console.log(`   ${page} ${fmt(r.metricValues[0].value).padStart(7)}`)
      }
    } else {
      console.log('   (0 ahora mismo — abrí una página del sitio y volvé a correr)')
    }
    console.log('\n✅ Conexión API OK (Tiempo Real respondió).\n')
    process.exit(0)
  }

  // Informe estándar: métricas por página
  const startDate = `${DAYS}daysAgo`
  console.log(`\n📊 GA4 — métricas por página (${startDate} → today, propiedad ${PROPERTY_ID})\n`)
  const [res] = await client.runReport({
    property,
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50,
  })
  const rows = res.rows || []
  if (!rows.length) {
    console.log('   (0 filas) — la conexión FUNCIONA, pero GA4 todavía no procesó datos')
    console.log('   para este rango. Los informes estándar tardan 24-48 h la 1ª vez.')
    console.log(`   Para probar ahora:  node scripts/datos/fetch-ga4.mjs ${PROPERTY_ID} --realtime\n`)
    console.log('✅ Conexión API OK (respuesta vacía = sin datos aún, NO es error).\n')
    process.exit(0)
  }
  console.log('   Página                                        Vistas  Usuarios  Sesiones')
  console.log('   ' + '-'.repeat(72))
  for (const r of rows) {
    const path = (r.dimensionValues[0].value || '/').slice(0, 44).padEnd(44)
    const views = fmt(r.metricValues[0].value).padStart(7)
    const users = fmt(r.metricValues[1].value).padStart(8)
    const sess = fmt(r.metricValues[2].value).padStart(8)
    console.log(`   ${path} ${views} ${users} ${sess}`)
  }
  const totV = rows.reduce((s, r) => s + Number(r.metricValues[0].value), 0)
  console.log('   ' + '-'.repeat(72))
  console.log(`   TOTAL ${rows.length} páginas — ${fmt(totV)} vistas\n`)
  console.log('✅ Conexión API OK.\n')
} catch (e) {
  const msg = e?.details || e?.message || String(e)
  console.error('\n❌ Error llamando a GA4:')
  console.error('   ' + msg)
  if (/PERMISSION_DENIED|permission|403/i.test(msg)) {
    console.error('\n   → El robot ga4-lector todavía NO tiene acceso a la propiedad.')
    console.error('     GA4 → Administrar → Gestión de accesos a la propiedad → "+" →')
    console.error('     agregá ga4-lector@periodistas-analytics.iam.gserviceaccount.com como "Lector".')
  } else if (/NOT_FOUND|does not exist|property/i.test(msg)) {
    console.error('\n   → Revisá el ID de la propiedad (GA4 → Administrar → Configuración de la propiedad).')
  }
  console.error('')
  process.exit(1)
}
