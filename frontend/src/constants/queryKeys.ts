export const queryKeys = {
  me: ['me'] as const,
  repos: (page: number, perPage: number) => ['repos', page, perPage] as const,
  workflows: (repoId: string, page: number, perPage: number) =>
    ['workflows', repoId, page, perPage] as const,
  runs: (repoId: string, page: number, perPage: number) => ['runs', repoId, page, perPage] as const,
  graph: (runId: string) => ['graph', runId] as const,
  logs: (runId: string, refresh: boolean) => ['logs', runId, refresh] as const,
}
