/**
 * export-pdf.mjs — Convierte un HTML de guía/ebook a PDF, con QA visual previo
 *
 * Uso:
 *   node scripts/exportar/export-pdf.mjs <ruta.html> [salida.pdf]
 *
 * Requisitos del HTML (ver skill pdf-creator en .claude/skills/pdf-creator):
 * - Cada página del PDF = un <section class="page"> o <section class="cover">
 * - CSS: page-break-after:always entre secciones dentro de @media print
 * - CSS: page-break-inside:avoid en cajas/tarjetas (code-box, callout, cta-box, etc.)
 * - Fuentes vía <link> de Google Fonts en <head> (el script espera a que carguen)
 *
 * Antes de mandar el PDF a nadie: revisar las capturas en la carpeta qa-<nombre>/
 */

import puppeteer from 'puppeteer'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname, basename, join } from 'path'

const inputArg  = process.argv[2]
const outputArg = process.argv[3]

if (!inputArg) {
  console.error('❌ Uso: node scripts/exportar/export-pdf.mjs <ruta.html> [salida.pdf]')
  process.exit(1)
}

const htmlPath = resolve(inputArg)
const pdfPath  = resolve(outputArg || htmlPath.replace(/\.html?$/i, '.pdf'))
const qaDir    = join(dirname(htmlPath), `qa-${basename(htmlPath, '.html')}`)

if (!existsSync(htmlPath)) {
  console.error(`❌ No existe el archivo: ${htmlPath}`)
  process.exit(1)
}

console.log(`\n📄 EXPORT PDF — ${basename(htmlPath)}`)

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 960, height: 1200, deviceScaleFactor: 2 })

await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' })

// Esperar que carguen las fuentes (Google Fonts) antes de capturar o exportar
await page.evaluate(async () => { await document.fonts.ready })

const sections = await page.$$('section.page, section.cover')
console.log(`   ${sections.length} secciones detectadas`)

if (sections.length === 0) {
  console.warn('⚠️  No se encontraron <section class="page"> ni <section class="cover"> — revisá la estructura del HTML antes de seguir.')
}

// ── QA: una captura por sección, ANTES de generar el PDF final ──
mkdirSync(qaDir, { recursive: true })
for (let i = 0; i < sections.length; i++) {
  const num = String(i + 1).padStart(2, '0')
  await sections[i].screenshot({ path: join(qaDir, `pagina-${num}.png`) })
}
console.log(`   ✅ Capturas de QA en: ${qaDir}`)
console.log('   👉 Revisalas antes de seguir — page-break, overflow de cajas, fuentes sin cargar.')

// ── PDF final ──
await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
})

await browser.close()

console.log(`\n✅ PDF generado: ${pdfPath}`)
