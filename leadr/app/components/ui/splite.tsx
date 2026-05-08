'use client'

import { Suspense, lazy, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  renderOnDemand?: boolean
}

export function SplineScene({ scene, className, renderOnDemand = false }: SplineSceneProps) {
  const [loaded, setLoaded] = useState(false)

  function handleLoad(app: any) {
    setLoaded(true)
    // Dispara scroll sintético para activar animaciones de entrada de Spline
    try {
      app?.setVariable?.('scroll', 1)
      app?.emitEvent?.('scroll', app?.findObjectByName?.('Scene'))
    } catch (_) {}
    // Fallback: simula un pequeño scroll en el canvas
    window.dispatchEvent(new Event('scroll'))
  }

  return (
    <div className="w-full h-full relative">
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 60% 40%, rgba(79,70,229,0.3) 0%, rgba(6,182,212,0.1) 40%, #000 70%)',
          opacity: loaded ? 0 : 1,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Suspense fallback={null}>
        <Spline
          scene={scene}
          className={className}
          renderOnDemand={renderOnDemand}
          onLoad={handleLoad}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s ease' }}
        />
      </Suspense>
    </div>
  )
}
