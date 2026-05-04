import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID!
const CAPI_TOKEN = process.env.META_CAPI_TOKEN!
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_name, event_source_url, client_ip, client_user_agent, fbc, fbp } = body

    const userData: Record<string, string> = {}
    if (client_ip) userData.client_ip_address = client_ip
    if (client_user_agent) userData.client_user_agent = client_user_agent
    if (fbc) userData.fbc = fbc
    if (fbp) userData.fbp = fbp

    // Hash IP for privacy
    if (client_ip) userData.client_ip_address = client_ip

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url,
          action_source: 'website',
          user_data: userData,
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
