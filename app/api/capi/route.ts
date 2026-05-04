import { NextRequest, NextResponse } from 'next/server'

const PIXEL_ID = process.env.META_PIXEL_ID!
const CAPI_TOKEN = process.env.META_CAPI_TOKEN!
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_name, event_source_url, client_user_agent, fbc, fbp } = body

    // Get real client IP from Vercel headers
    const client_ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    const user_data: Record<string, string> = {
      client_ip_address: client_ip,
      client_user_agent: client_user_agent || 'unknown',
    }
    if (fbc) user_data.fbc = fbc
    if (fbp) user_data.fbp = fbp

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url,
          action_source: 'website',
          user_data,
        },
      ],
    }

    const res = await fetch(`${CAPI_URL}?access_token=${CAPI_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.ok ? 200 : 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
