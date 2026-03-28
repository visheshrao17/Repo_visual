import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { api } from '@/services/api'

export function useRepositories(page: number, perPage: number) {
  return useQuery({
    queryKey: queryKeys.repos(page, perPage),
    queryFn: () => api.listRepositories(page, perPage),
    placeholderData: (prev) => prev,
  })
}
