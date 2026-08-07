/**
 * Clara — Curadora de Noticias de Periodismo
 * Corre cada día. Scrapea RSS verificados, filtra con Claude,
 * y las publica en Supabase. La imagen sale del RSS si la trae; si no, queda
 * pendiente de hacerse a mano (ver ../../docs/CHATGPT-IMAGENES.md).
 *
 * Uso: node ads-agent/scripts/agentes/clara.mjs
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// ── Config ───────────────────────────────────────────────────────────────────

// Las claves salen de ads-agent/.env.local. Un solo lugar decide de dónde se
// leen y avisa claro si falta alguna: ../../lib/env.mjs
//
// Antes esto estaba resuelto acá adentro y leía SOLO `../../Leadr/app/.env.local`,
// o sea que Clara —que corre todos los días— dependía en silencio de tener el
// repo hermano al lado y con ese nombre exacto.
import { writeFileSync } from 'fs'
import { resolve as resolvePath } from 'path'
import { cargarEnv } from '../../lib/env.mjs'

cargarEnv(['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'])

const SUPABASE_URL         = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY        = process.env.ANTHROPIC_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY, maxRetries: 5 })

// ── Fuentes RSS verificadas ──────────────────────────────────────────────────
// Solo fuentes de primer nivel — sin scraping libre

const FUENTES = [
  { nombre: 'Nieman Lab',        url: 'https://www.niemanlab.org/feed/' },
  { nombre: 'Poynter',           url: 'https://www.poynter.org/feed/' },
  { nombre: 'Reuters Institute', url: 'https://reutersinstitute.politics.ox.ac.uk/rss.xml' },
  { nombre: 'ICFJ',              url: 'https://www.icfj.org/rss.xml' },
  { nombre: 'Press Gazette',     url: 'https://pressgazette.co.uk/feed/' },
  { nombre: 'Periodismo de Barrio', url: 'https://www.periodismodebarrio.org/feed/' },
  { nombre: 'Chequeado',         url: 'https://chequeado.com/feed/' },
  { nombre: 'FNPI',              url: 'https://fundacion.fnpi.org/feed/' },
]

// ── Parser RSS simple (sin dependencias extra) ───────────────────────────────

async function fetchFeed(fuente) {
  try {
    const res = await fetch(fuente.url, {
      headers: { 'User-Agent': 'Clara/1.0 (Leadr news curator)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const titulo = stripTags(extractTag(block, 'title'))
      const link = extractTag(block, 'link') || extractTag(block, 'guid')
      const descripcion = stripTags(extractTag(block, 'description') || extractTag(block, 'content:encoded') || '')
      const imagen = extractImageFromBlock(block)

      if (titulo && link) {
        items.push({ titulo, link: link.trim(), descripcion: descripcion.slice(0, 500), imagen, fuente: fuente.nombre })
      }
      if (items.length >= 5) break
    }
    return items
  } catch {
    console.log(`⚠️  ${fuente.nombre}: no se pudo leer el feed`)
    return []
  }
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? (m[1] || m[2] || '').trim() : ''
}

function stripTags(str) {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#\d+;/g, '').trim()
}

function extractImageFromBlock(block) {
  const media = block.match(/<media:content[^>]+url="([^"]+)"/i)
  if (media) return media[1]
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i)
  if (enclosure) return enclosure[1]
  const imgTag = block.match(/<img[^>]+src="([^"]+)"/i)
  if (imgTag) return imgTag[1]
  return null
}

// ── Filtro con Claude ─────────────────────────────────────────────────────────

async function filtrarYResumirConClaude(items) {
  const prompt = `Eres Clara, curadora editorial de Leadr, una plataforma para periodistas latinoamericanos.

Tenés esta lista de artículos recientes de medios especializados en periodismo:

${items.map((it, i) => `[${i + 1}] Fuente: ${it.fuente}
Título: ${it.titulo}
Descripción: ${it.descripcion}
URL: ${it.link}`).join('\n\n')}

Tu tarea:
1. Seleccioná exactamente 5 artículos (o menos si no hay suficientes que califiquen).
2. Criterio de selección: útil para periodistas latinoamericanos freelance o de medios independientes. Incluye: cambios de plataformas digitales, nuevas herramientas, modelos de negocio, desinformación, innovación en medios, periodismo de datos, IA en medios. EXCLUYE: catástrofes, política electoral, farándula, deportes, tragedias, crímenes, cualquier cosa que no aporte al trabajo periodístico.
3. Para cada seleccionado, traducí el título al español si está en inglés. El título debe sonar natural en español neutro latinoamericano, no como traducción literal.
4. Escribí un resumen de exactamente 1-2 oraciones en español neutro (sin jerga argentina ni mexicana), explicando POR QUÉ le importa a un periodista latinoamericano.
5. Generá también un prompt corto en inglés para crear una imagen editorial con IA (estilo foto periodística profesional, sin personas, sin texto, sin logotipos). Ejemplo: "Editorial flat lay of a smartphone showing analytics dashboard on a wooden desk, professional journalism workspace, warm natural light, shallow depth of field"

Respondé SOLO con JSON válido, sin markdown, sin explicaciones:
[
  {
    "titulo": "...",
    "fuente_nombre": "...",
    "fuente_url": "...",
    "resumen": "...",
    "imagen_prompt": "..."
  }
]`

  let message, lastErr
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      })
      break
    } catch (err) {
      lastErr = err
      if (err.status === 529 || err.status === 529) {
        const wait = Math.min(10000 * Math.pow(2, attempt), 120000)
        console.log(`⏳ API sobrecargada, reintentando en ${wait / 1000}s...`)
        await new Promise(r => setTimeout(r, wait))
      } else throw err
    }
  }
  if (!message) throw lastErr

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('Claude no devolvió JSON válido')
  }
}

// ── Las imágenes ──────────────────────────────────────────────────────────────
//
// Acá vivía `generarImagen()`, que le pedía la imagen a fal.ai. Ese proveedor se
// dio de baja el 2026-08-01 (commit 60e1978) y la función quedó devolviendo
// siempre `null` — pero el log seguía diciendo "🎨 Imagen generada", así que
// parecía andar. Se eliminó.
//
// Hoy: si la noticia trae imagen en su RSS, se usa esa. Si no, la fila queda con
// `imagen_url: null` y con su `imagen_prompt` guardado, que es lo que se pega en
// ChatGPT para hacerla a mano (ver ../../docs/CHATGPT-IMAGENES.md). Clara avisa
// al final cuántas quedaron sin imagen, para que no sea una sorpresa.

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🗞️  Clara arrancando...')

  // 1. Chequear si ya corrió hoy
  const hoy = new Date().toISOString().split('T')[0]
  const { data: yaExiste } = await supabase
    .from('news')
    .select('id')
    .gte('created_at', hoy + 'T00:00:00Z')
    .limit(1)

  if (yaExiste && yaExiste.length > 0) {
    console.log('✅ Clara ya entregó noticias hoy. Saliendo.')
    return
  }

  // 2. Traer todos los feeds en paralelo
  console.log('📡 Leyendo feeds RSS...')
  const feedsResults = await Promise.all(FUENTES.map(f => fetchFeed(f)))
  const todosLosItems = feedsResults.flat()
  console.log(`   ${todosLosItems.length} artículos recolectados de ${FUENTES.length} fuentes`)

  if (todosLosItems.length === 0) {
    console.log('⚠️  No se encontraron artículos. Saliendo.')
    return
  }

  // 2b. Deduplicar contra Supabase (últimos 14 días)
  const hace14dias = new Date(); hace14dias.setDate(hace14dias.getDate() - 14)
  const { data: recientes } = await supabase
    .from('news')
    .select('fuente_url')
    .gte('created_at', hace14dias.toISOString())
  const urlsYaVistas = new Set((recientes || []).map(r => r.fuente_url))
  const itemsNuevos = todosLosItems.filter(it => !urlsYaVistas.has(it.link))
  console.log(`   ${itemsNuevos.length} artículos nuevos (${todosLosItems.length - itemsNuevos.length} ya publicados antes)`)

  if (itemsNuevos.length === 0) {
    console.log('⚠️  Todas las noticias de hoy ya fueron publicadas. Saliendo.')
    return
  }

  // 3. Filtrar y resumir con Claude
  console.log('🧠 Filtrando y resumiendo con Claude...')
  const seleccionados = await filtrarYResumirConClaude(itemsNuevos)
  console.log(`   ${seleccionados.length} noticias seleccionadas`)

  // 4. Guardar en Supabase, con la imagen del RSS si la trae
  console.log('🖼️  Buscando la imagen de cada noticia en su RSS...')
  let sinImagen = 0

  for (const item of seleccionados) {
    // Buscar imagen original del feed primero
    const itemOriginal = itemsNuevos.find(
      i => i.link === item.fuente_url || i.titulo === item.titulo
    )
    const imagenUrl = itemOriginal?.imagen ?? null

    if (!imagenUrl) {
      sinImagen++
      console.log(`   🎨 Sin imagen, hay que hacerla a mano: ${item.titulo.slice(0, 50)}...`)
    }

    const { error } = await supabase.from('news').insert({
      titulo: item.titulo,
      resumen: item.resumen,
      fuente_nombre: item.fuente_nombre,
      fuente_url: item.fuente_url,
      imagen_url: imagenUrl,
      imagen_prompt: item.imagen_prompt,
      // Publicación directa: Jose decidió el 30/07 que las noticias no pasan
      // más por /admin/aprobaciones. El filtro de calidad es el de Claude.
      status: 'published',
      published_at: new Date().toISOString(),
    })

    if (error) {
      console.error(`   ❌ Error guardando "${item.titulo.slice(0, 40)}":`, error.message)
    } else {
      console.log(`   ✅ Publicada: ${item.titulo.slice(0, 60)}`)
    }
  }

  console.log('\n✨ Clara terminó. Las noticias ya están en vivo en /noticias')
  if (sinImagen) {
    console.log(`\n🎨 ${sinImagen} de ${seleccionados.length} salieron SIN imagen.`)
    console.log('   Su RSS no traía ninguna. El texto para pedírsela a ChatGPT está')
    console.log('   guardado en la columna `imagen_prompt` de cada fila de `news`.')
    console.log('   Cómo se hacen: ads-agent/docs/CHATGPT-IMAGENES.md')
  }

  // Actualizar state
  const statePath = resolvePath(process.cwd(), 'state/clara-state.json')
  const mañana = new Date(); mañana.setDate(mañana.getDate() + 1)
  writeFileSync(statePath, JSON.stringify({
    ultima_ejecucion: hoy,
    noticias_hoy: seleccionados.length,
    // Cuántas quedaron esperando una imagen hecha a mano. Si este número es
    // igual a `noticias_hoy` varios días seguidos, algo pasa con los feeds.
    sin_imagen: sinImagen,
    status: 'ok',
    proxima_ejecucion: mañana.toISOString().slice(0, 10),
    responsable: 'Dante',
    frecuencia: 'diaria',
    comando: 'node ads-agent/scripts/agentes/clara.mjs'
  }, null, 2))
}

main().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
