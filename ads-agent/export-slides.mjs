/**
 * export-slides.mjs — Exporta cada carrusel como carpeta lista para subir a Facebook
 * Estructura: LUNES-prompt-maestro / slide-01.jpg + pie-de-foto.txt
 * Uso: node export-slides.mjs carousels/semana-12-05
 */

import puppeteer from 'puppeteer'
import { readdirSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, join, basename } from 'path'

const CAPTIONS = {
  'lunes-prompt-maestro': `El prompt que uso para estructurar cualquier nota periodística.

Uno solo. Configurado una vez. Funciona para breaking news, entrevistas, investigación, economía local.

Copialo del slide 2 y 3. Reemplazá los corchetes con tu información.

En 30 segundos tenés estructura. El criterio, las fuentes y el olfato siguen siendo tuyos.

¿Lo vas a usar esta semana? 👇`,

  'miercoles-whatsapp': `Los canales de WhatsApp de noticias crecieron 340% en LATAM en 2025.

Y la mayoría de periodistas independientes todavía no tiene uno.

Tasa de apertura del 70% vs. 22% del email. Sin algoritmo que te castigue. Todos tus suscriptores ven todo lo que publicás.

En el carrusel: por qué funciona y cómo arrancarlo hoy.

¿Ya tenés canal de WhatsApp para tu medio? 👇`,

  'viernes-primer-anunciante': `El error más común del periodista que quiere monetizar su medio: le vende publicidad al negocio local.

El que cierra el trato le vende audiencia.

En este carrusel: a quién llamar, qué decirle exactamente, y cuánto cobrar para empezar.

Sin experiencia en ventas. Sin agencia. Sin inversión.

¿Cuánto creés que vale un anunciante local en tu ciudad? Dejá tu número en comentarios 👇`,

  'domingo-google-noticias': `Google ya no manda tráfico a las notas. Las resume con IA y el lector no hace clic.

Lo que cambia para tu medio digital y lo que podés hacer ahora mismo para no depender de ningún algoritmo.

Esto lo tienen que ver todos los periodistas que están construyendo algo propio.

¿Ya lo notaste en tu tráfico? 👇`,
}

const DAY_PREFIX = {
  'lunes-prompt-maestro':      '1-LUNES',
  'miercoles-whatsapp':        '3-MIERCOLES',
  'viernes-primer-anunciante': '5-VIERNES',
  'domingo-google-noticias':   '7-DOMINGO',
}

const folder    = process.argv[2] || 'carousels/semana-12-05'
const absFolder = resolve(folder)
const outRoot   = join(absFolder, 'para-subir')
mkdirSync(outRoot, { recursive: true })

const files = readdirSync(absFolder)
  .filter(f => f.endsWith('.html'))
  .sort()

console.log(`\n📦 EXPORTANDO PUBLICACIONES`)
console.log(`   Destino: ${outRoot}\n`)

const browser = await puppeteer.launch({ headless: true })

for (const file of files) {
  const name    = basename(file, '.html')
  const prefix  = DAY_PREFIX[name] || name
  const caption = CAPTIONS[name] || ''
  const pubDir  = join(outRoot, prefix)
  mkdirSync(pubDir, { recursive: true })

  // Guardar pie de foto
  writeFileSync(join(pubDir, 'pie-de-foto.txt'), caption, 'utf-8')

  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 })
  const url = 'file:///' + join(absFolder, file).replace(/\\/g, '/')
  await page.goto(url, { waitUntil: 'networkidle0' })

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length)
  process.stdout.write(`  ${prefix} (${total} slides): `)

  for (let i = 0; i < total; i++) {
    await page.evaluate(idx => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx))
    }, i)
    await new Promise(r => setTimeout(r, 250))

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

console.log('\n✅ Listo. Carpeta: para-subir/')
console.log('   Cada subcarpeta = una publicación de Facebook')
console.log('   Contiene: slide-01.jpg, slide-02.jpg... + pie-de-foto.txt')
