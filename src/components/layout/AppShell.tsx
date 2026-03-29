import { Outlet, useParams } from '@tanstack/react-router'
import { useUIStore } from '@/store/uiStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'

export function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  // Try to get repoId from route params if available
  let repoId: string | undefined
  try {
    const params = useParams({ strict: false })
    repoId = (params as Record<string, string>).repoId
  } catch {
    repoId = undefined
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div
        className={cn(
          'flex-shrink-0 transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header repoId={repoId} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
