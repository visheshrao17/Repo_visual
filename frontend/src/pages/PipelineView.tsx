import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useParams } from 'react-router-dom'
import { PipelineGraph } from '@/components/pipeline/PipelineGraph'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/queryKeys'
import { useRepoRuns } from '@/hooks/useRepoDetails'
import { api } from '@/services/api'

const PER_PAGE = 20

export default function PipelineView() {
  const { repoId = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedRunId = searchParams.get('runId')
  const runsQuery = useRepoRuns(repoId, 1, PER_PAGE)

  const fallbackRunId = useMemo(() => runsQuery.data?.items[0]?.id, [runsQuery.data?.items])
  const runId = selectedRunId || fallbackRunId || ''

  const graphQuery = useQuery({
    queryKey: queryKeys.graph(runId),
    queryFn: () => api.getRunJobsGraph(runId),
    enabled: Boolean(runId),
    refetchInterval: 12_000,
  })

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pipeline graph</h2>
          <p className="text-sm text-slate-300">React Flow visualization for workflow job dependencies.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border border-white/20 bg-slate-950/30 px-3 py-2 text-sm"
            value={runId}
            onChange={(event) => setSearchParams({ runId: event.target.value })}
          >
            {(runsQuery.data?.items ?? []).map((run) => (
              <option key={run.id} value={run.id}>
                Run #{run.githubRunId}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => graphQuery.refetch()}>
            Refresh graph
          </Button>
        </div>
      </div>

      {graphQuery.isLoading && <Skeleton className="h-[560px] w-full" />}

      {graphQuery.isError && (
        <Card className="border-rose-300/40 bg-rose-500/10 text-rose-100">{graphQuery.error.message}</Card>
      )}

      {graphQuery.data && <PipelineGraph graph={graphQuery.data} />}
    </section>
  )
}
