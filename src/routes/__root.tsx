import { createRootRoute } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import { useAuth } from '@/contexts/AuthContext'

function Root() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" />
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <AppShell />
}

export const Route = createRootRoute({
  component: Root,
})
