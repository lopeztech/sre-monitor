import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useEffect } from 'react'
import { useRegistryStore } from '@/store/registryStore'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/store/themeStore'

// Import routes
import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as registerRoute } from './routes/register'
import { Route as repoRoute } from './routes/app/$repoId'
import { Route as repoSettingsRoute } from './routes/app/$repoId.settings'

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
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppInner() {
  const seedDemoRepos = useRegistryStore((s) => s.seedDemoRepos)

  useEffect(() => {
    seedDemoRepos()
  }, [seedDemoRepos])

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppInner />
        </QueryClientProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
