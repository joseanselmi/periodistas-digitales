/**
 * export-stories.mjs — Exporta las stories verticales a JPG 1080×1920.
 * Uso: node export-stories.mjs [carpeta]   (default: carousels/muro-stories)
 */
import puppeteer from 'puppeteer'
import { readdirSync } from 'fs'
import { resolve, join, basename } from 'path'

const folder = process.argv[2] || 'carousels/muro-stories'
const abs = resolve(folder)
const files = readdirSync(abs).filter(f => f.endsWith('.html')).sort()

console.log(`\n📱 EXPORTANDO STORIES — ${folder} (${files.length})\n`)
const browser = await puppeteer.launch({ headless: true })

for (const file of files) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 })
  await page.goto('file:///' + join(abs, file).replace(/\\/g, '/'), { waitUntil: 'networkidle0' })
  const out = join(abs, `${basename(file, '.html')}.jpg`)
  await page.screenshot({ path: out, type: 'jpeg', quality: 92 })
  await page.close()
  console.log(`  ✅ ${basename(out)}`)
}

await browser.close()
console.log(`\n✅ Listo. Publicar con: node --env-file=.env.local post-story.mjs [YYYY-MM-DD]`)
