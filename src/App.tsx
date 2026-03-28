import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { useRegistryStore } from '@/store/registryStore'

// Import routes
import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as registerRoute } from './routes/register'
import { Route as repoRoute } from './routes/app/$repoId'

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
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
