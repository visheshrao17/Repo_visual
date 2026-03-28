import { useEffect } from 'react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/utils/cn'

const typeClasses = {
  info: 'border-sky-400/50 bg-sky-500/20',
  success: 'border-emerald-400/50 bg-emerald-500/20',
  error: 'border-rose-400/50 bg-rose-500/20',
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismissToast(toast.id)
      }, 3500),
    )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, dismissToast])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto animate-reveal rounded-lg border p-3 text-sm text-white shadow-lg backdrop-blur-md',
            typeClasses[toast.type],
          )}
        >
          <p className="font-semibold">{toast.title}</p>
          {toast.message && <p className="mt-1 text-xs text-slate-100/90">{toast.message}</p>}
        </div>
      ))}
    </div>
  )
}
