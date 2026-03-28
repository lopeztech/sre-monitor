import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Route as rootRoute } from '../__root'
import { useRegistryStore } from '@/store/registryStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { ArrowLeft, Trash2, Server, FileCode2, GitBranch, Shield, BarChart2, DollarSign, FileText, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSafeUrl } from '@/lib/url'
import { usePreferencesStore } from '@/store/preferencesStore'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/$repoId/settings',
  component: RepoSettingsPage,
})

function RepoSettingsPage() {
  const { repoId } = useParams({ from: '/app/$repoId/settings' })
  const navigate = useNavigate()
  const repositories = useRegistryStore((s) => s.repositories)
  const removeRepository = useRegistryStore((s) => s.removeRepository)
  const repo = repositories.find((r) => r.id === repoId)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { getRepoPrefs, setDefaultTab, toggleTabVisibility } = usePreferencesStore()
  const prefs = getRepoPrefs(repoId)

  type TabId = 'costs' | 'pipelines' | 'security' | 'logs' | 'coverage'
  const dashboardTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'costs', label: 'Costs', icon: <DollarSign size={14} /> },
    { id: 'pipelines', label: 'Pipelines', icon: <GitBranch size={14} /> },
    { id: 'security', label: 'Security', icon: <Shield size={14} /> },
    { id: 'logs', label: 'Logs', icon: <FileText size={14} /> },
    { id: 'coverage', label: 'Coverage', icon: <BarChart2 size={14} /> },
  ]

  if (!repo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Repository not found.</p>
      </div>
    )
  }

  const analysis = repo.analysis

  const handleDelete = () => {
    removeRepository(repoId)
    navigate({ to: '/' })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/app/$repoId', params: { repoId } })}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Repository Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{repo.fullName}</p>
        </div>
      </div>

      {/* General info */}
      <Card>
        <CardHeader title="General" subtitle="Repository information" />
        <CardContent>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</dt>
              <dd className="text-sm text-slate-900 dark:text-slate-100">{repo.fullName}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">GitHub URL</dt>
              <dd>
                {isSafeUrl(repo.githubUrl) ? (
                <a
                  href={repo.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400"
                >
                  {repo.githubUrl}
                </a>
                ) : (
                  <span className="text-sm text-slate-500">{repo.githubUrl}</span>
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Default Branch</dt>
              <dd className="text-sm text-slate-900 dark:text-slate-100">{repo.defaultBranch}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</dt>
              <dd>
                <Badge variant={repo.status === 'ready' ? 'success' : repo.status === 'error' ? 'danger' : 'warning'}>
                  {repo.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Analysis details */}
      {analysis && (
        <Card>
          <CardHeader title="Analysis" subtitle={`Last analyzed: ${new Date(analysis.analyzedAt).toLocaleDateString()}`} />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Server size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cloud Provider</p>
                  <p className="text-sm text-slate-900 dark:text-slate-100">{analysis.cloudProvider.toUpperCase()}</p>
                  {analysis.cloudAccountId && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Account: {analysis.cloudAccountId}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCode2 size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Detected Stack</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {analysis.detectedStack.map((tech) => (
                      <Badge key={tech} variant="default" size="sm">{tech}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <GitBranch size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">GitHub Actions</p>
                    <Badge variant={analysis.hasGithubActions ? 'success' : 'muted'} size="sm">
                      {analysis.hasGithubActions ? 'Enabled' : 'Not found'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <Shield size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Dependabot</p>
                    <Badge variant={analysis.hasDependabot ? 'success' : 'muted'} size="sm">
                      {analysis.hasDependabot ? 'Enabled' : 'Not found'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <BarChart2 size={14} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Codecov</p>
                    <Badge variant={analysis.hasCodecov ? 'success' : 'muted'} size="sm">
                      {analysis.hasCodecov ? 'Enabled' : 'Not found'}
                    </Badge>
                  </div>
                </div>
              </div>

              {analysis.infraFiles.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Infrastructure Files</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.infraFiles.map((f) => (
                      <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard customization */}
      <Card>
        <CardHeader title="Dashboard" subtitle="Customize which tabs are visible and set defaults" />
        <CardContent>
          <div className="space-y-2">
            {dashboardTabs.map((tab) => {
              const isHidden = prefs.hiddenTabs.includes(tab.id)
              const isDefault = prefs.defaultTab === tab.id
              return (
                <div
                  key={tab.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400">{tab.icon}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{tab.label}</span>
                    {isDefault && (
                      <Badge variant="info" size="sm">Default</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isHidden && !isDefault && (
                      <button
                        onClick={() => setDefaultTab(repoId, tab.id)}
                        className="text-[10px] font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400"
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      onClick={() => toggleTabVisibility(repoId, tab.id)}
                      className={cn(
                        'rounded-md p-1.5 transition-colors',
                        isHidden
                          ? 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                      )}
                      title={isHidden ? 'Show tab' : 'Hide tab'}
                    >
                      {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
            Tip: Use keyboard shortcuts 1-5 to quickly switch between tabs on the dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Delete repository</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remove this repository and all its monitoring data.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Repository"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-semibold">{repo.fullName}</span>?
            This will remove all monitoring data and cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={13} />
              Delete Repository
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
