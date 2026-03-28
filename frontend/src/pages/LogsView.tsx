import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { LogsTerminal } from '@/components/logs/LogsTerminal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { queryKeys } from '@/constants/queryKeys'
import { api } from '@/services/api'

export default function LogsView() {
  const { runId = '' } = useParams()

  const logsQuery = useQuery({
    queryKey: queryKeys.logs(runId, false),
    queryFn: () => api.getRunLogs(runId, false),
    enabled: Boolean(runId),
    retry: 2,
    refetchInterval: 10_000,
  })

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Run logs</h2>
          <p className="text-sm text-slate-300">Terminal view with automatic error highlighting.</p>
        </div>
        <Button variant="outline" onClick={() => logsQuery.refetch()}>
          Refresh logs
        </Button>
      </div>

      {logsQuery.isError && (
        <Card className="border-rose-300/40 bg-rose-500/10 text-sm text-rose-100">{logsQuery.error.message}</Card>
      )}

      {logsQuery.data && <LogsTerminal logs={logsQuery.data.content} />}
    </section>
  )
}
