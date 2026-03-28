import { PanelLeftClose, PanelLeftOpen, LogOut, User } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useRegistryStore } from '@/store/registryStore'
import { useAuth } from '@/contexts/AuthContext'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
  const { user, isGuest, logout } = useAuth()

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        {repo && (
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{repo.fullName}</h1>
            <StatusBadge
              status={repoStatusToHealth(repo.status)}
              label={repo.status === 'ready' ? 'Ready' : repo.status === 'analyzing' ? 'Analyzing' : 'Error'}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {isGuest ? (
          <Badge variant="muted">
            <User size={11} />
            Guest Mode
          </Badge>
        ) : user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-7 w-7 rounded-full ring-1 ring-slate-300 dark:ring-slate-700"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}

        {!isGuest && (
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{user?.name}</span>
        )}

        <button
          onClick={logout}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Sign out"
          title={isGuest ? 'Exit guest mode' : 'Sign out'}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
