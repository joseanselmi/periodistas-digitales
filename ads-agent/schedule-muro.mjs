/**
 * schedule-muro.mjs — Programa la serie "el periodista del muro" (agosto 16→31).
 * Uso: node --env-file=.env.local schedule-muro.mjs
 *
 * Idempotente: lee la cola primero y saltea las fechas ya programadas, así se puede
 * re-correr para meter los que rebotan por el tope de Meta (29 posts en cola, medido).
 * Cuando la cola está llena Meta responde (#100) "scheduled publish time is invalid" —
 * no es un problema de fecha.
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
  // ── Serie de la guía (16→24), en el orden en que se lee ──
  { folder: 'carousels/muro-s1/para-subir/7-DOMINGO',   date: '2026-08-16', label: 'Dom 16/08 — C · La marca que se ve es la de ellos' },
  { folder: 'carousels/muro-s1/para-subir/1-LUNES',     date: '2026-08-17', label: 'Lun 17/08 — C · Los que te siguen no son los que te leen' },
  { folder: 'carousels/muro-s1/para-subir/2-MARTES',    date: '2026-08-18', label: 'Mar 18/08 — T · "¿Y no debería abrirme una página primero?"' },
  { folder: 'carousels/muro-s1/para-subir/3-MIERCOLES', date: '2026-08-19', label: 'Mié 19/08 — C · En vez de "compartir", estos 4 pasos' },
  { folder: 'carousels/muro-s1/para-subir/4-JUEVES',    date: '2026-08-20', label: 'Jue 20/08 — T · La pregunta que se responde con un dato' },
  { folder: 'carousels/muro-s1/para-subir/5-VIERNES',   date: '2026-08-21', label: 'Vie 21/08 — C · Titular de muro ≠ titular de diario' },
  { folder: 'carousels/muro-s1/para-subir/6-SABADO',    date: '2026-08-22', label: 'Sáb 22/08 — T · Los primeros treinta minutos' },
  { folder: 'carousels/muro-s2/para-subir/7-DOMINGO',   date: '2026-08-23', label: 'Dom 23/08 — C · La primera línea para el que no te conoce' },
  { folder: 'carousels/muro-s2/para-subir/1-LUNES',     date: '2026-08-24', label: 'Lun 24/08 — C · El recuento C/L' },
  // ── Mismo público, cierre de mes (25→31) ──
  { folder: 'carousels/muro-s2/para-subir/2-MARTES',    date: '2026-08-25', label: 'Mar 25/08 — T · Te piden difusión, no te pagan' },
  { folder: 'carousels/muro-s2/para-subir/3-MIERCOLES', date: '2026-08-26', label: 'Mié 26/08 — C · Tres formatos que hoy se reparten' },
  { folder: 'carousels/muro-s2/para-subir/4-JUEVES',    date: '2026-08-27', label: 'Jue 27/08 — T · Once años publicando para conocidos (prueba social)' },
  { folder: 'carousels/muro-s2/para-subir/5-VIERNES',   date: '2026-08-28', label: 'Vie 28/08 — C · VENTA: los 5 pasos (enlace en bio)' },
  { folder: 'carousels/muro-s2/para-subir/6-SABADO',    date: '2026-08-29', label: 'Sáb 29/08 — T · El miedo a perder lo que ya tienes' },
  { folder: 'carousels/muro-s3/para-subir/7-DOMINGO',   date: '2026-08-30', label: 'Dom 30/08 — C · Qué mira un negocio antes de pagarte' },
  { folder: 'carousels/muro-s3/para-subir/1-LUNES',     date: '2026-08-31', label: 'Lun 31/08 — C · Vuelve a contar (cierre de agosto)' },
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

const cola = await (await fetch(`${BASE}/${PAGE_ID}/scheduled_posts?fields=scheduled_publish_time&limit=100&access_token=${PAGE_TOKEN}`)).json()
if (cola.error) { console.error('❌ No se pudo leer la cola:', cola.error.message); process.exit(1) }
const yaProgramadas = new Set((cola.data || []).map(p =>
  new Date(p.scheduled_publish_time * 1000).toISOString().slice(0, 10)))
console.log(`\n📅 SERIE "EL PERIODISTA DEL MURO" — agosto 16→31 · página ${PAGE_ID}`)
console.log(`   Cola actual: ${(cola.data || []).length} posts (el tope de Meta es 29)\n`)

const results = []
for (const post of POSTS) {
  if (yaProgramadas.has(post.date)) {
    console.log(`⏭️  ${post.label} — ya estaba en la cola`)
    results.push({ ...post, status: 'YA' }); continue
  }
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
console.log(`⏭️  Ya estaban:  ${results.filter(r => r.status === 'YA').length}`)
console.log(`🔴 Errores:     ${results.filter(r => r.status === 'ERROR').length}`)
const errs = results.filter(r => r.status === 'ERROR')
if (errs.length) {
  errs.forEach(e => console.log(`   ${e.label}: ${e.error}`))
  console.log('\n💡 Si dice "scheduled publish time is invalid" es la cola llena (29).')
  console.log('   Re-corré este mismo script en unos días: saltea lo ya programado.')
}
