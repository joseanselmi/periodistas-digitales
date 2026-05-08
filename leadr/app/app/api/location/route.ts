import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Vercel adds these headers automatically — no external API needed
  const city = req.headers.get('x-vercel-ip-city')
  const country = req.headers.get('x-vercel-ip-country-name') || req.headers.get('x-vercel-ip-country')

  if (city) {
    return NextResponse.json({
      city: decodeURIComponent(city),
      country: country ? decodeURIComponent(country) : null,
    })
  }

  return NextResponse.json({ city: null, country: null })
}
