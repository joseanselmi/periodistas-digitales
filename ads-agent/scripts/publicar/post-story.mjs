/**
 * post-story.mjs — Publica la story del día en la página de Facebook.
 *
 * ⚠️ Las stories de página NO se pueden programar: la API las publica al instante
 *    y duran 24 h. Por eso este script se dispara UNA VEZ POR DÍA.
 *
 * Uso:
 *   node --env-file=.env.local scripts/publicar/post-story.mjs            → la de hoy
 *   node --env-file=.env.local scripts/publicar/post-story.mjs 2026-08-17 → una fecha puntual
 *   node --env-file=.env.local scripts/publicar/post-story.mjs --dry-run  → dice cuál publicaría, sin publicar
 *
 * Es idempotente por día: deja constancia en state/stories-publicadas.json y no
 * repite una fecha ya publicada (si el cron corre dos veces, no duplica).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'

const PAGE_TOKEN = process.env.FB_PAGE_TOKEN
const PAGE_ID    = process.env.FB_PAGE_ID || '439763019230527'
const BASE       = 'https://graph.facebook.com/v21.0'
const DIR        = resolve('carousels/muro-stories')
const LOG        = resolve('state/stories-publicadas.json')

const args   = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const fecha  = args.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a))
            || new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })

if (!PAGE_TOKEN) { console.error('❌ Falta FB_PAGE_TOKEN'); process.exit(1) }

const img = join(DIR, `${fecha}.jpg`)
if (!existsSync(img)) {
  console.log(`⚪ No hay story para ${fecha} — nada que publicar.`)
  process.exit(0)
}

const log = existsSync(LOG) ? JSON.parse(readFileSync(LOG, 'utf-8')) : {}
if (log[fecha]) {
  console.log(`⏭️  La story del ${fecha} ya se publicó (${log[fecha].id}). No se repite.`)
  process.exit(0)
}

if (dryRun) {
  console.log(`🔍 Publicaría la story del ${fecha}: ${img}`)
  process.exit(0)
}

// 1) subir la foto SIN publicar (queda fuera del muro, solo sirve de insumo)
const form = new FormData()
form.append('published', 'false')
form.append('access_token', PAGE_TOKEN)
form.append('source', new Blob([readFileSync(img)], { type: 'image/jpeg' }), 'story.jpg')
const up = await (await fetch(`${BASE}/${PAGE_ID}/photos`, { method: 'POST', body: form })).json()
if (up.error) { console.error('❌ Subiendo la foto:', up.error.message); process.exit(1) }

// 2) convertirla en story
const body = new URLSearchParams()
body.set('access_token', PAGE_TOKEN)
body.set('photo_id', up.id)
const res = await (await fetch(`${BASE}/${PAGE_ID}/photo_stories`, {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
})).json()

if (res.error || res.success === false) {
  console.error('❌ Publicando la story:', JSON.stringify(res.error || res))
  process.exit(1)
}

const id = res.post_id || res.id || up.id
log[fecha] = { id, publicada: new Date().toISOString() }
mkdirSync(resolve('state'), { recursive: true })
writeFileSync(LOG, JSON.stringify(log, null, 2), 'utf-8')
console.log(`📱 Story del ${fecha} publicada — ${id} (dura 24 h)`)
