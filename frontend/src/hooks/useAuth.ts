import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)
  const setUser = useAuthStore((state) => state.setUser)

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const user = await api.getMe()
      setUser(user)
      return user
    },
    enabled: Boolean(token),
    retry: false,
    throwOnError: false,
    meta: { requiresAuth: true },
  })
}

export function useEnsureAuth() {
  const { isError } = useCurrentUser()
  const logout = useAuthStore((state) => state.logout)

  if (isError) logout()
}
