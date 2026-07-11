/**
 * comprimir-img-landing.mjs — Convierte a WebP las imágenes pesadas de la landing del curso.
 * Deja los .png originales intactos (solo agrega los .webp). Después hay que
 * actualizar las referencias en el HTML de .png → .webp.
 * Uso: node comprimir-img-landing.mjs
 */
import sharp from 'sharp'
import { statSync } from 'fs'
import { join } from 'path'

const IMGDIR = join('..', 'sistema-ingresos', 'img')
const ROOT = join('..', 'sistema-ingresos')

// [archivo, carpeta, maxAncho, calidad]
const TARGETS = [
  ['sistema-ingresos-problema-split.png', IMGDIR, 1280, 82],
  ['sistema-ingresos-mecanismo-stack.png', IMGDIR, 1200, 82],
  ['sistema-ingresos-bono-1-templates-ig.png', IMGDIR, 1200, 82],
  ['sistema-ingresos-bono-2-guia-ia.png', IMGDIR, 1200, 82],
  ['sistema-ingresos-bono-3-leadr-laptop.png', IMGDIR, 1000, 82],
  ['sistema-ingresos-instructor-foto.png', IMGDIR, 1280, 82],
  ['sistema-ingresos-checkout.png', IMGDIR, 1100, 82],
  ['logo-periodistas-digitales.png', ROOT, 512, 88],
]

const kb = f => (statSync(f).size / 1024)
let antes = 0, despues = 0

for (const [file, dir, maxW, q] of TARGETS) {
  const src = join(dir, file)
  const out = src.replace(/\.png$/i, '.webp')
  const sizeBefore = kb(src)
  await sharp(src)
    .resize({ width: maxW, withoutEnlargement: true })
    .webp({ quality: q, effort: 6 })
    .toFile(out)
  const sizeAfter = kb(out)
  antes += sizeBefore; despues += sizeAfter
  const pct = (100 - (sizeAfter / sizeBefore) * 100).toFixed(0)
  console.log(`${sizeBefore.toFixed(0).padStart(5)}KB → ${sizeAfter.toFixed(0).padStart(5)}KB  (-${pct}%)  ${file.replace(/\.png$/, '.webp')}`)
}

console.log('-'.repeat(60))
console.log(`TOTAL: ${(antes / 1024).toFixed(2)}MB → ${(despues / 1024).toFixed(2)}MB  (-${(100 - despues / antes * 100).toFixed(0)}%)`)
console.log('\nAhora actualizar las referencias .png → .webp en el HTML.')
