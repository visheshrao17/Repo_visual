import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-lg border border-white/20 bg-slate-950/35 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}
