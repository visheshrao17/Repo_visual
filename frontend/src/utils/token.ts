const TOKEN_KEY = 'repo-visualizer-token'

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token === 'undefined' || token === 'null' || !token) {
    return null
  }
  return token
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getTokenKey(): string {
  return TOKEN_KEY
}
