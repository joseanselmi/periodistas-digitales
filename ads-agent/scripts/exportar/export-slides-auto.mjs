/**
 * export-slides-auto.mjs — Exporta slides de cualquier semana automáticamente
 * Lee pie-de-foto.txt existente. Detecta la subcarpeta por nombre del HTML.
 * Uso: node scripts/exportar/export-slides-auto.mjs carousels/publicados/semana-19-05
 */

import puppeteer from 'puppeteer'
import { readdirSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { resolve, join, basename } from 'path'

const folder    = process.argv[2]
if (!folder) { console.error('Uso: node scripts/exportar/export-slides-auto.mjs carousels/publicados/semana-XX-XX'); process.exit(1) }

const absFolder = resolve(folder)
const outRoot   = join(absFolder, 'para-subir')

// Mapeo: palabra clave en el nombre del HTML → prefijo de subcarpeta
const DAY_MAP = {
  lunes:    '1-LUNES',
  martes:   '2-MARTES',
  miercoles:'3-MIERCOLES',
  miércoles:'3-MIERCOLES',
  jueves:   '4-JUEVES',
  viernes:  '5-VIERNES',
  sabado:   '6-SABADO',
  sábado:   '6-SABADO',
  domingo:  '7-DOMINGO',
}

function findSubfolder(name) {
  const lower = name.toLowerCase()
  for (const [key, prefix] of Object.entries(DAY_MAP)) {
    if (lower.includes(key)) {
      // Buscar la subcarpeta real en para-subir que empiece con ese prefijo
      if (existsSync(outRoot)) {
        const match = readdirSync(outRoot).find(d => d.startsWith(prefix))
        if (match) return match
      }
      return prefix
    }
  }
  return name
}

const htmlFiles = readdirSync(absFolder).filter(f => f.endsWith('.html')).sort()

console.log(`\n📦 EXPORTANDO SLIDES — ${folder}`)
console.log(`   ${htmlFiles.length} carruseles encontrados\n`)

const browser = await puppeteer.launch({ headless: true })

for (const file of htmlFiles) {
  const name     = basename(file, '.html')
  const subdir   = findSubfolder(name)
  const pubDir   = join(outRoot, subdir)

  mkdirSync(pubDir, { recursive: true })

  // Leer caption existente (ya creado por Valentina)
  const captionFile = join(pubDir, 'pie-de-foto.txt')
  if (!existsSync(captionFile)) {
    console.log(`  ⚠️  Sin pie-de-foto.txt en ${subdir} — saltando`)
    continue
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
  const url = 'file:///' + join(absFolder, file).replace(/\\/g, '/')
  await page.goto(url, { waitUntil: 'networkidle0' })

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length)
  process.stdout.write(`  ${subdir} (${total} slides): `)

  for (let i = 0; i < total; i++) {
    await page.evaluate(idx => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx))
    }, i)
    await new Promise(r => setTimeout(r, 300))

    const num = String(i + 1).padStart(2, '0')
    await page.screenshot({
      path: join(pubDir, `slide-${num}.jpg`),
      type: 'jpeg', quality: 95,
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    })
    process.stdout.write(`${i + 1} `)
  }

  await page.close()
  console.log('✅')
}

await browser.close()
console.log('\n✅ Export completo.')
console.log('   Carpetas listas en:', outRoot)
