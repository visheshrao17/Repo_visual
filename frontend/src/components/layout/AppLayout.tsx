import type { PropsWithChildren } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[16rem_1fr]">
      <Sidebar />
      <div className="relative">
        <Navbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
