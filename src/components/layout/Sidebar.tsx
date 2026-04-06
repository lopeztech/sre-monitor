import { Activity } from 'lucide-react'
import { useRegistryStore } from '@/store/registryStore'
import { useUIStore } from '@/store/uiStore'
import { RepoCard } from '@/components/repository/RepoCard'

export function Sidebar() {
  const repositories = useRegistryStore((s) => s.repositories)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Logo */}
      <div className="flex h-14 flex-shrink-0 items-center gap-2.5 border-b border-slate-200 px-4 dark:border-slate-800">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-sky-600">
          <Activity size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">SRE Monitor</span>
        )}
      </div>

      {/* Repo list */}
      <nav className="flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <p className="mb-1 px-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Repositories
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {repositories.map((repo) => (
            <li key={repo.id}>
              <RepoCard repo={repo} collapsed={collapsed} />
            </li>
          ))}
          {repositories.length === 0 && !collapsed && (
            <li className="px-2 py-3 text-center text-xs text-slate-500">
              No repos yet
            </li>
          )}
        </ul>
      </nav>

    </div>
  )
}
