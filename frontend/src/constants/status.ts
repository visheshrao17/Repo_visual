import type { StatusType } from '@/types/domain'

const successRegex = /success|completed/i
const failureRegex = /fail|error|cancel/i
const runningRegex = /run|progress/i
const queuedRegex = /queue|pending|waiting/i

export function normalizeStatus(input?: string | null, fallback?: string | null): StatusType {
  const value = `${input ?? ''} ${fallback ?? ''}`.trim().toLowerCase()
  if (!value) return 'neutral'
  if (successRegex.test(value)) return 'success'
  if (failureRegex.test(value)) return 'failure'
  if (runningRegex.test(value)) return 'running'
  if (queuedRegex.test(value)) return 'queued'
  return 'neutral'
}

export function statusColorClass(status: StatusType): string {
  switch (status) {
    case 'success':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    case 'failure':
      return 'bg-rose-500/15 text-rose-300 border-rose-500/40'
    case 'running':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/40'
    case 'queued':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40'
    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-400/30'
  }
}
