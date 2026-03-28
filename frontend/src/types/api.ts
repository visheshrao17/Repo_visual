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
  access_token: string
}

export interface ApiError {
  detail?: string
  message?: string
}
