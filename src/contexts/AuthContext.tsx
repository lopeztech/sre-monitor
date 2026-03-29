import { createContext, useContext, useState, useEffect } from 'react'
import { z } from 'zod'

const STORAGE_KEY = 'sre_monitor_user'
const GUEST_USER: User = { name: 'Guest', email: '', picture: null, sub: 'guest', isGuest: true }

const GoogleTokenPayloadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  picture: z.string().nullable().optional(),
  sub: z.string().min(1),
  iss: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
})

type User = {
  name: string
  email: string
  picture: string | null
  sub: string
  isGuest?: boolean
}

type AuthContextValue = {
  user: User | null
  login: (credentialResponse: { credential?: string }) => void
  loginAsGuest: () => void
  logout: () => void
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.isGuest) {
          setUser(GUEST_USER)
        } else {
          // Validate restored session has required fields
          const result = GoogleTokenPayloadSchema.safeParse(parsed)
          if (result.success) {
            setUser({
              name: result.data.name,
              email: result.data.email,
              picture: result.data.picture ?? null,
              sub: result.data.sub,
            })
          } else {
            // Corrupted session — clear it
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  function login(credentialResponse: { credential?: string }) {
    if (!credentialResponse.credential) return
    try {
      const parts = credentialResponse.credential.split('.')
      if (parts.length !== 3) {
        if (import.meta.env.DEV) console.error('Invalid JWT format')
        return
      }

      const payload = parts[1]
      const padded = payload + '=='.slice(0, (4 - (payload.length % 4)) % 4)
      const decoded = JSON.parse(atob(padded))

      // Validate token expiration
      const now = Math.floor(Date.now() / 1000)
      if (typeof decoded.exp === 'number' && decoded.exp < now) {
        if (import.meta.env.DEV) console.error('Token has expired')
        return
      }

      // Validate issuer (Google)
      if (decoded.iss && decoded.iss !== 'accounts.google.com' && decoded.iss !== 'https://accounts.google.com') {
        if (import.meta.env.DEV) console.error('Invalid token issuer')
        return
      }

      // Validate payload schema
      const result = GoogleTokenPayloadSchema.safeParse(decoded)
      if (!result.success) {
        if (import.meta.env.DEV) console.error('Invalid token payload:', result.error)
        return
      }

      // Store ONLY profile data — never the raw credential/JWT
      const userData: User = {
        name: result.data.name,
        email: result.data.email,
        picture: result.data.picture ?? null,
        sub: result.data.sub,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch {
      if (import.meta.env.DEV) console.error('Failed to decode credential')
    }
  }

  function loginAsGuest() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(GUEST_USER))
    setUser(GUEST_USER)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginAsGuest,
        logout,
        isAuthenticated: !!user,
        isGuest: !!user?.isGuest,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
