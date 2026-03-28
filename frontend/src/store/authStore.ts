import { create } from 'zustand'
import { clearStoredToken, getStoredToken, setStoredToken } from '@/utils/token'
import type { User } from '@/types/domain'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),
  user: null,
  isAuthenticated: Boolean(getStoredToken()),
  setToken: (token) => {
    setStoredToken(token)
    set({ token, isAuthenticated: true })
  },
  setUser: (user) => set({ user }),
  logout: () => {
    clearStoredToken()
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
