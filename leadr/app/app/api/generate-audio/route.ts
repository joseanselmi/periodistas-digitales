import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlidesHTML, type Slide, type BrandConfig } from '@/lib/slides-html'

const ELEVENLABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel — multilingual
const ELEVENLABS_MODEL = 'eleven_multilingual_v2'

function slideToNarration(slide: Slide): string {
  if (slide.notes) return slide.notes
  switch (slide.type) {
    case 'title':
      return [slide.heading, slide.subheading].filter(Boolean).join('. ')
    case 'content':
      return [slide.title, slide.subheading].filter(Boolean).join('. ')
    case 'bullets':
      return [slide.title, ...(slide.bullets ?? [])].filter(Boolean).join('. ')
    case 'quote':
      return slide.quote ? `${slide.quote}${slide.author ? `. — ${slide.author}` : ''}` : ''
    case 'resources':
      return [slide.title, ...(slide.items ?? [])].filter(Boolean).join('. ')
    default:
      return ''
  }
}

async function textToSpeech(text: string, apiKey: string): Promise<Buffer | null> {
  if (!text.trim()) return null

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  )

  if (!res.ok) return null
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users').select('is_admin').eq('id', user.id).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY no configurada' }, { status: 500 })

    const { classId, brandColors } = await req.json()
    if (!classId) return NextResponse.json({ error: 'classId requerido' }, { status: 400 })

    const { data: clase } = await supabase
      .from('classes').select('*').eq('id', classId).single()
    if (!clase) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
    if (!clase.slides_json) return NextResponse.json({ error: 'La clase no tiene slides_json guardado' }, { status: 400 })

    const slides = clase.slides_json as Slide[]
    const audioUrls: string[] = []

    // Generar MP3 por cada slide en paralelo (máx 10)
    const audioBuffers = await Promise.all(
      slides.map(slide => textToSpeech(slideToNarration(slide), apiKey))
    )

    // Subir MP3s a Supabase Storage
    for (let i = 0; i < audioBuffers.length; i++) {
      const buf = audioBuffers[i]
      if (!buf) { audioUrls.push(''); continue }

      const path = `classes/${classId}/slide-${i}.mp3`
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(path, buf, { contentType: 'audio/mpeg', upsert: true })

      if (uploadError) { audioUrls.push(''); continue }

      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(path)
      audioUrls.push(publicUrl)
    }

    // Re-generar HTML con audio embebido
    const brand: BrandConfig | undefined = brandColors ?? undefined
    const html = generateSlidesHTML(slides, brand, audioUrls)

    const timestamp = Date.now()
    const slidesPath = `classes/${classId}-audio-${timestamp}/index.html`
    await supabase.storage
      .from('slides')
      .upload(slidesPath, Buffer.from(html, 'utf-8'), {
        contentType: 'text/html',
        upsert: false,
      })

    const { data: { publicUrl: newSlidesUrl } } = supabase.storage
      .from('slides').getPublicUrl(slidesPath)

    // Actualizar clase con audio_urls y nueva slides_url
    const { error: updateError } = await supabase
      .from('classes')
      .update({ audio_urls: audioUrls, slides_url: newSlidesUrl })
      .eq('id', classId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    return NextResponse.json({ audioUrls, slidesUrl: newSlidesUrl })
  } catch (err) {
    console.error('generate-audio error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
