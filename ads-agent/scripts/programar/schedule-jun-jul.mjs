/**
 * schedule-jun-jul.mjs — Programa el contenido orgánico del 22 de junio al 31 de julio 2026
 * Uso: node scripts/programar/schedule-jun-jul.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'

if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

function toUnix(dateStr, hour = 8) {
  const utcHour = hour + 3 // Argentina UTC-3
  const d = new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`)
  return Math.floor(d.getTime() / 1000)
}

// ─── CALENDARIO COMPLETO (22 jun - 31 jul 2026) ───────────────────────────────
const POSTS = [
  // Semana 1 — "Tu trabajo te enseñó todo, excepto a cobrar lo que vale" (22-28 jun)
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/1-LUNES',     date: '2026-06-22', hour: 8, label: 'Lun 22/06 — Prompt 3 formatos' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/2-MARTES',    date: '2026-06-23', hour: 8, label: 'Mar 23/06 — Recortes LATAM 2026' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/3-MIERCOLES', date: '2026-06-24', hour: 8, label: 'Mié 24/06 — Elegir tu nicho' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/4-JUEVES',    date: '2026-06-25', hour: 8, label: 'Jue 25/06 — Caso Marisol Beltrán' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/5-VIERNES',   date: '2026-06-26', hour: 8, label: 'Vie 26/06 — Activo propio (venta)' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/6-SABADO',    date: '2026-06-27', hour: 8, label: 'Sáb 27/06 — Identidad vs. circunstancia' },
  { folder: 'contenido/carousels/publicados/semana-22-06/para-subir/7-DOMINGO',   date: '2026-06-28', hour: 8, label: 'Dom 28/06 — IA en redacciones 2026' },

  // Semana 2 — "La IA no es el enemigo, es la ventaja" (29 jun - 5 jul)
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/1-LUNES',     date: '2026-06-29', hour: 8, label: 'Lun 29/06 — Prompt research' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/2-MARTES',    date: '2026-06-30', hour: 8, label: 'Mar 30/06 — El doble de notas, mismo sueldo' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/3-MIERCOLES', date: '2026-07-01', hour: 8, label: 'Mié 1/07 — 3 herramientas de IA' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/4-JUEVES',    date: '2026-07-02', hour: 8, label: 'Jue 2/07 — Caso Mariana Ibarra' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/5-VIERNES',   date: '2026-07-03', hour: 8, label: 'Vie 3/07 — Módulo IA (venta)' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/6-SABADO',    date: '2026-07-04', hour: 8, label: 'Sáb 4/07 — Miedo a quedar obsoleto' },
  { folder: 'contenido/carousels/publicados/semana-29-06/para-subir/7-DOMINGO',   date: '2026-07-05', hour: 8, label: 'Dom 5/07 — Cierres de medios LATAM' },

  // Semana 3 — "Así se ve el sistema funcionando de verdad" (6-12 jul)
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/1-LUNES',     date: '2026-07-06', hour: 8, label: 'Lun 6/07 — Checklist primera edición' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/2-MARTES',    date: '2026-07-07', hour: 8, label: 'Mar 7/07 — Parálisis por análisis' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/3-MIERCOLES', date: '2026-07-08', hour: 8, label: 'Mié 8/07 — Script primer anunciante' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/4-JUEVES',    date: '2026-07-09', hour: 8, label: 'Jue 9/07 — Caso Marcela Ibarra' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/5-VIERNES',   date: '2026-07-10', hour: 8, label: 'Vie 10/07 — Mecanismo completo (venta)' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/6-SABADO',    date: '2026-07-11', hour: 8, label: 'Sáb 11/07 — Primer paso imperfecto' },
  { folder: 'contenido/carousels/publicados/semana-06-07/para-subir/7-DOMINGO',   date: '2026-07-12', hour: 8, label: 'Dom 12/07 — Consumo de noticias LATAM' },

  // Semana 4 — "Tu periódico digital, mes 1: el plan completo" (13-19 jul)
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/1-LUNES',     date: '2026-07-13', hour: 8, label: 'Lun 13/07 — Semana 1 del sistema' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/2-MARTES',    date: '2026-07-14', hour: 8, label: 'Mar 14/07 — Proyección a 1 año' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/3-MIERCOLES', date: '2026-07-15', hour: 8, label: 'Mié 15/07 — WhatsApp/Telegram' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/4-JUEVES',    date: '2026-07-16', hour: 8, label: 'Jue 16/07 — Caso Valeria Suárez' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/5-VIERNES',   date: '2026-07-17', hour: 8, label: 'Vie 17/07 — Mecanismo 4 semanas (venta)' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/6-SABADO',    date: '2026-07-18', hour: 8, label: 'Sáb 18/07 — Sin renunciar' },
  { folder: 'contenido/carousels/publicados/semana-13-07/para-subir/7-DOMINGO',   date: '2026-07-19', hour: 8, label: 'Dom 19/07 — Medios independientes LATAM' },

  // Semana 5 — "Las objeciones reales, respondidas" (20-26 jul)
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/1-LUNES',     date: '2026-07-20', hour: 8, label: 'Lun 20/07 — Prompt calendario contenido' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/2-MARTES',    date: '2026-07-21', hour: 8, label: 'Mar 21/07 — Objeción "no tengo tiempo"' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/3-MIERCOLES', date: '2026-07-22', hour: 8, label: 'Mié 22/07 — No hace falta ser técnico' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/4-JUEVES',    date: '2026-07-23', hour: 8, label: 'Jue 23/07 — Caso Marta Villalba' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/5-VIERNES',   date: '2026-07-24', hour: 8, label: 'Vie 24/07 — Garantía 7 días (venta)' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/6-SABADO',    date: '2026-07-25', hour: 8, label: 'Sáb 25/07 — Costo de no intentarlo' },
  { folder: 'contenido/carousels/publicados/semana-20-07/para-subir/7-DOMINGO',   date: '2026-07-26', hour: 8, label: 'Dom 26/07 — Balance LATAM 2026' },

  // Semana 6 — "Cierre de julio" (27-31 jul, 5 días)
  { folder: 'contenido/carousels/publicados/semana-27-07/para-subir/1-LUNES',     date: '2026-07-27', hour: 8, label: 'Lun 27/07 — Media kit' },
  { folder: 'contenido/carousels/publicados/semana-27-07/para-subir/2-MARTES',    date: '2026-07-28', hour: 8, label: 'Mar 28/07 — Lo que te propusiste' },
  { folder: 'contenido/carousels/publicados/semana-27-07/para-subir/3-MIERCOLES', date: '2026-07-29', hour: 8, label: 'Mié 29/07 — Primer precio' },
  { folder: 'contenido/carousels/publicados/semana-27-07/para-subir/4-JUEVES',    date: '2026-07-30', hour: 8, label: 'Jue 30/07 — Mosaico 3 historias' },
  { folder: 'contenido/carousels/publicados/semana-27-07/para-subir/5-VIERNES',   date: '2026-07-31', hour: 8, label: 'Vie 31/07 — Cierre de julio (venta)' },
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
  return ''
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📅 PROGRAMANDO 22 JUNIO - 31 JULIO 2026')
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
console.log('RESUMEN')
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
