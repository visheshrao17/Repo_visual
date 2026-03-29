import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import type { Workflow, WorkflowRun } from '@/types/domain'
import { formatDate } from '@/utils/date'

interface WorkflowCardProps {
  workflow: Workflow
  latestRun?: WorkflowRun
  onTrigger: (workflowId: string) => void
}

export function WorkflowCard({ workflow, latestRun, onTrigger }: WorkflowCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">{workflow.name}</h3>
          <p className="text-sm text-slate-300">State: {workflow.state}</p>
        </div>
        <StatusBadge status={latestRun?.status} conclusion={latestRun?.conclusion} />
      </div>

      <div className="text-xs text-slate-300">
        Last run: {latestRun ? formatDate(latestRun.startedAt) : 'No runs yet'}
      </div>

      <Button variant="outline" className="w-full" onClick={() => onTrigger(workflow.id)}>
        Trigger workflow
      </Button>
    </Card>
  )
}
