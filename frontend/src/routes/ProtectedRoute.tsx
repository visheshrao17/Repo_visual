import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentUser } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const meQuery = useCurrentUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (meQuery.isError) {
    logout()
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (meQuery.isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return <Outlet />
}