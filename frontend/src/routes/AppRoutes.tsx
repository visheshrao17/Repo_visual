import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/skeleton'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const RepoDetails = lazy(() => import('@/pages/RepoDetails'))
const PipelineView = lazy(() => import('@/pages/PipelineView'))
const LogsView = lazy(() => import('@/pages/LogsView'))

function PageFallback() {
  return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-full" />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/repo/:repoId"
            element={
              <AppLayout>
                <RepoDetails />
              </AppLayout>
            }
          />
          <Route
            path="/repo/:repoId/pipeline"
            element={
              <AppLayout>
                <PipelineView />
              </AppLayout>
            }
          />
          <Route
            path="/run/:runId/logs"
            element={
              <AppLayout>
                <LogsView />
              </AppLayout>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
