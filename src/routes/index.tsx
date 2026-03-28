import { createRoute, Navigate } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useRegistryStore } from '@/store/registryStore'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Activity, PlusCircle } from 'lucide-react'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

function IndexPage() {
  const repositories = useRegistryStore((s) => s.repositories)

  if (repositories.length > 0) {
    return <Navigate to="/app/$repoId" params={{ repoId: repositories[0].id }} />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-600">
        <Activity size={28} className="text-white" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to SRE Monitor</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Add a GitHub repository to start monitoring costs, pipelines, security, and coverage.
        </p>
      </div>
      <Link to="/register">
        <Button>
          <PlusCircle size={16} />
          Add Repository
        </Button>
      </Link>
    </div>
  )
}
