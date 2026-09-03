/**
 * schedule-septiembre.mjs — Programa el arco de septiembre (04→30/09/2026).
 * Uso: node --env-file=.env.local scripts/programar/schedule-septiembre.mjs
 *      node --env-file=.env.local scripts/programar/schedule-septiembre.mjs --dry
 *
 * Copiado de schedule-muro.mjs, que es el modelo. Dos cosas heredadas y una nueva:
 *
 *  1. IDEMPOTENTE. Lee la cola de Facebook primero y saltea las fechas que ya
 *     están programadas, así se puede re-correr sin duplicar nada. Es la regla que
 *     dejaron los cinco calendarios borrados el 07/08: un script que publica al
 *     mundo se escribe idempotente o no se escribe.
 *  2. Tope de Meta: 29 posts en cola, medido. Al llegar, el siguiente rebota con
 *     "(#100) The specified scheduled publish time is invalid", que es cómo Meta
 *     reporta la cola llena y NO un problema de fecha. Acá entran 24, así que no
 *     debería tocarlo — pero si aparece ese error, es eso.
 *  3. NUEVO: la lista de días no está escrita acá. Sale de CONTENIDO.mjs, que es
 *     lo que Jose revisó. Los días marcados NECESITA_DATO (los 3 jueves de prueba
 *     social) se saltean: no hay hecho real para llenarlos y no se inventa uno.
 */
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

// Misma forma de anclaje que entiende herramientas/verificar-repo.mjs.
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const { DIAS } = await import(pathToFileURL(join(RAIZ, 'contenido/carousels/ia-sept/CONTENIDO.mjs')).href)

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'
const DRY        = process.argv.includes('--dry')
if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

// 8:00 ART = 11:00 UTC. Los horarios se piensan en hora local de la audiencia.
function toUnix(dateStr, hour = 8) {
  const utcHour = hour + 3
  return Math.floor(new Date(`${dateStr}T${String(utcHour).padStart(2, '0')}:00:00Z`).getTime() / 1000)
}

const SEMANA_A_CARPETA = { apertura: 'ia-s0', s1: 'ia-s1', s2: 'ia-s2', s3: 'ia-s3', cierre: 'ia-s4' }
const DOW = { 'Lun': '1-LUNES', 'Mar': '2-MARTES', 'Mié': '3-MIERCOLES', 'Jue': '4-JUEVES', 'Vie': '5-VIERNES', 'Sáb': '6-SABADO', 'Dom': '7-DOMINGO' }

const POSTS = DIAS.filter(d => !d.NECESITA_DATO).map(d => ({
  date: d.fecha,
  folder: join(RAIZ, 'contenido/carousels', SEMANA_A_CARPETA[d.semana], 'para-subir', DOW[d.dia]),
  label: `${d.dia} ${d.fecha.slice(8)}/09 — ${d.tipo === 'carrusel' ? 'C' : 'T'} · ${d.titulo}`,
}))
const SALTEADOS = DIAS.filter(d => d.NECESITA_DATO)

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
const yaProgramadas = new Set((cola.data || []).map(p => new Date(p.scheduled_publish_time * 1000).toISOString().slice(0, 10)))

console.log(`\n📅 SEPTIEMBRE — "IA aplicada al periodista de a pie" · página ${PAGE_ID}`)
console.log(`   Cola actual: ${(cola.data || []).length} posts (el tope de Meta es 29)`)
console.log(`   A programar: ${POSTS.length} · salteados: ${SALTEADOS.length} (jueves sin hecho real)`)
if (DRY) console.log('   🧪 ENSAYO: no se sube nada\n'); else console.log('')

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
  const images = existsSync(abs) ? readdirSync(abs).filter(f => /slide-\d+\.(jpg|jpeg|png)$/i.test(f)).sort().map(f => join(abs, f)) : []
  process.stdout.write(`  ${post.label} (${images.length || 'sin'} slides)... `)
  if (DRY) { console.log(`🧪 iría el ${post.date} 8:00 ART`); results.push({ ...post, status: 'DRY' }); continue }
  try {
    const photoIds = []
    for (const img of images) photoIds.push(await uploadPhoto(img))
    const id = await postFeed(caption, photoIds, toUnix(post.date, 8))
    console.log(`📅 ${post.date} 8:00 ART — ${id}`)
    results.push({ ...post, status: 'OK', id })
  } catch (e) {
    console.log(`❌ ${e.message}`)
    results.push({ ...post, status: 'ERROR', error: e.message })
  }
}

console.log('\n' + '─'.repeat(64))
console.log(`✅ Programados: ${results.filter(r => r.status === 'OK').length}`)
console.log(`⏭️  Ya estaban:  ${results.filter(r => r.status === 'YA').length}`)
console.log(`🔴 Errores:     ${results.filter(r => r.status === 'ERROR').length}`)
if (SALTEADOS.length) {
  console.log(`\n⚠️  ${SALTEADOS.length} días quedaron SIN programar a propósito (prueba social sin hecho verificado):`)
  SALTEADOS.forEach(d => console.log(`   ${d.fecha} ${d.dia} — falta el dato real, ver contenido/carousels/ia-sept/CONTENIDO.mjs`))
}
const errs = results.filter(r => r.status === 'ERROR')
if (errs.length) {
  errs.forEach(e => console.log(`   ${e.label}: ${e.error}`))
  console.log('\n💡 Si dice "scheduled publish time is invalid" es la cola llena (29).')
  console.log('   Re-corré este mismo script en unos días: saltea lo ya programado.')
}
