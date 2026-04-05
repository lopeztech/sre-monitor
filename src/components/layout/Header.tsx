import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, LogOut, User, Unplug, Settings } from 'lucide-react'

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}
import { useUIStore } from '@/store/uiStore'
import { useRegistryStore } from '@/store/registryStore'
import { useAuth } from '@/contexts/AuthContext'
import { useGitHubAuth } from '@/contexts/GitHubAuthContext'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Dialog } from '@/components/ui/dialog'
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
  const { githubUser, isGitHubConnected, connectGitHub, disconnectGitHub } = useGitHubAuth()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
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

        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
        >
          {isGitHubConnected ? (
            <>
              <div className="relative">
                <img
                  src={githubUser!.avatar_url}
                  alt={githubUser!.login}
                  className="h-7 w-7 rounded-full ring-1 ring-slate-300 dark:ring-slate-700"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{githubUser!.login}</span>
            </>
          ) : isGuest ? (
            <>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                <User size={14} className="text-slate-500 dark:text-slate-400" />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block">Guest</span>
            </>
          ) : (
            <>
              {user?.picture ? (
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
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:block">{user?.name}</span>
            </>
          )}
          <Settings size={14} className="text-slate-400" />
        </button>
      </header>

      <Dialog open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="space-y-5">
          {/* Theme */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">Theme</p>
            <ThemeToggle />
          </div>

          {/* GitHub connection */}
          <div>
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">GitHub</p>
            {isGitHubConnected ? (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={githubUser!.avatar_url}
                      alt={githubUser!.login}
                      className="h-6 w-6 rounded-full ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <span className="text-sm text-slate-900 dark:text-slate-100">{githubUser!.login}</span>
                </div>
                <button
                  onClick={disconnectGitHub}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Unplug size={12} />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectGitHub}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600"
              >
                <GithubIcon size={16} />
                Connect GitHub
              </button>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              onClick={() => {
                setShowSettings(false)
                logout()
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950"
            >
              <LogOut size={14} />
              {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
