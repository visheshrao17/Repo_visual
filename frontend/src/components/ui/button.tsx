import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type Variant = 'default' | 'outline' | 'ghost' | 'danger'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-cyan-500 text-slate-900 hover:bg-cyan-400',
  outline: 'border border-white/30 bg-white/5 text-white hover:bg-white/10',
  ghost: 'text-slate-200 hover:bg-white/10',
  danger: 'bg-rose-500 text-white hover:bg-rose-400',
}

export function Button({ variant = 'default', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
