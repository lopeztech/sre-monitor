import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Route as rootRoute } from '../__root'
import { useRegistryStore } from '@/store/registryStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileCode2, GitBranch, Shield, BarChart2, DollarSign, FileText, Eye, EyeOff, Cloud, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSafeUrl } from '@/lib/url'
import { usePreferencesStore } from '@/store/preferencesStore'
import { apiFetch } from '@/api/client'
import type { CloudProvider, RegisteredRepository } from '@/types/repository'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/$repoId/settings',
  component: RepoSettingsPage,
})

function RepoSettingsPage() {
  const { repoId } = useParams({ from: '/app/$repoId/settings' })
  const navigate = useNavigate()
  const repositories = useRegistryStore((s) => s.repositories)
  const updateCloudProvider = useRegistryStore((s) => s.updateCloudProvider)
  const updateRepositoryAnalysis = useRegistryStore((s) => s.updateRepositoryAnalysis)
  const repo = repositories.find((r) => r.id === repoId)
  const [reanalyzing, setReanalyzing] = useState(false)

  const effectiveProvider = repo?.cloudProviderManual ?? repo?.analysis?.cloudProvider ?? 'unknown'
  const effectiveAccountId = repo?.cloudAccountIdManual ?? repo?.analysis?.cloudAccountId ?? ''
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>(effectiveProvider)
  const [accountId, setAccountId] = useState(effectiveAccountId)
  const [cloudSaved, setCloudSaved] = useState(false)

  const hasCloudChanges =
    selectedProvider !== effectiveProvider || accountId !== effectiveAccountId

  const handleSaveCloudProvider = () => {
    const provider = selectedProvider === 'unknown' ? undefined : selectedProvider
    const account = accountId.trim() || undefined
    updateCloudProvider(repoId, provider, account)
    setCloudSaved(true)
    setTimeout(() => setCloudSaved(false), 2000)
  }
  const handleReanalyze = async () => {
    if (!repo) return
    setReanalyzing(true)
    try {
      const result = await apiFetch<RegisteredRepository>('/api/repos/analyze', {
        method: 'POST',
        body: JSON.stringify({ url: repo.githubUrl }),
      })
      if (result.analysis) {
        updateRepositoryAnalysis(repoId, result.analysis)
      }
    } catch (err) {
      console.error('Re-analysis failed:', err)
    } finally {
      setReanalyzing(false)
    }
  }

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
          <CardHeader
            title="Analysis"
            subtitle={`Last analyzed: ${new Date(analysis.analyzedAt).toLocaleDateString()}`}
            action={
              <Button size="sm" variant="ghost" onClick={handleReanalyze} disabled={reanalyzing}>
                <RefreshCw size={13} className={reanalyzing ? 'animate-spin' : ''} />
                {reanalyzing ? 'Analyzing...' : 'Re-analyze'}
              </Button>
            }
          />
          <CardContent>
            <div className="space-y-4">
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

      {/* Cloud provider override */}
      <Card>
        <CardHeader
          title="Cloud Provider"
          subtitle={
            analysis?.cloudProvider && analysis.cloudProvider !== 'unknown'
              ? `Auto-detected: ${analysis.cloudProvider.toUpperCase()}. Override below if incorrect.`
              : 'No cloud provider detected. Select one to enable cost monitoring.'
          }
        />
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Cloud size={14} className="mt-2 flex-shrink-0 text-slate-400" />
              <div className="flex-1 space-y-3">
                <div>
                  <label htmlFor="cloud-provider" className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Provider
                  </label>
                  <select
                    id="cloud-provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as CloudProvider)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="unknown">Not set</option>
                    <option value="aws">AWS</option>
                    <option value="gcp">GCP</option>
                    <option value="azure">Azure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cloud-account-id" className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                    Account / Project ID
                  </label>
                  <input
                    id="cloud-account-id"
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    placeholder={
                      selectedProvider === 'aws'
                        ? '123456789012'
                        : selectedProvider === 'gcp'
                          ? 'my-project-id'
                          : selectedProvider === 'azure'
                            ? 'subscription-id'
                            : 'Select a provider first'
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              {cloudSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>
              )}
              <Button
                size="sm"
                onClick={handleSaveCloudProvider}
                disabled={!hasCloudChanges}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

    </div>
  )
}
