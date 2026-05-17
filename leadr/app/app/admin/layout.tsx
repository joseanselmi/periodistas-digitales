import type { Metadata } from 'next'
import AdminSidebar from './admin-sidebar'

export const metadata: Metadata = {
  title: { default: 'Admin — Leadr', template: '%s — Admin Leadr' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <AdminSidebar />
      <main className="flex-1 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
