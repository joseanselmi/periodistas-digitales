'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  renderOnDemand?: boolean
}

export function SplineScene({ scene, className, renderOnDemand = true }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <span className="loader" />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        renderOnDemand={renderOnDemand}
      />
    </Suspense>
  )
}
