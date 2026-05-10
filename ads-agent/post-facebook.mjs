/**
 * post-facebook.mjs — Publica o programa posts en la Fanpage de Facebook
 * Soporta: texto puro, imagen única, carrusel (múltiples imágenes)
 *
 * Uso:
 *   node post-facebook.mjs carousels/semana-12-05/para-subir/1-LUNES
 *   node post-facebook.mjs carousels/semana-12-05/para-subir/1-LUNES --schedule "2026-05-12 08:00"
 *   node post-facebook.mjs carousels/semana-12-05/para-subir/2-MARTES --text-only
 *
 * Variables: FB_PAGE_TOKEN, FB_PAGE_ID
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = `https://graph.facebook.com/v21.0`

if (!PAGE_TOKEN) {
  console.error('\n❌ Falta FB_PAGE_TOKEN en el entorno')
  console.error('   Agregalo en .env.local: FB_PAGE_TOKEN=EAAxxxxx')
  process.exit(1)
}

const args      = process.argv.slice(2)
const pubFolder = args[0]
const scheduleArg = args.find(a => a.startsWith('--schedule'))?.split(' ').slice(1).join(' ')
              || args[args.indexOf('--schedule') + 1]
const textOnly  = args.includes('--text-only')

if (!pubFolder) {
  console.error('Uso: node post-facebook.mjs <carpeta-publicacion> [--schedule "YYYY-MM-DD HH:MM"] [--text-only]')
  process.exit(1)
}

const absFolder = resolve(pubFolder)
if (!existsSync(absFolder)) {
  console.error('❌ No existe la carpeta:', absFolder)
  process.exit(1)
}

// ─── Leer contenido de la carpeta ─────────────────────────────────────────────

const captionPath = join(absFolder, 'pie-de-foto.txt')
const caption     = existsSync(captionPath) ? readFileSync(captionPath, 'utf-8').trim() : ''

const images = readdirSync(absFolder)
  .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
  .sort()
  .map(f => join(absFolder, f))

console.log('\n📘 FACEBOOK PUBLISHER')
console.log(`   Página: ${PAGE_ID}`)
console.log(`   Carpeta: ${pubFolder}`)
console.log(`   Imágenes: ${images.length}`)
console.log(`   Caption: ${caption.slice(0, 60)}...`)
if (scheduleArg) console.log(`   Programado: ${scheduleArg}`)
else console.log('   Publicación: INMEDIATA')

// ─── Calcular scheduled_publish_time ─────────────────────────────────────────

let scheduledTime = null
if (scheduleArg) {
  const date = new Date(scheduleArg.replace(' ', 'T') + ':00-03:00') // timezone Argentina/Colombia
  if (isNaN(date.getTime())) {
    console.error('❌ Formato de fecha inválido. Usá: "2026-05-12 08:00"')
    process.exit(1)
  }
  const diffMin = (date.getTime() - Date.now()) / 60000
  if (diffMin < 10) {
    console.error('❌ La fecha programada debe ser al menos 10 minutos en el futuro')
    process.exit(1)
  }
  if (diffMin > 43200) {
    console.error('❌ Facebook no permite programar con más de 30 días de anticipación')
    process.exit(1)
  }
  scheduledTime = Math.floor(date.getTime() / 1000)
  console.log(`   Unix timestamp: ${scheduledTime}`)
}

// ─── API helper ───────────────────────────────────────────────────────────────

async function api(method, path, body = {}) {
  const url  = `${BASE}${path}`
  const form = new URLSearchParams({ ...body, access_token: PAGE_TOKEN })

  const res  = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method !== 'GET' ? form : undefined,
  })
  const data = await res.json()
  if (data.error) throw new Error(`FB API: ${data.error.message} (${data.error.code})`)
  return data
}

// ─── Subir imagen sin publicar ────────────────────────────────────────────────

async function uploadPhoto(imagePath) {
  const imgBuffer  = readFileSync(imagePath)
  const base64     = imgBuffer.toString('base64')
  const mimeType   = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

  const url  = `${BASE}/${PAGE_ID}/photos`
  const form = new FormData()
  form.append('published', 'false')
  form.append('access_token', PAGE_TOKEN)
  form.append('source', new Blob([imgBuffer], { type: mimeType }), 'image.jpg')

  const res  = await fetch(url, { method: 'POST', body: form })
  const data = await res.json()
  if (data.error) throw new Error(`Error subiendo imagen: ${data.error.message}`)
  return data.id
}

// ─── Publicar ─────────────────────────────────────────────────────────────────

async function publish() {
  // Solo texto
  if (textOnly || images.length === 0) {
    console.log('\n  Publicando texto...')
    const body = { message: caption }
    if (scheduledTime) {
      body.published = 'false'
      body.scheduled_publish_time = String(scheduledTime)
    }
    const result = await api('POST', `/${PAGE_ID}/feed`, body)
    return result.id
  }

  // Una sola imagen
  if (images.length === 1) {
    console.log('\n  Subiendo imagen única...')
    const photoId = await uploadPhoto(images[0])
    console.log(`  Imagen subida: ${photoId}`)

    const body = { message: caption, attached_media: JSON.stringify([{ media_fbid: photoId }]) }
    if (scheduledTime) {
      body.published = 'false'
      body.scheduled_publish_time = String(scheduledTime)
    }
    const result = await api('POST', `/${PAGE_ID}/feed`, body)
    return result.id
  }

  // Carrusel (múltiples imágenes)
  console.log(`\n  Subiendo ${images.length} imágenes para carrusel...`)
  const photoIds = []
  for (let i = 0; i < images.length; i++) {
    process.stdout.write(`  Imagen ${i + 1}/${images.length}...`)
    const id = await uploadPhoto(images[i])
    photoIds.push(id)
    console.log(` ✅ ${id}`)
  }

  console.log('\n  Creando post carrusel...')
  const attachedMedia = JSON.stringify(photoIds.map(id => ({ media_fbid: id })))
  const body = { message: caption, attached_media: attachedMedia }
  if (scheduledTime) {
    body.published = 'false'
    body.scheduled_publish_time = String(scheduledTime)
  }

  const result = await api('POST', `/${PAGE_ID}/feed`, body)
  return result.id
}

// ─── Main ─────────────────────────────────────────────────────────────────────

try {
  const postId = await publish()
  console.log('\n' + '═'.repeat(55))
  if (scheduledTime) {
    console.log(`✅ POST PROGRAMADO`)
    console.log(`   Fecha: ${scheduleArg}`)
  } else {
    console.log(`✅ POST PUBLICADO`)
  }
  console.log(`   Post ID: ${postId}`)
  console.log(`   URL: https://www.facebook.com/${PAGE_ID}/posts/${postId.split('_')[1]}`)
} catch (e) {
  console.error('\n❌', e.message)
  process.exit(1)
}
