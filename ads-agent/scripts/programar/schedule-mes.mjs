/**
 * schedule-mes.mjs — Programa S2 + S3 + S4 en Facebook
 * Uso: node scripts/programar/schedule-mes.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'

if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

function toUnix(dateStr, hour = 8) {
  const utcHour = hour + 3
  const d = new Date(`${dateStr}T${String(utcHour).padStart(2,'0')}:00:00Z`)
  return Math.floor(d.getTime() / 1000)
}

// ─── CALENDARIO COMPLETO ──────────────────────────────────────────────────────
const POSTS = [
  // S2 — "La IA es tu herramienta"
  { folder: 'carousels/semana-19-05/para-subir/1-LUNES-19',     date: '2026-05-19', hour: 8,  label: 'Lun 19/05 — 5 herramientas de IA' },
  { folder: 'carousels/semana-19-05/para-subir/2-MARTES-20',    date: '2026-05-20', hour: 8,  label: 'Mar 20/05 — 3 horas que perdés sin IA' },
  { folder: 'carousels/semana-19-05/para-subir/3-MIERCOLES-21', date: '2026-05-21', hour: 8,  label: 'Mié 21/05 — NotebookLM para entrevistas' },
  { folder: 'carousels/semana-19-05/para-subir/4-JUEVES-22',    date: '2026-05-22', hour: 8,  label: 'Jue 22/05 — Historia Camila (IA + freelance)' },
  { folder: 'carousels/semana-19-05/para-subir/5-VIERNES-23',   date: '2026-05-23', hour: 8,  label: 'Vie 23/05 — Tu criterio + IA' },
  { folder: 'carousels/semana-19-05/para-subir/6-SABADO-24',    date: '2026-05-24', hour: 8,  label: 'Sáb 24/05 — La IA no te reemplaza' },
  { folder: 'carousels/semana-19-05/para-subir/7-DOMINGO-25',   date: '2026-05-25', hour: 8,  label: 'Dom 25/05 — 5 señales IA en LATAM' },

  // S3 — "Otros ya lo están haciendo"
  { folder: 'carousels/semana-26-05/para-subir/1-LUNES-26',     date: '2026-05-26', hour: 8,  label: 'Lun 26/05 — Primer producto en 30 días' },
  { folder: 'carousels/semana-26-05/para-subir/2-MARTES-27',    date: '2026-05-27', hour: 8,  label: 'Mar 27/05 — Cada mes que esperás' },
  { folder: 'carousels/semana-26-05/para-subir/3-MIERCOLES-28', date: '2026-05-28', hour: 8,  label: 'Mié 28/05 — 5 formatos que generan ingresos' },
  { folder: 'carousels/semana-26-05/para-subir/4-JUEVES-29',    date: '2026-05-29', hour: 8,  label: 'Jue 29/05 — Historia Roberto (Ecuador)' },
  { folder: 'carousels/semana-26-05/para-subir/5-VIERNES-30',   date: '2026-05-30', hour: 8,  label: 'Vie 30/05 — 3 modelos de ingreso' },
  { folder: 'carousels/semana-26-05/para-subir/6-SABADO-31',    date: '2026-05-31', hour: 8,  label: 'Sáb 31/05 — El freelance no es plan B' },
  { folder: 'carousels/semana-26-05/para-subir/7-DOMINGO-01jun',date: '2026-06-01', hour: 8,  label: 'Dom 1/06 — Periodismo independiente LATAM' },

  // S4 — "Es tu momento" (conversión)
  { folder: 'carousels/semana-02-06/para-subir/1-LUNES-02',     date: '2026-06-02', hour: 8,  label: 'Lun 2/06 — Qué incluye el Sistema' },
  { folder: 'carousels/semana-02-06/para-subir/2-MARTES-03',    date: '2026-06-03', hour: 8,  label: 'Mar 3/06 — $10 ¿cuánto cuesta no tenerlo?' },
  { folder: 'carousels/semana-02-06/para-subir/3-MIERCOLES-04', date: '2026-06-04', hour: 8,  label: 'Mié 4/06 — Primera semana en el Sistema' },
  { folder: 'carousels/semana-02-06/para-subir/4-JUEVES-05',    date: '2026-06-05', hour: 8,  label: 'Jue 5/06 — Testimonios Diego, Marcela, Fernando' },
  { folder: 'carousels/semana-02-06/para-subir/5-VIERNES-06',   date: '2026-06-06', hour: 8,  label: 'Vie 6/06 — Oferta final' },
  { folder: 'carousels/semana-02-06/para-subir/6-SABADO-07',    date: '2026-06-07', hour: 8,  label: 'Sáb 7/06 — Lo que construiste merece ser cobrado' },
  { folder: 'carousels/semana-02-06/para-subir/7-DOMINGO-08',   date: '2026-06-08', hour: 8,  label: 'Dom 8/06 — Una decisión' },
]

// ─── API ──────────────────────────────────────────────────────────────────────

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
  const mdFile = join(folder, 'pie-de-foto.md')
  if (existsSync(mdFile)) return readFileSync(mdFile, 'utf-8').trim()
  return ''
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📅 PROGRAMANDO MAYO-JUNIO 2026 (S2 + S3 + S4)')
console.log(`   Página: ${PAGE_ID}`)
console.log(`   Posts: ${POSTS.length}\n`)

const results = []

for (const post of POSTS) {
  const absFolder = resolve(post.folder)

  if (!existsSync(absFolder)) {
    console.log(`  ⚠️  Carpeta no existe: ${post.folder}`)
    results.push({ label: post.label, status: 'SKIP', reason: 'sin carpeta' })
    continue
  }

  const caption = readCaption(absFolder)
  if (!caption) {
    console.log(`  ⚠️  Sin caption: ${post.folder}`)
    results.push({ label: post.label, status: 'SKIP', reason: 'sin caption' })
    continue
  }

  process.stdout.write(`  ${post.label}... `)

  try {
    const images = readdirSync(absFolder)
      .filter(f => f.match(/slide-\d+\.(jpg|jpeg|png)$/i))
      .sort()
      .map(f => join(absFolder, f))

    const scheduledTs = toUnix(post.date, post.hour)
    const now = Math.floor(Date.now() / 1000)
    const useSchedule = scheduledTs > now + 600

    let photoIds = []
    if (images.length > 0) {
      process.stdout.write(`(${images.length} slides) `)
      for (const img of images) photoIds.push(await uploadPhoto(img))
    }

    const postId = await postFeed(caption, photoIds, useSchedule ? scheduledTs : null)

    if (useSchedule) {
      console.log(`📅 ${post.date} ${post.hour}:00hs — ${postId}`)
    } else {
      console.log(`✅ PUBLICADO ahora — ${postId}`)
    }
    results.push({ label: post.label, status: useSchedule ? 'SCHEDULED' : 'PUBLISHED', postId, date: post.date })

  } catch (e) {
    console.log(`❌ ${e.message}`)
    results.push({ label: post.label, status: 'ERROR', error: e.message })
  }
}

// ─── Resumen ──────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(65))
console.log('RESUMEN DEL MES')
console.log('═'.repeat(65))

const ok     = results.filter(r => r.status === 'SCHEDULED' || r.status === 'PUBLISHED')
const skip   = results.filter(r => r.status === 'SKIP')
const errors = results.filter(r => r.status === 'ERROR')

results.forEach(r => {
  const icon = { PUBLISHED: '🟢', SCHEDULED: '📅', SKIP: '⚪', ERROR: '🔴' }[r.status] || '❓'
  const extra = r.status === 'SKIP' ? ` (${r.reason})` : r.status === 'ERROR' ? ` ERROR: ${r.error}` : ` — ${r.postId}`
  console.log(`${icon} ${r.label}${extra}`)
})

console.log('\n' + '─'.repeat(65))
console.log(`✅ Programados/publicados : ${ok.length}`)
console.log(`⚪ Sin imágenes/saltados   : ${skip.length}`)
console.log(`🔴 Errores                : ${errors.length}`)

if (skip.length > 0) {
  console.log('\n⚠️  Para los posts sin imágenes (carruseles), corré primero:')
  console.log('   node scripts/exportar/export-slides-auto.mjs carousels/semana-19-05')
  console.log('   node scripts/exportar/export-slides-auto.mjs carousels/semana-26-05')
  console.log('   node scripts/exportar/export-slides-auto.mjs carousels/semana-02-06')
  console.log('   Y luego volvé a correr: node scripts/programar/schedule-mes.mjs')
}
