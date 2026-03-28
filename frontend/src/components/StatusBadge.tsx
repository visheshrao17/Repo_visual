import { normalizeStatus, statusColorClass } from '@/constants/status'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status?: string | null
  conclusion?: string | null
}

export function StatusBadge({ status, conclusion }: StatusBadgeProps) {
  const normalized = normalizeStatus(conclusion, status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide',
        statusColorClass(normalized),
      )}
    >
      {normalized}
    </span>
  )
}
