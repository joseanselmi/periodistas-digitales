import { Suspense } from 'react'
import CampanaDetalleClient from './campana-detalle-client'

export default async function CampanaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CampanaDetalleClient id={id} />
    </Suspense>
  )
}
