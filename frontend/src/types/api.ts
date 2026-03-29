export interface PaginatedResponse<T> {
  page: number
  pageSize: number
  total: number
  items: T[]
}

export interface AuthResponse {
  token: string
  user: {
    id: string | number
    username: string
    email: string | null
    avatarUrl: string | null
  }
}

export interface ApiError {
  detail?: string
  message?: string
}
