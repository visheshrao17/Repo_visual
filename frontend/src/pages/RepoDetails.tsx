import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { WorkflowCard } from '@/components/WorkflowCard'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/queryKeys'
import { useRepoRuns, useRepoWorkflows } from '@/hooks/useRepoDetails'
import { api } from '@/services/api'
import { useRepoStore } from '@/store/repoStore'
import { useToastStore } from '@/store/toastStore'
import type { WorkflowRun } from '@/types/domain'
import { formatDate } from '@/utils/date'

const PER_PAGE = 12

export default function RepoDetails() {
  const { repoId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [branch, setBranch] = useState('main')
  const selectedRepo = useRepoStore((state) => state.selectedRepo)
  const pushToast = useToastStore((state) => state.pushToast)

  const workflowsQuery = useRepoWorkflows(repoId, 1, PER_PAGE)
  const runsQuery = useRepoRuns(repoId, 1, PER_PAGE)

  const latestRunByWorkflow = useMemo(() => {
    const map = new Map<string, WorkflowRun>()
    for (const run of runsQuery.data?.items ?? []) {
      if (!map.has(run.workflowId)) map.set(run.workflowId, run)
    }
    return map
  }, [runsQuery.data?.items])

  const triggerMutation = useMutation({
    mutationFn: ({ workflowId, branchName }: { workflowId: string; branchName: string }) =>
      api.triggerWorkflow(workflowId, branchName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs(repoId, 1, PER_PAGE) })
      pushToast({ title: 'Workflow triggered', type: 'success' })
    },
    onError: (error) => {
      pushToast({ title: 'Failed to trigger workflow', message: error.message, type: 'error' })
    },
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Repository Details</h2>
          <p className="text-sm text-slate-300">
            {selectedRepo ? `${selectedRepo.owner}/${selectedRepo.repoName}` : repoId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="rounded-lg border border-white/20 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="branch"
          />
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.runs(repoId, 1, PER_PAGE) })}>
            Refresh runs
          </Button>
        </div>
      </div>

      <Card className="space-y-3">
        <h3 className="text-lg font-bold text-white">Workflow runs</h3>
        {runsQuery.isLoading && <Skeleton className="h-24 w-full" />}
        {runsQuery.data?.items.map((run) => (
          <div key={run.id} className="grid gap-2 rounded-lg border border-white/10 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="text-sm font-semibold text-white">Run #{run.githubRunId}</p>
              <p className="text-xs text-slate-300">Started: {formatDate(run.startedAt)}</p>
            </div>
            <StatusBadge status={run.status} conclusion={run.conclusion} />
            <div className="flex gap-2">
              <Button variant="ghost" className="text-xs" onClick={() => navigate(`/repo/${repoId}/pipeline?runId=${run.id}`)}>
                View pipeline
              </Button>
              <Link to={`/run/${run.id}/logs`}>
                <Button variant="ghost" className="text-xs">
                  View logs
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workflowsQuery.isLoading && Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-40 w-full" />)}

        {workflowsQuery.data?.items.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            latestRun={latestRunByWorkflow.get(workflow.id)}
            onTrigger={(workflowId) => triggerMutation.mutate({ workflowId, branchName: branch || 'main' })}
          />
        ))}
      </div>
    </section>
  )
}
