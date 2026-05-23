import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabaseAdmin.from('users').select('is_admin').eq('id', user.id).single()
  return data?.is_admin ? user : null
}

// ── RSS helpers ──────────────────────────────────────────────────────────────

const FUENTES = [
  { nombre: 'Nieman Lab',           url: 'https://www.niemanlab.org/feed/' },
  { nombre: 'Poynter',              url: 'https://www.poynter.org/feed/' },
  { nombre: 'Reuters Institute',    url: 'https://reutersinstitute.politics.ox.ac.uk/rss.xml' },
  { nombre: 'ICFJ',                 url: 'https://www.icfj.org/rss.xml' },
  { nombre: 'Press Gazette',        url: 'https://pressgazette.co.uk/feed/' },
  { nombre: 'Periodismo de Barrio', url: 'https://www.periodismodebarrio.org/feed/' },
  { nombre: 'Chequeado',            url: 'https://chequeado.com/feed/' },
  { nombre: 'FNPI',                 url: 'https://fundacion.fnpi.org/feed/' },
]

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return m ? (m[1] || m[2] || '').trim() : ''
}

function stripTags(str: string): string {
  return str.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#\d+;/g, '').trim()
}

function extractImageFromBlock(block: string): string | null {
  const media = block.match(/<media:content[^>]+url="([^"]+)"/i)
  if (media) return media[1]
  const enclosure = block.match(/<enclosure[^>]+url="([^"]+)"/i)
  if (enclosure) return enclosure[1]
  const imgTag = block.match(/<img[^>]+src="([^"]+)"/i)
  if (imgTag) return imgTag[1]
  return null
}

async function fetchFeed(fuente: { nombre: string; url: string }) {
  try {
    const res = await fetch(fuente.url, {
      headers: { 'User-Agent': 'Clara/1.0 (Leadr news curator)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: { titulo: string; link: string; descripcion: string; imagen: string | null; fuente: string }[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const titulo = stripTags(extractTag(block, 'title'))
      const link = extractTag(block, 'link') || extractTag(block, 'guid')
      const descripcion = stripTags(extractTag(block, 'description') || extractTag(block, 'content:encoded') || '')
      const imagen = extractImageFromBlock(block)
      if (titulo && link) items.push({ titulo, link: link.trim(), descripcion: descripcion.slice(0, 500), imagen, fuente: fuente.nombre })
      if (items.length >= 5) break
    }
    return items
  } catch {
    return []
  }
}

async function filtrarConClaude(items: { titulo: string; link: string; descripcion: string; fuente: string }[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Eres Clara, curadora editorial de Leadr, una plataforma para periodistas latinoamericanos.

Tenés esta lista de artículos recientes de medios especializados en periodismo:

${items.map((it, i) => `[${i + 1}] Fuente: ${it.fuente}\nTítulo: ${it.titulo}\nDescripción: ${it.descripcion}\nURL: ${it.link}`).join('\n\n')}

Tu tarea:
1. Seleccioná exactamente 5 artículos (o menos si no hay suficientes que califiquen).
2. Criterio: útil para periodistas latinoamericanos freelance o de medios independientes. Incluye: cambios de plataformas digitales, nuevas herramientas, modelos de negocio, desinformación, innovación en medios, periodismo de datos, IA en medios. EXCLUYE: catástrofes, política electoral, farándula, deportes, tragedias, crímenes.
3. Para cada seleccionado, traducí el título al español si está en inglés (español neutro latinoamericano).
4. Escribí un resumen de exactamente 1-2 oraciones en español neutro explicando POR QUÉ le importa a un periodista latinoamericano.
5. Generá un prompt en inglés para imagen editorial con IA (sin personas, sin texto, sin logotipos).

Respondé SOLO con JSON válido, sin markdown:
[{"titulo":"...","fuente_nombre":"...","fuente_url":"...","resumen":"...","imagen_prompt":"..."}]`,
      }],
    }),
  })
  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  try {
    return JSON.parse(text)
  } catch {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('Claude no devolvió JSON válido')
  }
}

async function generarImagen(prompt: string): Promise<string | null> {
  try {
    const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Editorial photography style. ${prompt}. No people, no faces, no text, no logos. Professional journalism aesthetic, clean composition.`,
        image_size: 'landscape_4_3',
        num_images: 1,
        num_inference_steps: 4,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.images?.[0]?.url ?? null
  } catch {
    return null
  }
}

async function runClara(req: Request): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization')
  const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (!isCron) {
    const user = await assertAdmin()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const hoy = new Date().toISOString().split('T')[0]

  // Chequear si ya corrió hoy
  const { data: yaExiste } = await supabaseAdmin
    .from('news')
    .select('id')
    .gte('created_at', hoy + 'T00:00:00Z')
    .limit(1)

  if (yaExiste && yaExiste.length > 0) {
    return NextResponse.json({ ok: true, message: 'Clara ya entregó noticias hoy', noticias: 0 })
  }

  // Traer feeds
  const feedsResults = await Promise.all(FUENTES.map(f => fetchFeed(f)))
  const todos = feedsResults.flat()

  if (todos.length === 0) {
    return NextResponse.json({ ok: false, message: 'No se encontraron artículos en los feeds' })
  }

  // Filtrar con Claude
  const seleccionados = await filtrarConClaude(todos)

  // Generar imágenes y guardar
  let saved = 0
  for (const item of seleccionados) {
    const itemOriginal = todos.find(i => i.link === item.fuente_url || i.titulo === item.titulo)
    let imagenUrl: string | null = itemOriginal?.imagen ?? null
    if (!imagenUrl && item.imagen_prompt) {
      imagenUrl = await generarImagen(item.imagen_prompt)
    }
    const { error } = await supabaseAdmin.from('news').insert({
      titulo: item.titulo,
      resumen: item.resumen,
      fuente_nombre: item.fuente_nombre,
      fuente_url: item.fuente_url,
      imagen_url: imagenUrl,
      imagen_prompt: item.imagen_prompt,
      status: 'draft',
    })
    if (!error) saved++
  }

  return NextResponse.json({ ok: true, noticias: seleccionados.length, saved })
}

// GET — usado por Vercel Cron (envía GET con Authorization: Bearer CRON_SECRET)
export async function GET(req: Request) {
  return runClara(req)
}

// POST — usado desde el panel admin (sesión de usuario)
export async function POST(req: Request) {
  return runClara(req)
}
