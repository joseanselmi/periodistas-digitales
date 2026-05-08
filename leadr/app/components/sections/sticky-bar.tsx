'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function StickyBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const bonus = document.getElementById('bonus')
      if (!bonus) return
      setShow(window.scrollY > bonus.offsetTop + bonus.offsetHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-7 px-6 py-3.5 border-t border-white/10 backdrop-blur-xl bg-black/85 transition-transform duration-300',
        show ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div>
        <p className="text-xs text-zinc-500 line-through">Valor total: $227 USD</p>
        <p className="text-xl font-bold text-green-400 tracking-tight">HOY solo $17 USD</p>
      </div>
      <a
        href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2" data-track="cta_sticky"
        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold text-sm px-6 py-3 rounded-full hover:scale-105 hover:shadow-[0_0_24px_rgba(34,197,94,.5)] transition-all duration-200 whitespace-nowrap"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        Quiero el acceso ahora
      </a>
    </div>
  )
}
