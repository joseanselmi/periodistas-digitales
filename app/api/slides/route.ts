import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOST = 'wbwfzsdhtbhkjlfuebrd.supabase.co'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url', { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse('URL not allowed', { status: 403 })
  }

  const res = await fetch(url)
  if (!res.ok) return new NextResponse('Failed to fetch slides', { status: 502 })

  const html = await res.text()

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
