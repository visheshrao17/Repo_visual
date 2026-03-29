export type UUID = string

export interface User {
  id: UUID
  githubId: string
  username: string
  email: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface Repository {
  id: UUID
  userId: UUID
  repoName: string
  owner: string
  repoUrl: string
  isPrivate: boolean
  createdAt: string
}

export interface Workflow {
  id: UUID
  repoId: UUID
  githubWorkflowId: string
  name: string
  state: string
  createdAt: string
}

export interface WorkflowRun {
  id: UUID
  workflowId: UUID
  githubRunId: string
  status: string | null
  conclusion: string | null
  branch: string | null
  commitSha: string | null
  startedAt: string | null
  completedAt: string | null
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
  runId: UUID
  content: string
  createdAt: string
}

export type StatusType = 'success' | 'failure' | 'running' | 'queued' | 'neutral'
