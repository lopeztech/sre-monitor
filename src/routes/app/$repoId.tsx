import { createRoute, useParams } from '@tanstack/react-router'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { Route as rootRoute } from '../__root'
import { useRegistryStore } from '@/store/registryStore'
import { useUIStore } from '@/store/uiStore'
import { useCosts } from '@/hooks/useCosts'
import { usePipelines } from '@/hooks/usePipelines'
import { useVulnerabilities } from '@/hooks/useVulnerabilities'
import { useLogs } from '@/hooks/useLogs'
import { useCoverage } from '@/hooks/useCoverage'

// UI
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Badge } from '@/components/ui/badge'
import { ErrorState } from '@/components/ui/error-state'
import { EmptyState } from '@/components/ui/empty-state'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ExportButton } from '@/components/ui/export-button'
import {
  exportCostsByServiceCsv,
  exportPipelinesCsv,
  exportVulnerabilitiesCsv,
  exportLogsCsv,
  exportCoverageCsv,
} from '@/lib/export'

// Costs
import { CostSummary } from '@/components/costs/CostSummary'
import { CostTrendChart } from '@/components/costs/CostTrendChart'
import { CostByServiceTable } from '@/components/costs/CostByServiceTable'

// Pipelines
import { PipelineList } from '@/components/pipelines/PipelineList'
import { PipelinePassRateChart } from '@/components/pipelines/PipelinePassRateChart'

// Security
import { SecurityScoreCard } from '@/components/security/SecurityScoreCard'
import { VulnerabilityList } from '@/components/security/VulnerabilityList'

// Logs
import { LogErrorFeed } from '@/components/logs/LogErrorFeed'
import { ErrorRateChart } from '@/components/logs/ErrorRateChart'
import { LogFilters } from '@/components/logs/LogFilters'

// Coverage
import { CoverageSummary } from '@/components/coverage/CoverageSummary'
import { CoverageTrendChart } from '@/components/coverage/CoverageTrendChart'
import { CoverageFileTable } from '@/components/coverage/CoverageFileTable'

import {
  DollarSign,
  GitBranch,
  Shield,
  FileText,
  BarChart2,
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { usePreferencesStore } from '@/store/preferencesStore'
import { cn } from '@/lib/utils'
import {
  CostsTabSkeleton,
  PipelinesTabSkeleton,
  SecurityTabSkeleton,
  LogsTabSkeleton,
  CoverageTabSkeleton,
} from '@/components/ui/tab-skeleton'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/$repoId',
  component: RepoDashboard,
})

type TabId = 'costs' | 'pipelines' | 'security' | 'logs' | 'coverage'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'costs', label: 'Costs', icon: <DollarSign size={14} /> },
  { id: 'pipelines', label: 'Pipelines', icon: <GitBranch size={14} /> },
  { id: 'security', label: 'Security', icon: <Shield size={14} /> },
  { id: 'logs', label: 'Logs', icon: <FileText size={14} /> },
  { id: 'coverage', label: 'Coverage', icon: <BarChart2 size={14} /> },
]

// ---- Domain overview metric helpers ----------------------------------------

