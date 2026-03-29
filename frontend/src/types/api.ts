export interface PageMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PageMeta
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
