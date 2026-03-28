import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { api } from '@/services/api'

export function useRepoWorkflows(repoId: string, page: number, perPage: number) {
  return useQuery({
    queryKey: queryKeys.workflows(repoId, page, perPage),
    queryFn: () => api.listWorkflows(repoId, page, perPage),
    enabled: Boolean(repoId),
  })
}

export function useRepoRuns(repoId: string, page: number, perPage: number) {
  return useQuery({
    queryKey: queryKeys.runs(repoId, page, perPage),
    queryFn: () => api.listRuns(repoId, page, perPage),
    enabled: Boolean(repoId),
    refetchInterval: (query) => {
      const runs = query.state.data?.items ?? []
      const hasRunning = runs.some((run) => run.status?.toLowerCase().includes('in_progress'))
      return hasRunning ? 10_000 : false
    },
  })
}
