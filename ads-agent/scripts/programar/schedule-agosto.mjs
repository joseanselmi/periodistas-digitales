/**
 * schedule-agosto.mjs — Programa los 15 posts de agosto (1→15) en Facebook.
 * Uso: node --env-file=.env.local scripts/programar/schedule-agosto.mjs
 * Respeta el tope de Meta: si Meta rechaza por cola llena, lo reporta y sigue.
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'
if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

function toUnix(dateStr, hour = 8) {
  const utcHour = hour + 3 // ART (UTC-3) → UTC
  return Math.floor(new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`).getTime() / 1000)
}

const POSTS = [
  { folder: 'contenido/carousels/agosto-s1/para-subir/6-SABADO',    date: '2026-08-01', label: 'Sáb 01/08 — Texto: "el mes que viene sí"' },
  { folder: 'contenido/carousels/agosto-s1/para-subir/7-DOMINGO',   date: '2026-08-02', label: 'Dom 02/08 — Carrusel: 6 señales de agosto' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/1-LUNES',     date: '2026-08-03', label: 'Lun 03/08 — Carrusel: prompt temas locales' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/2-MARTES',    date: '2026-08-04', label: 'Mar 04/08 — Texto: "te rebotaron la nota"' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/3-MIERCOLES', date: '2026-08-05', label: 'Mié 05/08 — Carrusel: primer anunciante local' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/4-JUEVES',    date: '2026-08-06', label: 'Jue 06/08 — Texto: 3 primeros cobros (prueba social)' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/5-VIERNES',   date: '2026-08-07', label: 'Vie 07/08 — Carrusel VENTA: el Sistema ($27)' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/6-SABADO',    date: '2026-08-08', label: 'Sáb 08/08 — Texto: saber vs cobrar' },
  { folder: 'contenido/carousels/agosto-s2/para-subir/7-DOMINGO',   date: '2026-08-09', label: 'Dom 09/08 — Carrusel: IA y búsqueda' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/1-LUNES',     date: '2026-08-10', label: 'Lun 10/08 — Carrusel: prompt titulares' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/2-MARTES',    date: '2026-08-11', label: 'Mar 11/08 — Texto: "cuando me echen"' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/3-MIERCOLES', date: '2026-08-12', label: 'Mié 12/08 — Carrusel: producir el doble con IA' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/4-JUEVES',    date: '2026-08-13', label: 'Jue 13/08 — Texto: Paola (prueba social)' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/5-VIERNES',   date: '2026-08-14', label: 'Vie 14/08 — Carrusel VENTA: sin tecnología ($27)' },
  { folder: 'contenido/carousels/agosto-s3/para-subir/6-SABADO',    date: '2026-08-15', label: 'Sáb 15/08 — Texto: mitad de agosto' },
]

async function uploadPhoto(imagePath) {
  const form = new FormData()
  form.append('published', 'false')
  form.append('access_token', PAGE_TOKEN)
  form.append('source', new Blob([readFileSync(imagePath)], { type: 'image/jpeg' }), 'image.jpg')
  const data = await (await fetch(`${BASE}/${PAGE_ID}/photos`, { method: 'POST', body: form })).json()
  if (data.error) throw new Error(`Upload: ${data.error.message}`)
  return data.id
}

async function postFeed(message, photoIds, scheduledTs) {
  const body = new URLSearchParams()
  body.set('access_token', PAGE_TOKEN)
  body.set('message', message)
  if (photoIds.length) body.set('attached_media', JSON.stringify(photoIds.map(id => ({ media_fbid: id }))))
  body.set('published', 'false')
  body.set('scheduled_publish_time', String(scheduledTs))
  const data = await (await fetch(`${BASE}/${PAGE_ID}/feed`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })).json()
  if (data.error) throw new Error(data.error.message)
  return data.id
}

console.log(`\n📅 PROGRAMANDO AGOSTO 1→15 — página ${PAGE_ID}\n`)
const results = []
for (const post of POSTS) {
  const abs = resolve(post.folder)
  const captionFile = join(abs, 'pie-de-foto.txt')
  if (!existsSync(captionFile)) { console.log(`⚪ ${post.label} — sin caption`); results.push({ ...post, status: 'SKIP' }); continue }
  const caption = readFileSync(captionFile, 'utf-8').trim()
  process.stdout.write(`  ${post.label}... `)
  try {
    const images = readdirSync(abs).filter(f => /slide-\d+\.(jpg|jpeg|png)$/i.test(f)).sort().map(f => join(abs, f))
    const photoIds = []
    if (images.length) { process.stdout.write(`(${images.length} slides) `); for (const img of images) photoIds.push(await uploadPhoto(img)) }
    const id = await postFeed(caption, photoIds, toUnix(post.date, 8))
    console.log(`📅 ${post.date} 8:00 ART — ${id}`)
    results.push({ ...post, status: 'OK', id })
  } catch (e) {
    console.log(`❌ ${e.message}`)
    results.push({ ...post, status: 'ERROR', error: e.message })
  }
}
console.log('\n' + '─'.repeat(60))
console.log(`✅ Programados: ${results.filter(r => r.status === 'OK').length}`)
console.log(`🔴 Errores:    ${results.filter(r => r.status === 'ERROR').length}`)
const errs = results.filter(r => r.status === 'ERROR')
if (errs.length) errs.forEach(e => console.log(`   ${e.label}: ${e.error}`))
