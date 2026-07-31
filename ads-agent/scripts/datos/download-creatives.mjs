/**
 * download-creatives.mjs — Descarga las imágenes y videos reales de los anuncios de Meta Ads
 * Uso:
 *   node scripts/datos/download-creatives.mjs                 (todos los anuncios, activos y pausados)
 *   node scripts/datos/download-creatives.mjs --solo-activos   (solo effective_status === 'ACTIVE')
 *
 * Variables requeridas: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID
 * Guarda en: creatives/<fecha>/<ad_id>__<nombre>.{jpg|mp4}
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const TOKEN      = process.env.META_ACCESS_TOKEN
const AD_ACCOUNT = process.env.META_AD_ACCOUNT_ID?.replace('act_', '')
const API_VERSION = 'v21.0'
const BASE = `https://graph.facebook.com/${API_VERSION}`
const SOLO_ACTIVOS = process.argv.includes('--solo-activos')

if (!TOKEN || !AD_ACCOUNT) {
  console.error('\n❌ Faltan variables de entorno: META_ACCESS_TOKEN, META_AD_ACCOUNT_ID')
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
    if (!data.paging?.next) break
  } while (cursor)
  return results
}

function safeName(str) {
  return (str || 'sin-nombre').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

async function descargarArchivo(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} descargando ${url}`)
  const buffer = await res.arrayBuffer()
  writeFileSync(destPath, Buffer.from(buffer))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📥 META ADS — DESCARGA DE CREATIVOS')
console.log(`   Account: act_${AD_ACCOUNT}`)
console.log(`   Filtro: ${SOLO_ACTIVOS ? 'solo activos' : 'todos'}\n`)

console.log('Obteniendo anuncios...')
const ads = await paginate(`/act_${AD_ACCOUNT}/ads`, {
  fields: [
    'id', 'name', 'effective_status',
    'creative{id,name,image_url,video_id,thumbnail_url}',
  ].join(','),
})

const objetivo = SOLO_ACTIVOS ? ads.filter(a => a.effective_status === 'ACTIVE') : ads
console.log(`   ${objetivo.length} anuncios a procesar\n`)

const today = new Date().toISOString().slice(0, 10)
const outDir = join('creatives', today)
mkdirSync(outDir, { recursive: true })

let descargadas = 0
let errores = 0
const manifest = []

for (const ad of objetivo) {
  const creative = ad.creative
  if (!creative) { console.log(`  ⚠️  ${ad.name} — sin creative, salteado`); continue }

  const base = `${ad.id}__${safeName(ad.name)}`

  try {
    if (creative.image_url) {
      const dest = join(outDir, `${base}.jpg`)
      await descargarArchivo(creative.image_url, dest)
      console.log(`  ✅ [imagen] ${ad.name} → ${dest}`)
      manifest.push({ ad_id: ad.id, name: ad.name, type: 'image', path: dest })
      descargadas++
    } else if (creative.video_id) {
      // El video real requiere una segunda llamada para obtener la URL de source descargable
      const videoData = await api(`/${creative.video_id}`, { fields: 'source,thumbnails' })
      if (videoData.source) {
        const dest = join(outDir, `${base}.mp4`)
        await descargarArchivo(videoData.source, dest)
        console.log(`  ✅ [video] ${ad.name} → ${dest}`)
        manifest.push({ ad_id: ad.id, name: ad.name, type: 'video', path: dest })
        descargadas++
      } else if (creative.thumbnail_url) {
        const dest = join(outDir, `${base}__thumbnail.jpg`)
        await descargarArchivo(creative.thumbnail_url, dest)
        console.log(`  ⚠️  [solo thumbnail] ${ad.name} → ${dest} (no se pudo obtener el video fuente)`)
        manifest.push({ ad_id: ad.id, name: ad.name, type: 'thumbnail-only', path: dest })
        descargadas++
      } else {
        console.log(`  ⚠️  ${ad.name} — video sin source ni thumbnail accesible`)
      }
    } else {
      console.log(`  ⚠️  ${ad.name} — creative sin imagen ni video (puede ser asset_feed_spec dinámico)`)
    }
  } catch (err) {
    console.log(`  ❌ ${ad.name} — ${err.message}`)
    errores++
  }
}

writeFileSync(join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2))

console.log(`\n✅ Listo: ${descargadas} archivos descargados, ${errores} errores`)
console.log(`📁 Carpeta: ${outDir}`)
