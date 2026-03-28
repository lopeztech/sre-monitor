import { createRoute, useParams } from '@tanstack/react-router'
import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Badge } from '@/components/ui/badge'

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
  RefreshCw,
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'

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
  const { activeCostRange, setCostRange } = useUIStore()

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )

  if (error || !data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-3 text-sm text-slate-400">Failed to load cost data</p>
          <Button variant="secondary" size="sm" onClick={() => refetchCosts()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-6">
      <CostSummary data={data} />

      <Card>
        <CardHeader
          title="Daily Cost Trend"
          action={
            <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
              {(['30d', '60d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setCostRange(r)}
                  className={cn(
                    'rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
                    activeCostRange === r
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        />
        <CardContent>
          <CostTrendChart data={data.history} range={activeCostRange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Cost by Service" subtitle="Current vs previous period" />
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
                  className="rounded-lg border border-red-900 bg-red-950/30 p-4"
                >
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-red-300">{a.serviceName}</p>
                    <Badge variant="danger">+{formatPercent(a.percentageIncrease)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{a.description}</p>
                  <p className="mt-1 text-xs text-slate-500">
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

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )

  if (error || !data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-3 text-sm text-slate-400">Failed to load pipeline data</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="7-Day Pass/Fail"
          subtitle={`${data.overallPassRate7d.toFixed(1)}% overall pass rate`}
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

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )

  if (error || !data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-3 text-sm text-slate-400">Failed to load security data</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-6">
      <SecurityScoreCard data={data} />
      <Card>
        <CardHeader
          title="Vulnerabilities"
          subtitle={`${data.openCount} open · ${data.total} total`}
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

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )

  if (error || !data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-3 text-sm text-slate-400">Failed to load log data</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Error Rate"
          subtitle={`${data.totalErrors} errors, ${data.totalCritical} critical in last 24h`}
          action={<LogFilters />}
        />
        <CardContent>
          <ErrorRateChart data={data.errorRateHistory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Log Entries" subtitle={`Top services: ${data.topServices.map((s) => `${s.service} (${s.errorCount})`).join(', ')}`} />
        <LogErrorFeed entries={data.entries} />
      </Card>
    </div>
  )
}

function CoverageTab({ repoId }: { repoId: string }) {
  const { data, isLoading, error, refetch } = useCoverage(repoId)

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    )

  if (error || !data)
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-3 text-sm text-slate-400">Failed to load coverage data</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw size={13} /> Retry
          </Button>
        </CardContent>
      </Card>
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
        <CardHeader title="File Coverage" subtitle={`${data.files.length} files`} />
        <CardContent>
          <CoverageFileTable files={data.files} threshold={data.threshold} />
        </CardContent>
      </Card>
    </div>
  )
}

// ---- Main dashboard --------------------------------------------------------

function RepoDashboard() {
  const { repoId } = useParams({ from: '/app/$repoId' })
  const [activeTab, setActiveTab] = useState<TabId>('costs')
  const repositories = useRegistryStore((s) => s.repositories)
  const repo = repositories.find((r) => r.id === repoId)

  if (!repo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-slate-400">Repository not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview metrics row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <CostsOverviewCard repoId={repoId} />
        <PipelinesOverviewCard repoId={repoId} />
        <SecurityOverviewCard repoId={repoId} />
        <LogsOverviewCard repoId={repoId} />
        <CoverageOverviewCard repoId={repoId} />
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'costs' && <CostsTab repoId={repoId} />}
          {activeTab === 'pipelines' && <PipelinesTab repoId={repoId} />}
          {activeTab === 'security' && <SecurityTab repoId={repoId} />}
          {activeTab === 'logs' && <LogsTab repoId={repoId} />}
          {activeTab === 'coverage' && <CoverageTab repoId={repoId} />}
        </div>
      </div>
    </div>
  )
}
