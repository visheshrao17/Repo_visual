import { create } from 'zustand'
import type { Repository } from '@/types/domain'

interface RepoState {
  selectedRepo: Repository | null
  setSelectedRepo: (repo: Repository | null) => void
}

export const useRepoStore = create<RepoState>((set) => ({
  selectedRepo: null,
  setSelectedRepo: (repo) => set({ selectedRepo: repo }),
}))
