import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/api/client'
import type { GitHubUser, GitHubCallbackResponse, GitHubVerifyResponse } from '../../shared/types/auth'

const JWT_KEY = 'sre_monitor_github_jwt'
const USER_KEY = 'sre_monitor_github_user'
const RETURN_URL_KEY = 'sre_monitor_github_return_url'
const OAUTH_STATE_KEY = 'sre_monitor_github_state'

type GitHubAuthContextValue = {
  githubUser: GitHubUser | null
  isGitHubConnected: boolean
  isConnecting: boolean
  connectGitHub: () => void
  handleCallback: (code: string, state: string) => Promise<void>
  disconnectGitHub: () => void
}

const GitHubAuthContext = createContext<GitHubAuthContextValue | null>(null)

export function GitHubAuthProvider({ children }: { children: React.ReactNode }) {
  const [githubUser, setGitHubUser] = useState<GitHubUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // Verify stored JWT on mount — if GitHub token expired, re-initiate OAuth
  useEffect(() => {
    const jwt = localStorage.getItem(JWT_KEY)
    if (!jwt) return

    fetch('/api/auth/github/verify', {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token')
        return res.json() as Promise<GitHubVerifyResponse>
      })
      .then((data) => {
        setGitHubUser(data.user)
        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      })
      .catch(() => {
        // Token expired or invalid — clear and re-initiate OAuth
        localStorage.removeItem(JWT_KEY)
        localStorage.removeItem(USER_KEY)
        setGitHubUser(null)

        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
        if (clientId) {
          const state = crypto.randomUUID()
          sessionStorage.setItem(OAUTH_STATE_KEY, state)
          sessionStorage.setItem(RETURN_URL_KEY, window.location.pathname)

          const params = new URLSearchParams({
            client_id: clientId,
            scope: 'repo read:org read:packages',
            redirect_uri: `${window.location.origin}/auth/github/callback`,
            state,
          })
          window.location.href = `https://github.com/login/oauth/authorize?${params}`
        }
      })
  }, [])

  // Listen for token expiry events from the API client
  useEffect(() => {
    const handleExpired = () => setGitHubUser(null)
    window.addEventListener('github-auth-expired', handleExpired)
    return () => window.removeEventListener('github-auth-expired', handleExpired)
  }, [])

  const connectGitHub = useCallback(() => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    if (!clientId) {
      console.error('VITE_GITHUB_CLIENT_ID is not set')
      return
    }

    const state = crypto.randomUUID()
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
    sessionStorage.setItem(RETURN_URL_KEY, window.location.pathname)

    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'repo read:org read:packages',
      redirect_uri: `${window.location.origin}/auth/github/callback`,
      state,
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }, [])

  const handleCallback = useCallback(async (code: string, state: string) => {
    const storedState = sessionStorage.getItem(OAUTH_STATE_KEY)
    if (state !== storedState) {
      throw new Error('OAuth state mismatch — possible CSRF attack')
    }
    sessionStorage.removeItem(OAUTH_STATE_KEY)

    setIsConnecting(true)
    try {
      const data = await apiFetch<GitHubCallbackResponse>('/api/auth/github/callback', {
        method: 'POST',
        body: JSON.stringify({ code }),
      })

      localStorage.setItem(JWT_KEY, data.jwt)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setGitHubUser(data.user)
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectGitHub = useCallback(() => {
    localStorage.removeItem(JWT_KEY)
    localStorage.removeItem(USER_KEY)
    setGitHubUser(null)
  }, [])

  return (
    <GitHubAuthContext.Provider
      value={{
        githubUser,
        isGitHubConnected: !!githubUser,
        isConnecting,
        connectGitHub,
        handleCallback,
        disconnectGitHub,
      }}
    >
      {children}
    </GitHubAuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGitHubAuth() {
  const ctx = useContext(GitHubAuthContext)
  if (!ctx) throw new Error('useGitHubAuth must be used inside <GitHubAuthProvider>')
  return ctx
}

// eslint-disable-next-line react-refresh/only-export-components
export function getOAuthReturnUrl(): string {
  const url = sessionStorage.getItem(RETURN_URL_KEY) ?? '/'
  sessionStorage.removeItem(RETURN_URL_KEY)
  return url
}
