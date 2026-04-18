'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-8 px-6 py-3 rounded-full border border-white/10 backdrop-blur-xl bg-black/70 transition-shadow duration-300',
        'w-[min(92vw,900px)]',
        scrolled && 'shadow-[0_8px_40px_rgba(0,0,0,.6)]'
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-sm tracking-tight text-white">
        <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_theme(colors.indigo.400)] animate-pulse" />
        Periodistas Digitales
      </div>
      <a
        href="https://pay.hotmart.com/H99593850B?checkoutMode=10&src=Landing-page-1&sck=b2"
        className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-400 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(34,197,94,.4)] transition-all duration-200 whitespace-nowrap"
      >
        Acceso por $17
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </nav>
  )
}
