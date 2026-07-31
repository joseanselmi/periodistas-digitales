/**
 * schedule-jun-jul-resto.mjs — Programa los últimos 9 posts de julio que quedaron
 * afuera por el tope de ~29-30 scheduled posts simultáneos de la API de Facebook.
 * Correr de nuevo más adelante (cuando se hayan publicado posts anteriores y se
 * liberen lugares en la cola). Verificar primero cuántos lugares libres hay con:
 *   curl "https://graph.facebook.com/v21.0/$FB_PAGE_ID/scheduled_posts?fields=id&limit=100&access_token=$FB_PAGE_TOKEN"
 * Uso: node scripts/programar/schedule-jun-jul-resto.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'

if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

function toUnix(dateStr, hour = 8) {
  const utcHour = hour + 3
  const d = new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`)
  return Math.floor(d.getTime() / 1000)
}

const POSTS = [
  { folder: 'carousels/semana-20-07/para-subir/4-JUEVES',    date: '2026-07-23', hour: 8, label: 'Jue 23/07 — Caso Marta Villalba' },
  { folder: 'carousels/semana-20-07/para-subir/5-VIERNES',   date: '2026-07-24', hour: 8, label: 'Vie 24/07 — Garantía 7 días (venta)' },
  { folder: 'carousels/semana-20-07/para-subir/6-SABADO',    date: '2026-07-25', hour: 8, label: 'Sáb 25/07 — Costo de no intentarlo' },
  { folder: 'carousels/semana-20-07/para-subir/7-DOMINGO',   date: '2026-07-26', hour: 8, label: 'Dom 26/07 — Balance LATAM 2026' },
  { folder: 'carousels/semana-27-07/para-subir/1-LUNES',     date: '2026-07-27', hour: 8, label: 'Lun 27/07 — Media kit' },
  { folder: 'carousels/semana-27-07/para-subir/2-MARTES',    date: '2026-07-28', hour: 8, label: 'Mar 28/07 — Lo que te propusiste' },
  { folder: 'carousels/semana-27-07/para-subir/3-MIERCOLES', date: '2026-07-29', hour: 8, label: 'Mié 29/07 — Primer precio' },
  { folder: 'carousels/semana-27-07/para-subir/4-JUEVES',    date: '2026-07-30', hour: 8, label: 'Jue 30/07 — Mosaico 3 historias' },
  { folder: 'carousels/semana-27-07/para-subir/5-VIERNES',   date: '2026-07-31', hour: 8, label: 'Vie 31/07 — Cierre de julio (venta)' },
]

async function uploadPhoto(imagePath) {
  const imgBuffer = readFileSync(imagePath)
  const form = new FormData()
  form.append('published', 'false')
  form.append('access_token', PAGE_TOKEN)
  form.append('source', new Blob([imgBuffer], { type: 'image/jpeg' }), 'image.jpg')
  const res  = await fetch(`${BASE}/${PAGE_ID}/photos`, { method: 'POST', body: form })
  const data = await res.json()
  if (data.error) throw new Error(`Upload: ${data.error.message}`)
  return data.id
}

async function postFeed(message, photoIds = [], scheduledTs = null) {
  const body = new URLSearchParams()
  body.set('access_token', PAGE_TOKEN)
  body.set('message', message)
  if (photoIds.length > 0) body.set('attached_media', JSON.stringify(photoIds.map(id => ({ media_fbid: id }))))
  if (scheduledTs) { body.set('published', 'false'); body.set('scheduled_publish_time', String(scheduledTs)) }
  const res  = await fetch(`${BASE}/${PAGE_ID}/feed`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
  const data = await res.json()
  if (data.error) throw new Error(`Post: ${data.error.message}`)
  return data.id
}

function readCaption(folder) {
  const txtFile = join(folder, 'pie-de-foto.txt')
  if (existsSync(txtFile)) return readFileSync(txtFile, 'utf-8').trim()
  return ''
}

console.log(`\n📅 PROGRAMANDO EL RESTO DE JULIO 2026 (${POSTS.length} posts pendientes)\n`)

const results = []

for (const post of POSTS) {
  const absFolder = resolve(post.folder)
  if (!existsSync(absFolder)) { results.push({ label: post.label, status: 'SKIP', reason: 'sin carpeta' }); continue }

  const caption = readCaption(absFolder)
  if (!caption) { results.push({ label: post.label, status: 'SKIP', reason: 'sin caption' }); continue }

  process.stdout.write(`  ${post.label}... `)
  try {
    const images = readdirSync(absFolder).filter(f => f.match(/slide-\d+\.(jpg|jpeg|png)$/i)).sort().map(f => join(absFolder, f))
    const scheduledTs = toUnix(post.date, post.hour)
    let photoIds = []
    if (images.length > 0) { process.stdout.write(`(${images.length} slides) `); for (const img of images) photoIds.push(await uploadPhoto(img)) }
    const postId = await postFeed(caption, photoIds, scheduledTs)
    console.log(`📅 ${post.date} ${post.hour}:00hs — ${postId}`)
    results.push({ label: post.label, status: 'SCHEDULED', postId })
  } catch (e) {
    console.log(`❌ ${e.message}`)
    results.push({ label: post.label, status: 'ERROR', error: e.message })
  }
}

console.log('\n' + '═'.repeat(60))
results.forEach(r => console.log(`${r.status === 'SCHEDULED' ? '📅' : r.status === 'SKIP' ? '⚪' : '🔴'} ${r.label}${r.postId ? ' — ' + r.postId : r.error ? ' ERROR: ' + r.error : ''}`))
