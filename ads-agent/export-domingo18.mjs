import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'

const outDir = 'carousels/semana-12-05/para-subir/9-DOMINGO-18'
mkdirSync(outDir, { recursive: true })

const caption = `NotebookLM de Google lee 847 páginas de documentos y te dice dónde está la irregularidad. En menos de 3 minutos.

Es gratuita, funciona con PDFs, links y audios, y cita exactamente de dónde sacó cada respuesta.

Los periodistas de investigación ya la están usando para cruzar fuentes, preparar entrevistas y encontrar lo que nadie vio.

En este carrusel: 4 usos concretos para tu trabajo + cómo empezar hoy.

¿La conocías? 👇`

writeFileSync(join(outDir, 'pie-de-foto.txt'), caption)

const htmlPath = 'file:///' + resolve('carousels/semana-12-05/domingo18-notebooklm.html').replace(/\\/g, '/')

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
await page.goto(htmlPath, { waitUntil: 'networkidle0' })

const total = await page.evaluate(() => document.querySelectorAll('.slide').length)
process.stdout.write(`Exportando ${total} slides: `)

for (let i = 0; i < total; i++) {
  await page.evaluate(idx => {
    document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx))
  }, i)
  await new Promise(r => setTimeout(r, 300))
  await page.screenshot({
    path: join(outDir, `slide-0${i + 1}.jpg`),
    type: 'jpeg', quality: 95,
    clip: { x: 0, y: 0, width: 1080, height: 1080 }
  })
  process.stdout.write(`${i + 1} `)
}

await browser.close()
console.log('✅ Listo en', outDir)
