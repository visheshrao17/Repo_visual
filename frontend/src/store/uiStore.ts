import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

interface UIState {
  theme: ThemeMode
  sidebarOpen: boolean
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
}

function getInitialTheme(): ThemeMode {
  const stored = localStorage.getItem('repo-visualizer-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  sidebarOpen: false,
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('repo-visualizer-theme', nextTheme)
    set({ theme: nextTheme })
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
