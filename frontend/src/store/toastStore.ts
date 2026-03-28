import { create } from 'zustand'

export type ToastType = 'info' | 'success' | 'error'

export interface ToastItem {
  id: string
  title: string
  message?: string
  type: ToastType
}

interface ToastState {
  toasts: ToastItem[]
  pushToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [{ id, ...toast }, ...state.toasts].slice(0, 4),
    }))
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
