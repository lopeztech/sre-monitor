import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect, useRef } from 'react'
import { useRegistryStore } from '@/store/registryStore'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { GitHubAuthProvider } from '@/contexts/GitHubAuthContext'
import '@/store/themeStore'

// Import routes
import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as registerRoute } from './routes/register'
import { Route as repoRoute } from './routes/app/$repoId'
import { Route as repoSettingsRoute } from './routes/app/$repoId.settings'
import { Route as githubCallbackRoute } from './routes/auth/github/callback'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  registerRoute,
  repoRoute,
  repoSettingsRoute,
  githubCallbackRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppInner() {
  const { isGuest } = useAuth()
  const seedDemoRepos = useRegistryStore((s) => s.seedDemoRepos)
  const workerRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    if (isGuest) {
      seedDemoRepos()

      if (import.meta.env.VITE_USE_MOCKS === 'true') {
        import('./mocks/browser').then(({ worker }) => {
          worker.start({ onUnhandledRequest: 'bypass' })
          workerRef.current = worker
        })
      }
    } else if (workerRef.current) {
      workerRef.current.stop()
      workerRef.current = null
    }
  }, [isGuest, seedDemoRepos])

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <AuthProvider>
        <GitHubAuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppInner />
          </QueryClientProvider>
        </GitHubAuthProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
