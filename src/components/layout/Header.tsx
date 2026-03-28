import { PanelLeftClose, PanelLeftOpen, User } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useRegistryStore } from '@/store/registryStore'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Badge } from '@/components/ui/badge'
import type { RepoStatus } from '@/types/repository'

interface HeaderProps {
  repoId?: string
}

function repoStatusToHealth(status: RepoStatus): 'healthy' | 'warning' | 'critical' | 'unknown' {
  if (status === 'ready') return 'healthy'
  if (status === 'analyzing') return 'warning'
  if (status === 'error') return 'critical'
  return 'unknown'
}

export function Header({ repoId }: HeaderProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const repositories = useRegistryStore((s) => s.repositories)
  const repo = repoId ? repositories.find((r) => r.id === repoId) : null

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {repo && (
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-slate-100">{repo.fullName}</h1>
            <StatusBadge
              status={repoStatusToHealth(repo.status)}
              label={repo.status === 'ready' ? 'Ready' : repo.status === 'analyzing' ? 'Analyzing' : 'Error'}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="muted">
          <User size={11} />
          Guest Mode
        </Badge>
      </div>
    </header>
  )
}
