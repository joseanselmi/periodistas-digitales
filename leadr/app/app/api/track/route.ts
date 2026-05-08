import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const VALID_EVENT_TYPES = new Set([
  'page_view', 'click', 'scroll', 'form_submit', 'video_play', 'video_pause',
  'section_view', 'cta_click', 'exit_intent', 'time_on_page',
])

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await req.json()
    const { event_type, session_id, element, scroll_depth } = body

    if (!event_type || !VALID_EVENT_TYPES.has(event_type)) {
      return NextResponse.json({ ok: false, error: 'event_type inválido' }, { status: 400 })
    }
    if (!session_id || !UUID_RE.test(session_id)) {
      return NextResponse.json({ ok: false, error: 'session_id inválido' }, { status: 400 })
    }

    const city = req.headers.get('x-vercel-ip-city')
    const country = req.headers.get('x-vercel-ip-country-name') || req.headers.get('x-vercel-ip-country')
    const ua = req.headers.get('user-agent') || ''
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

    await supabase.from('landing_events').insert({
      event_type,
      session_id,
      element: element || null,
      scroll_depth: scroll_depth || null,
      city: city ? decodeURIComponent(city) : null,
      country: country ? decodeURIComponent(country) : null,
      device,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
