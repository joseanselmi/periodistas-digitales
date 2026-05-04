'use client'

import Script from 'next/script'
import { useEffect } from 'react'

const PIXEL_ID = '1086780383211630'

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
    _fbq: unknown
  }
}

export function MetaPixel() {
  useEffect(() => {
    // InitiateCheckout on Hotmart link clicks
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a[href*="hotmart"]') as HTMLAnchorElement | null
      if (el && window.fbq) {
        window.fbq('track', 'InitiateCheckout')
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  )
}
