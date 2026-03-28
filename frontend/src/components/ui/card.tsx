import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-white/10 bg-[rgb(var(--card))/0.07] p-4 shadow-soft backdrop-blur-sm', className)}
      {...props}
    />
  )
}
