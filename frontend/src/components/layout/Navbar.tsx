import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

interface NavbarProps {
  title?: string
}

export function Navbar({ title = import.meta.env.VITE_APP_NAME || 'Repo Visualizer' }: NavbarProps) {
  const theme = useUIStore((state) => state.theme)
  const toggleTheme = useUIStore((state) => state.toggleTheme)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-4" />
          </Button>
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs text-slate-200 sm:block">
            {user?.username ?? 'Guest'}
          </div>
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="outline" className="text-xs" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
