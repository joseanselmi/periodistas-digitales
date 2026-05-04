'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : ''
}

async function sendCapi(event_name: string) {
  try {
    await fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name,
        event_source_url: window.location.href,
        client_user_agent: navigator.userAgent,
        fbc: getCookie('_fbc'),
        fbp: getCookie('_fbp'),
      }),
      keepalive: true,
    })
  } catch {}
}

export function MetaPixelEvents() {
  useEffect(() => {
    // Browser pixel PageView
    if (window.fbq) window.fbq('track', 'PageView')

    // Server-side CAPI PageView (redundant tracking)
    sendCapi('PageView')

    // InitiateCheckout on Hotmart link clicks
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a[href*="hotmart"]') as HTMLAnchorElement | null
      if (el) {
        if (window.fbq) window.fbq('track', 'InitiateCheckout')
        sendCapi('InitiateCheckout')
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
