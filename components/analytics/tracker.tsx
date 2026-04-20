'use client'

import { useEffect, useRef } from 'react'

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('_sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_sid', sid)
  }
  return sid
}

function track(event_type: string, extra: Record<string, unknown> = {}) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, session_id: getSessionId(), ...extra }),
    keepalive: true,
  }).catch(() => {})
}

export function Tracker() {
  const scrollMilestones = useRef(new Set<number>())

  useEffect(() => {
    // Pageview
    track('pageview')

    // Scroll depth
    const onScroll = () => {
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      for (const milestone of [25, 50, 75, 90]) {
        if (pct >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone)
          track('scroll_depth', { scroll_depth: milestone })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // CTA clicks — delega por data-track attribute
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('[data-track]') as HTMLElement | null
      if (el) track('click', { element: el.dataset.track })
    }
    document.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
