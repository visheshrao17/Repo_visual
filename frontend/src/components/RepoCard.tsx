import { Lock, Globe2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Repository } from '@/types/domain'
import { formatDate } from '@/utils/date'

interface RepoCardProps {
  repo: Repository
  onOpen: (repo: Repository) => void
}

export function RepoCard({ repo, onOpen }: RepoCardProps) {
  return (
    <Card className="group transition hover:-translate-y-1 hover:border-cyan-400/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            {repo.owner}/{repo.repo_name}
          </h3>
          <p className="mt-1 text-sm text-slate-300">Updated {formatDate(repo.created_at)}</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-xs text-slate-300">
          {repo.is_private ? <Lock className="size-3" /> : <Globe2 className="size-3" />}
          {repo.is_private ? 'Private' : 'Public'}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <a href={repo.repo_url} target="_blank" rel="noreferrer" className="text-sm text-cyan-300 hover:text-cyan-200">
          Open on GitHub
        </a>
        <Button className="text-xs" onClick={() => onOpen(repo)}>
          View details
        </Button>
      </div>
    </Card>
  )
}
