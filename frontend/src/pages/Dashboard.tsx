import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { RepoCard } from '@/components/RepoCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { queryKeys } from '@/constants/queryKeys'
import { useRepositories } from '@/hooks/useRepositories'
import { api } from '@/services/api'
import { useRepoStore } from '@/store/repoStore'
import { useToastStore } from '@/store/toastStore'

const PER_PAGE = 9

export default function Dashboard() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const setSelectedRepo = useRepoStore((state) => state.setSelectedRepo)
  const pushToast = useToastStore((state) => state.pushToast)
  const queryClient = useQueryClient()

  const reposQuery = useRepositories(page, PER_PAGE)

  const syncMutation = useMutation({
    mutationFn: () => api.syncRepositories(page, PER_PAGE),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.repos(page, PER_PAGE) })
      pushToast({ title: 'Repositories synced', type: 'success' })
    },
    onError: (error) => {
      pushToast({ title: 'Sync failed', message: error.message, type: 'error' })
    },
  })

  const filteredRepos = useMemo(() => {
    const list = reposQuery.data?.items ?? []
    if (!search.trim()) return list
    const query = search.trim().toLowerCase()
    return list.filter((repo) => `${repo.owner}/${repo.repoName}`.toLowerCase().includes(query))
  }, [reposQuery.data?.items, search])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Repositories</h2>
          <p className="text-sm text-slate-300">Search, paginate, and open repository CI/CD details.</p>
        </div>
        <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
          Sync repositories
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
        <Input
          placeholder="Search owner/repository"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
        />
      </div>

      {reposQuery.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36 w-full" />
          ))}
        </div>
      )}

      {reposQuery.isError && (
        <div className="rounded-lg border border-rose-300/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {reposQuery.error.message}
        </div>
      )}

      {!reposQuery.isLoading && !reposQuery.isError && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              onOpen={(selected) => {
                setSelectedRepo(selected)
                navigate(`/repo/${selected.id}`)
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
          Previous
        </Button>
        <span className="text-sm text-slate-200">Page {reposQuery.data?.page ?? page}</span>
        <Button
          variant="outline"
          onClick={() => setPage((value) => value + 1)}
          disabled={Boolean(reposQuery.data && page >= Math.ceil(reposQuery.data.total / reposQuery.data.pageSize))}
        >
          Next
        </Button>
      </div>
    </section>
  )
}
