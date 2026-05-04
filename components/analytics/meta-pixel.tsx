'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

export function MetaPixelEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a[href*="hotmart"]') as HTMLAnchorElement | null
      if (el && window.fbq) {
        window.fbq('track', 'InitiateCheckout')
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
