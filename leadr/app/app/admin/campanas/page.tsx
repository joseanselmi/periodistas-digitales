import { Suspense } from 'react'
import CampanasClient from './campanas-client'

export default function CampanasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CampanasClient />
    </Suspense>
  )
}
