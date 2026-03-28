import { useEffect, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Github } from 'lucide-react'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { Button } from '@/components/ui/button'

function useQueryParams() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function Login() {
  const navigate = useNavigate()
  const params = useQueryParams()
  const setToken = useAuthStore((state) => state.setToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const pushToast = useToastStore((state) => state.pushToast)

  const code = params.get('code')
  const tokenFromQuery = params.get('token')

  const callbackMutation = useMutation({
    mutationFn: api.exchangeGithubCode,
    onSuccess: (response) => {
      setToken(response.access_token)
      pushToast({ title: 'Authentication successful', type: 'success' })
      navigate('/dashboard', { replace: true })
    },
    onError: (error) => {
      pushToast({
        title: 'Authentication failed',
        message: error.message,
        type: 'error',
      })
    },
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (tokenFromQuery) {
      setToken(tokenFromQuery)
      navigate('/dashboard', { replace: true })
      return
    }

    if (code && !callbackMutation.isPending && !callbackMutation.isSuccess) {
      callbackMutation.mutate(code)
    }
  }, [
    code,
    tokenFromQuery,
    callbackMutation,
    navigate,
    isAuthenticated,
    setToken,
  ])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md space-y-5 p-8 text-center">
        <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-100">
          Repository + DevOps + CI/CD Visualizer
        </p>
        <h1 className="text-3xl font-extrabold text-white">Ship with complete pipeline visibility</h1>
        <p className="text-sm text-slate-200">
          Connect your GitHub account to inspect repositories, workflow runs, job graphs, and logs.
        </p>

        <Button
          className="w-full"
          onClick={() => {
            window.location.href = api.oauthLoginUrl
          }}
          disabled={callbackMutation.isPending}
        >
          <Github className="size-4" />
          Login with GitHub
        </Button>
      </div>
    </div>
  )
}