function CostsOverviewCard({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useCosts(repoId)

  if (isLoading)
    return <MetricCard title="Monthly Costs" value="..." loading icon={<DollarSign size={16} />} />
  if (error || !data)
    return (
      <MetricCard
        title="Monthly Costs"
        value="—"
        status="unknown"
        icon={<DollarSign size={16} />}
      />
    )

  return (
    <MetricCard
      title="Monthly Costs"
      value={formatCurrency(data.currentPeriodTotal)}
      subtitle={data.provider.toUpperCase()}
      icon={<DollarSign size={16} />}
      trend={{
        direction: data.trend,
        label: `${data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : ''}${formatPercent(Math.abs(data.trendPercent))}`,
        positive: data.trend === 'down',
      }}
      status={data.anomalies.length > 0 ? 'warning' : 'healthy'}
    />
  )
}

function PipelinesOverviewCard({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = usePipelines(repoId)

  if (isLoading)
    return <MetricCard title="Pipeline Pass Rate" value="..." loading icon={<GitBranch size={16} />} />
  if (error || !data)
    return (
      <MetricCard
        title="Pipeline Pass Rate"
        value="—"
        status="unknown"
        icon={<GitBranch size={16} />}
      />
    )

  const rate = data.overallPassRate7d
  const status = rate >= 90 ? 'healthy' : rate >= 70 ? 'warning' : 'critical'
  return (
    <MetricCard
      title="Pipeline Pass Rate"
      value={formatPercent(rate)}
      subtitle={`${data.failedRuns7d} failed / ${data.totalRuns7d} total (7d)`}
      icon={<GitBranch size={16} />}
      status={status}
    />
  )
}

function SecurityOverviewCard({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useVulnerabilities(repoId)

  if (isLoading)
    return <MetricCard title="Security Score" value="..." loading icon={<Shield size={16} />} />
  if (error || !data)
    return (
      <MetricCard
        title="Security Score"
        value="—"
        status="unknown"
        icon={<Shield size={16} />}
      />
    )

  const score = data.securityScore
  const status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical'
  return (
    <MetricCard
      title="Security Score"
      value={String(score)}
      subtitle={`${data.openCount} open vulnerabilities`}
      icon={<Shield size={16} />}
      status={status}
    />
  )
}

function LogsOverviewCard({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useLogs(repoId)

  if (isLoading)
    return <MetricCard title="Errors (24h)" value="..." loading icon={<FileText size={16} />} />
  if (error || !data)
    return (
      <MetricCard
        title="Errors (24h)"
        value="—"
        status="unknown"
        icon={<FileText size={16} />}
      />
    )

  const status =
    data.totalCritical > 0 ? 'critical' : data.totalErrors > 20 ? 'warning' : 'healthy'
  return (
    <MetricCard
      title="Errors (24h)"
      value={String(data.totalErrors)}
      subtitle={`${data.totalCritical} critical`}
      icon={<FileText size={16} />}
      status={status}
    />
  )
}

function CoverageOverviewCard({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = useCoverage(repoId)

  if (isLoading)
    return (
      <MetricCard
        title="Code Coverage"
        value="..."
        loading
        icon={<BarChart2 size={16} />}
      />
    )
  if (error || !data)
    return (
      <MetricCard
        title="Code Coverage"
        value="—"
        status="unknown"
        icon={<BarChart2 size={16} />}
      />
    )

  const pct = data.defaultBranchCoverage.lines.percentage
  const status = data.status === 'passing' ? 'healthy' : 'warning'
  return (
    <MetricCard
      title="Code Coverage"
      value={formatPercent(pct)}
      subtitle={`Threshold: ${formatPercent(data.threshold, 0)}`}
      icon={<BarChart2 size={16} />}
      status={status}
      trend={{
        direction: data.delta > 0 ? 'up' : data.delta < 0 ? 'down' : 'stable',
        label: `${data.delta > 0 ? '+' : ''}${formatPercent(data.delta)} vs last commit`,
        positive: data.delta >= 0,
      }}
    />
  )
}

// ---- Tab panels ------------------------------------------------------------

function CostsTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch: refetchCosts } = useCosts(repoId)
  const { activeCostRange, setCostRange, customCostRange, setCustomCostRange, clearCustomCostRange } = useUIStore()

  if (isLoading) return <CostsTabSkeleton />

  if (error || !data)
    return (
      <ErrorState
        title="Failed to load cost data"
        description="We couldn't fetch cloud cost information. Check your provider configuration and try again."
        onRetry={() => refetchCosts()}
      />
    )

  if (data.history.length === 0)
    return (
      <EmptyState
        icon={<DollarSign size={22} />}
        title="No cost data available"
        description="Cost data will appear here once your cloud provider is connected and billing data is synced."
      />
    )

  return (
    <div className="space-y-6">
      <CostSummary data={data} />

      <Card>
        <CardHeader
          title="Daily Cost Trend"
          action={
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              {(['30d', '60d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setCostRange(r)}
                  className={cn(
                    'rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
                    activeCostRange === r && !customCostRange
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                  )}
                >
                  {r}
                </button>
              ))}
              <div className="mx-0.5 h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <DateRangePicker
                startDate={customCostRange?.start ?? null}
                endDate={customCostRange?.end ?? null}
                onRangeChange={setCustomCostRange}
                onClear={clearCustomCostRange}
                isActive={!!customCostRange}
              />
            </div>
          }
        />
        <CardContent>
          <CostTrendChart data={data.history} range={activeCostRange} customRange={customCostRange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Cost by Service"
          subtitle="Current vs previous period"
          action={
            <ExportButton onClick={() => exportCostsByServiceCsv(data.byService)} />
          }
        />
        <CardContent>
          <CostByServiceTable services={data.byService} />
        </CardContent>
      </Card>

      {data.anomalies.length > 0 && (
        <Card>
          <CardHeader title="Cost Anomalies" />
          <CardContent>
            <div className="space-y-3">
              {data.anomalies.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-red-600 dark:text-red-300">{a.serviceName}</p>
                    <Badge variant="danger">+{formatPercent(a.percentageIncrease)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.description}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Expected {formatCurrency(a.expectedAmount)} · Actual{' '}
                    {formatCurrency(a.actualAmount)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PipelinesTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch } = usePipelines(repoId)

  if (isLoading) return <PipelinesTabSkeleton />

  if (error || !data)
    return (
      <ErrorState
        title="Failed to load pipeline data"
        description="We couldn't fetch CI/CD pipeline information. Ensure GitHub Actions is enabled for this repository."
        onRetry={() => refetch()}
      />
    )

  if (data.workflows.length === 0)
    return (
      <EmptyState
        icon={<GitBranch size={22} />}
        title="No pipelines found"
        description="Add GitHub Actions workflows to this repository to start tracking pipeline performance."
      />
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="7-Day Pass/Fail"
          subtitle={`${data.overallPassRate7d.toFixed(1)}% overall pass rate`}
          action={<ExportButton onClick={() => exportPipelinesCsv(data.workflows)} />}
        />
        <CardContent>
          <PipelinePassRateChart summary={data} />
        </CardContent>
      </Card>

      <PipelineList workflows={data.workflows} />
    </div>
  )
}

function SecurityTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch } = useVulnerabilities(repoId)

  if (isLoading) return <SecurityTabSkeleton />

  if (error || !data)
    return (
      <ErrorState
        title="Failed to load security data"
        description="We couldn't fetch vulnerability information. Ensure Dependabot is enabled for this repository."
        onRetry={() => refetch()}
      />
    )

  if (data.vulnerabilities.length === 0)
    return (
      <EmptyState
        icon={<Shield size={22} />}
        title="No vulnerabilities found"
        description="Great news! No security vulnerabilities were detected. Enable Dependabot alerts to keep monitoring."
      />
    )

  return (
    <div className="space-y-6">
      <SecurityScoreCard data={data} />
      <Card>
        <CardHeader
          title="Vulnerabilities"
          subtitle={`${data.openCount} open · ${data.total} total`}
          action={<ExportButton onClick={() => exportVulnerabilitiesCsv(data.vulnerabilities)} />}
        />
        <CardContent>
          <VulnerabilityList vulnerabilities={data.vulnerabilities} />
        </CardContent>
      </Card>
    </div>
  )
}

function LogsTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch } = useLogs(repoId)
  const [filteredEntries, setFilteredEntries] = useState(data?.entries ?? [])
  const handleFilterChange = useCallback((entries: typeof filteredEntries) => {
    setFilteredEntries(entries)
  }, [])

  if (isLoading) return <LogsTabSkeleton />

  if (error || !data)
    return (
      <ErrorState
        title="Failed to load log data"
        description="We couldn't fetch log information. Check your cloud logging provider configuration."
        onRetry={() => refetch()}
      />
    )

  if (data.entries.length === 0 && data.totalErrors === 0)
    return (
      <EmptyState
        icon={<FileText size={22} />}
        title="No errors detected"
        description="No errors found in the selected time range. Your services are running smoothly."
        action={<LogFilters />}
      />
    )

  return (
    <div className="space-y-6">
      <LogFilters entries={data.entries} onFilterChange={handleFilterChange} />

      <Card>
        <CardHeader
          title="Error Rate"
          subtitle={`${data.totalErrors} errors, ${data.totalCritical} critical in last 24h`}
        />
        <CardContent>
          <ErrorRateChart data={data.errorRateHistory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Log Entries"
          subtitle={filteredEntries.length !== data.entries.length
            ? `Showing ${filteredEntries.length} of ${data.entries.length} entries`
            : `Top services: ${data.topServices.map((s) => `${s.service} (${s.errorCount})`).join(', ')}`
          }
          action={<ExportButton onClick={() => exportLogsCsv(filteredEntries)} />}
        />
        <LogErrorFeed entries={filteredEntries} />
      </Card>
    </div>
  )
}

function CoverageTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch } = useCoverage(repoId)

  if (isLoading) return <CoverageTabSkeleton />

  if (error || !data)
    return (
      <ErrorState
        title="Failed to load coverage data"
        description="We couldn't fetch code coverage information. Ensure a coverage provider (Codecov, GitHub Actions) is configured."
        onRetry={() => refetch()}
      />
    )

  if (data.files.length === 0)
    return (
      <EmptyState
        icon={<BarChart2 size={22} />}
        title="No coverage data available"
        description="Set up code coverage reporting in your CI pipeline to start tracking test coverage."
      />
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Coverage Summary" subtitle={`Provider: ${data.provider}`} />
        <CardContent>
          <CoverageSummary data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Coverage Trend" subtitle="Lines and branches coverage over last commits" />
        <CardContent>
          <CoverageTrendChart history={data.history} threshold={data.threshold} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="File Coverage"
          subtitle={`${data.files.length} files`}
          action={<ExportButton onClick={() => exportCoverageCsv(data.files)} />}
        />
        <CardContent>
          <CoverageFileTable files={data.files} threshold={data.threshold} />
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Main dashboard --------------------------------------------------------

const OVERVIEW_CARDS: Record<TabId, React.FC<{ repoId: string }>> = {
  costs: CostsOverviewCard,
  pipelines: PipelinesOverviewCard,
  security: SecurityOverviewCard,
  logs: LogsOverviewCard,
  coverage: CoverageOverviewCard,
}

const TAB_PANELS: Record<TabId, React.FC<{ repoId: string }>> = {
  costs: CostsTab,
  pipelines: PipelinesTab,
  security: SecurityTab,
  logs: LogsTab,
  coverage: CoverageTab,
}

function RepoDashboard() {
  const { repoId } = useParams({ from: '/app/$repoId' })
  const repositories = useRegistryStore((s) => s.repositories)
  const repo = repositories.find((r) => r.id === repoId)
  const { getRepoPrefs, setDefaultTab, cardOrder } = usePreferencesStore()
  const prefs = getRepoPrefs(repoId)
  const [activeTab, setActiveTab] = useState<TabId>(prefs.defaultTab)

  // Filter visible tabs
  const visibleTabs = useMemo(
    () => TABS.filter((t) => !prefs.hiddenTabs.includes(t.id)),
    [prefs.hiddenTabs],
  )

  // Reorder overview cards based on preferences
  const orderedCards = useMemo(
    () => cardOrder.filter((id) => !prefs.hiddenTabs.includes(id)),
    [cardOrder, prefs.hiddenTabs],
  )

  // Keyboard shortcuts: 1-5 for tab switching
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= visibleTabs.length) {
        setActiveTab(visibleTabs[num - 1].id)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [visibleTabs])

  if (!repo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Repository not found.</p>
      </div>
    )
  }

  const handleSetDefault = (tab: TabId) => {
    setDefaultTab(repoId, tab)
    setActiveTab(tab)
  }

  const ActivePanel = TAB_PANELS[activeTab]

  return (
    <div className="p-6 space-y-6">
      {/* Overview metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {orderedCards.map((id) => {
          const CardComponent = OVERVIEW_CARDS[id]
          return <CardComponent key={id} repoId={repoId} />
        })}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
          {visibleTabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onDoubleClick={() => handleSetDefault(tab.id)}
              title={prefs.defaultTab === tab.id ? `${tab.label} (default) — press ${idx + 1}` : `${tab.label} — press ${idx + 1} · double-click to set as default`}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {tab.icon}
              {tab.label}
              {prefs.defaultTab === tab.id && (
                <span className="ml-1 h-1 w-1 rounded-full bg-sky-500" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <ActivePanel repoId={repoId} />
        </div>
      </div>
    </div>
  )
}
