/**
 * review.mjs — Agente de revisión de anuncios
 * Uso: node review.mjs campaigns/2026-05-08/config.json
 */

import { readFileSync, writeFileSync } from 'fs'
import { reviewAd, printReview } from './lib/reviewer.mjs'

const configPath = process.argv[2]
if (!configPath) {
  console.error('Uso: node review.mjs <path/to/config.json>')
  process.exit(1)
}

const campaign = JSON.parse(readFileSync(configPath, 'utf-8'))

console.log(`\n🔍 ADS AGENT — Revisando campaña: ${campaign.name}`)
console.log(`   Fecha: ${campaign.date} | Presupuesto: $${campaign.dailyBudget}/día`)
console.log(`   ${campaign.ads.length} anuncios en cola\n`)

const results = []

for (const ad of campaign.ads) {
  const review = await reviewAd(ad)
  printReview(ad.adSet, ad.awarenessLevel, review)

  // Guardar review en la carpeta del ad
  const reviewPath = configPath.replace('config.json', `ads/${ad.id}/review.json`)
  try {
    writeFileSync(reviewPath, JSON.stringify({ ad, review }, null, 2))
  } catch {}

  results.push({
    id: ad.id,
    adSet: ad.adSet,
    veredicto: review.veredicto,
    score: review.scores.score_total,
    mejoras: review.mejoras_copy,
    nuevoPromptImagen: review.mejoras_imagen,
  })
}

console.log(`\n${'═'.repeat(60)}`)
console.log('RESUMEN CAMPAÑA')
console.log('═'.repeat(60))

const emoji = { PUBLICAR: '🟢', MEJORAR_COPY: '🟡', REGENERAR_IMAGEN: '🟠', RECHAZAR: '🔴' }
results.forEach(r => {
  console.log(`${emoji[r.veredicto]} ${r.adSet}: ${r.veredicto} (${r.score}/10)`)
})

const listos = results.filter(r => r.veredicto === 'PUBLICAR').length
const mejorarCopy = results.filter(r => r.veredicto === 'MEJORAR_COPY').length
const regenerar = results.filter(r => r.veredicto === 'REGENERAR_IMAGEN').length

console.log(`\n📋 ${listos} listos para publicar | ${mejorarCopy} requieren copy | ${regenerar} requieren imagen nueva`)

if (regenerar > 0) {
  console.log('\n🎨 Para regenerar imágenes: node generate.mjs campaigns/.../config.json --regen')
}
if (listos + mejorarCopy === results.length && listos > 0) {
  console.log('\n🚀 Para publicar: node publish.mjs campaigns/.../config.json')
}
