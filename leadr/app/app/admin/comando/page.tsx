import type { Metadata } from 'next'
import ComandoClient from './comando-client'

export const metadata: Metadata = { title: 'Comando' }

export default function ComandoPage() {
  return <ComandoClient />
}
