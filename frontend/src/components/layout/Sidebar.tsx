import { Link, useLocation } from 'react-router-dom'
import { Home, GitBranch, FolderKanban, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/uiStore'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Repository', href: '/repo', icon: FolderKanban },
  { label: 'Pipeline', href: '/repo', icon: GitBranch },
]

export function Sidebar() {
  const location = useLocation()
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  return (
    <>
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 border-r border-white/10 bg-slate-950/95 p-4 transition-transform md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-6 flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-cyan-300">Navigation</span>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="size-4 text-slate-300" />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.label}
                to={item.href === '/repo' ? '/dashboard' : item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  active ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300 hover:bg-white/10',
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
