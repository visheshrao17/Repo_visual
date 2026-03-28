import axios from 'axios'
import type { AxiosError } from 'axios'
import type { AuthResponse, PaginatedResponse } from '@/types/api'
import type { JobGraphResponse, Repository, RunLog, User, Workflow, WorkflowRun } from '@/types/domain'
import { getStoredToken } from '@/utils/token'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const message = error.response?.data?.detail || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

export const api = {
  oauthLoginUrl: `${apiBaseUrl}/auth/github/login`,

  async exchangeGithubCode(code: string) {
    const response = await apiClient.get<AuthResponse>('/auth/github/callback', {
      params: { code },
    })
    return response.data
  },

  async getMe() {
    const response = await apiClient.get<User>('/me')
    return response.data
  },

  async listRepositories(page: number, perPage: number) {
    const response = await apiClient.get<PaginatedResponse<Repository>>('/repos', {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  async syncRepositories(page: number, perPage: number) {
    const response = await apiClient.post<PaginatedResponse<Repository>>('/repos/sync', null, {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  async listWorkflows(repoId: string, page: number, perPage: number) {
    const response = await apiClient.get<PaginatedResponse<Workflow>>(`/repos/${repoId}/workflows`, {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  async listRuns(repoId: string, page: number, perPage: number) {
    const response = await apiClient.get<PaginatedResponse<WorkflowRun>>(`/repos/${repoId}/runs`, {
      params: { page, per_page: perPage },
    })
    return response.data
  },

  async triggerWorkflow(workflowId: string, branch = 'main') {
    const response = await apiClient.post<{ status: string }>(`/workflows/${workflowId}/trigger`, {
      branch,
    })
    return response.data
  },

  async getRunJobsGraph(runId: string) {
    const response = await apiClient.get<JobGraphResponse>(`/runs/${runId}/jobs`)
    return response.data
  },

  async getRunLogs(runId: string, refresh = false) {
    const response = await apiClient.get<RunLog>(`/runs/${runId}/logs`, {
      params: { refresh },
    })
    return response.data
  },
}
