export type UUID = string

export interface User {
  id: UUID
  github_id: string
  username: string
  email: string | null
  avatar_url: string | null
  created_at: string
}

export interface Repository {
  id: UUID
  user_id: UUID
  repo_name: string
  owner: string
  repo_url: string
  is_private: boolean
  created_at: string
}

export interface Workflow {
  id: UUID
  repo_id: UUID
  github_workflow_id: string
  name: string
  state: string
  created_at: string
}

export interface WorkflowRun {
  id: UUID
  workflow_id: UUID
  github_run_id: string
  status: string | null
  conclusion: string | null
  branch: string | null
  commit_sha: string | null
  started_at: string | null
  completed_at: string | null
}

export interface JobGraphNode {
  id: string
  status: string | null
}

export interface JobGraphEdge {
  source: string
  target: string
}

export interface JobGraphResponse {
  nodes: JobGraphNode[]
  edges: JobGraphEdge[]
}

export interface RunLog {
  id: UUID
  run_id: UUID
  content: string
  created_at: string
}

export type StatusType = 'success' | 'failure' | 'running' | 'queued' | 'neutral'
