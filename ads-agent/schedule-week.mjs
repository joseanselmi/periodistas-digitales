/**
 * schedule-week.mjs — Programa todos los posts de la semana en Facebook
 * Uso: node schedule-week.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'

if (!PAGE_TOKEN) {
  console.error('❌ Falta FB_PAGE_TOKEN')
  process.exit(1)
}

// ─── Horarios programados ─────────────────────────────────────────────────────
// Timezone: America/Argentina/Buenos_Aires (UTC-3)
// Convertimos a UTC para el API

function toUnix(dateStr, hour = 8) {
  // dateStr: "2026-05-10", hour: 8 = 8am Argentina = 11am UTC
  const utcHour = hour + 3
  const d = new Date(`${dateStr}T${String(utcHour).padStart(2,'0')}:00:00Z`)
  return Math.floor(d.getTime() / 1000)
}

const SCHEDULE = [
  {
    folder: 'carousels/semana-12-05/para-subir/1-LUNES',
    date: '2026-05-10', hour: 18,  // HOY a las 6pm
    label: 'Sáb 10/05 — Texto inspiracional (hoy)'
  },
  {
    folder: 'carousels/semana-12-05/para-subir/7-DOMINGO',
    date: '2026-05-11', hour: 8,
    label: 'Dom 11/05 — Carrusel Google/noticias'
  },
  {
    folder: 'carousels/semana-12-05/para-subir/1-LUNES',
    date: '2026-05-12', hour: 8,
    label: 'Lun 12/05 — Carrusel Prompt Maestro'
  },
]

// Wait — necesito mapear las carpetas correctamente
const POSTS = [
  { folder: 'carousels/semana-12-05/para-subir/0-SABADO-10', date: '2026-05-10', hour: 18, label: 'Sáb 10 — Texto inspiracional (HOY 18hs)' },
  { folder: 'carousels/semana-12-05/para-subir/7-DOMINGO',   date: '2026-05-11', hour: 8,  label: 'Dom 11 — Google cambió las noticias' },
  { folder: 'carousels/semana-12-05/para-subir/1-LUNES',     date: '2026-05-12', hour: 8,  label: 'Lun 12 — Prompt Maestro' },
  { folder: 'carousels/semana-12-05/para-subir/2-MARTES-13', date: '2026-05-13', hour: 8,  label: 'Mar 13 — El periodismo que te enseñaron' },
  { folder: 'carousels/semana-12-05/para-subir/3-MIERCOLES', date: '2026-05-14', hour: 8,  label: 'Mié 14 — WhatsApp Channels' },
  { folder: 'carousels/semana-12-05/para-subir/4-JUEVES-15', date: '2026-05-15', hour: 8,  label: 'Jue 15 — Historia Andrés Mora' },
  { folder: 'carousels/semana-12-05/para-subir/5-VIERNES',   date: '2026-05-16', hour: 8,  label: 'Vie 16 — Primer anunciante local' },
  { folder: 'carousels/semana-12-05/para-subir/6-SABADO-17', date: '2026-05-17', hour: 8,  label: 'Sáb 17 — Reflexión de cierre' },
  { folder: 'carousels/semana-12-05/para-subir/9-DOMINGO-18',date: '2026-05-18', hour: 8,  label: 'Dom 18 — NotebookLM para periodistas' },
]

// ─── API helpers ──────────────────────────────────────────────────────────────

async function uploadPhoto(imagePath) {
  const imgBuffer = readFileSync(imagePath)
  const mimeType  = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
  const form      = new FormData()
  form.append('published', 'false')
  form.append('access_token', PAGE_TOKEN)
  form.append('source', new Blob([imgBuffer], { type: mimeType }), 'image.jpg')
  const res  = await fetch(`${BASE}/${PAGE_ID}/photos`, { method: 'POST', body: form })
  const data = await res.json()
  if (data.error) throw new Error(`Upload: ${data.error.message}`)
  return data.id
}

async function postFeed(message, photoIds = [], scheduledTs = null) {
  const body = new URLSearchParams()
  body.set('access_token', PAGE_TOKEN)
  body.set('message', message)

  if (photoIds.length > 0) {
    body.set('attached_media', JSON.stringify(photoIds.map(id => ({ media_fbid: id }))))
  }

  if (scheduledTs) {
    body.set('published', 'false')
    body.set('scheduled_publish_time', String(scheduledTs))
  }

  const res  = await fetch(`${BASE}/${PAGE_ID}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (data.error) throw new Error(`Post: ${data.error.message}`)
  return data.id
}

// ─── Leer texto de un .md (sin frontmatter) ───────────────────────────────────

function readText(folder) {
  const mdFiles = readdirSync(folder).filter(f => f.endsWith('.txt') || f.endsWith('.md'))
  if (!mdFiles.length) return ''
  return readFileSync(join(folder, mdFiles[0]), 'utf-8').trim()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n📅 PROGRAMANDO SEMANA 10-18 MAYO 2026')
console.log(`   Página: ${PAGE_ID}\n`)

const results = []

for (const post of POSTS) {
  const absFolder = resolve(post.folder)

  if (!existsSync(absFolder)) {
    console.log(`  ⚠️  Carpeta no existe: ${post.folder} — saltando`)
    results.push({ label: post.label, status: 'SKIP', reason: 'carpeta no existe' })
    continue
  }

  process.stdout.write(`  ${post.label}... `)

  try {
    const caption = readText(absFolder)
    const images  = readdirSync(absFolder)
      .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
      .sort()
      .map(f => join(absFolder, f))

    const scheduledTs = toUnix(post.date, post.hour)
    const now = Math.floor(Date.now() / 1000)
    const isNow = scheduledTs < now + 600  // menos de 10 min en el futuro → publicar ahora

    let photoIds = []
    if (images.length > 0) {
      process.stdout.write(`(${images.length} imgs) `)
      for (const img of images) {
        const id = await uploadPhoto(img)
        photoIds.push(id)
      }
    }

    const postId = await postFeed(caption, photoIds, isNow ? null : scheduledTs)

    if (isNow) {
      console.log(`✅ PUBLICADO — ${postId}`)
    } else {
      const d = new Date(scheduledTs * 1000)
      console.log(`✅ PROGRAMADO ${post.date} ${post.hour}:00hs — ${postId}`)
    }

    results.push({ label: post.label, status: isNow ? 'PUBLISHED' : 'SCHEDULED', postId })

  } catch (e) {
    console.log(`❌ ${e.message}`)
    results.push({ label: post.label, status: 'ERROR', error: e.message })
  }
}

console.log('\n' + '═'.repeat(60))
console.log('RESUMEN')
console.log('═'.repeat(60))
results.forEach(r => {
  const icon = r.status === 'PUBLISHED' ? '🟢' : r.status === 'SCHEDULED' ? '📅' : r.status === 'SKIP' ? '⚪' : '🔴'
  console.log(`${icon} ${r.label}`)
})
