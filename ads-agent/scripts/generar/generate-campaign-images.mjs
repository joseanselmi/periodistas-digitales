/**
 * generate-campaign-images.mjs — Genera las imágenes de un config.json de campaña con Fal (Flux Pro)
 * Uso: node scripts/generar/generate-campaign-images.mjs campaigns/2026-06-21/config.json
 * Variables: FAL_API_KEY
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { generateImage, downloadImage } from '../../lib/fal.mjs'

const configPath = process.argv[2]
if (!configPath) {
  console.error('Uso: node scripts/generar/generate-campaign-images.mjs <ruta-config.json>')
  process.exit(1)
}

const config = JSON.parse(await import('fs').then(fs => fs.readFileSync(configPath, 'utf8')))
const outDir = join(dirname(configPath), 'images')
mkdirSync(outDir, { recursive: true })

function sizeFor(prompt) {
  return /9:16|vertical/i.test(prompt) ? 'portrait_16_9' : 'square_hd'
}

const manifest = []

for (const ad of config.adSets) {
  const size = sizeFor(ad.imagePrompt)
  console.log(`\n🎨 ${ad.id} (${size})...`)
  try {
    const url = await generateImage(ad.imagePrompt, { size })
    const buffer = await downloadImage(url)
    const dest = join(outDir, `${ad.id}.jpg`)
    writeFileSync(dest, buffer)
    console.log(`  ✅ ${dest}`)
    manifest.push({ id: ad.id, name: ad.name, path: dest, falUrl: url })
  } catch (err) {
    console.log(`  ❌ ${ad.id} — ${err.message}`)
    manifest.push({ id: ad.id, name: ad.name, error: err.message })
  }
}

writeFileSync(join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\n✅ Listo. Carpeta: ${outDir}`)
