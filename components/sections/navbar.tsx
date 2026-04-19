'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

function useViewerCount(city: string | null) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!city) return
    // Seed based on city name for consistency within session
    const seed = city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const base = 8 + (seed % 10) // 8–17
    setCount(base)
    const tick = () => {
      setCount(prev => {
        if (prev === null) return base
        const delta = Math.random() < 0.5 ? 1 : -1
        return Math.max(5, Math.min(20, prev + delta))
      })
    }
    const id = setInterval(tick, 4000 + Math.random() * 5000)
    return () => clearInterval(id)
  }, [city])

  return count
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const count = useViewerCount(city)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/location')
      .then(r => r.json())
      .then(d => { if (d?.city) setCity(d.city); else setCity('tu ciudad') })
      .catch(() => setCity('tu ciudad'))
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-xl bg-black/75 transition-shadow duration-300',
        scrolled && 'shadow-[0_8px_40px_rgba(0,0,0,.6)]'
      )}
    >
      {/* Pulsing live dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>

      <p className="text-[11px] md:text-xs text-zinc-300 leading-tight whitespace-nowrap">
        {count !== null && city ? (
          <>
            <strong className="text-white font-semibold">{count} personas</strong>
            {' de '}
            <strong className="text-white font-semibold">{city}</strong>
            {' están viendo esto'}
          </>
        ) : (
          <span className="text-zinc-500 animate-pulse">Detectando ubicación…</span>
        )}
      </p>
    </nav>
  )
}
