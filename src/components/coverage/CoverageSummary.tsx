import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatPercent } from '@/lib/formatters'
import type { CoverageSummary as CoverageSummaryType, CoverageMetric } from '@/types/coverage'
import { cn } from '@/lib/utils'

interface CoverageSummaryProps {
  data: CoverageSummaryType
}

function ProgressBar({
  label,
  metric,
  threshold,
}: {
  label: string
  metric: CoverageMetric
  threshold: number
}) {
  const pct = metric.percentage
  const passing = pct >= threshold

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            passing ? 'text-green-400' : 'text-red-400',
          )}
        >
          {formatPercent(pct)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn(
            'h-2 rounded-full transition-all',
            passing ? 'bg-green-500' : 'bg-red-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-500">
        {metric.covered.toLocaleString()} / {metric.total.toLocaleString()} covered
      </p>
    </div>
  )
}

export function CoverageSummary({ data }: CoverageSummaryProps) {
  const { defaultBranchCoverage: cov, status, threshold, delta } = data
  const deltaPositive = delta > 0

  return (
    <div className="space-y-5">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'passing' ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : (
            <XCircle size={16} className="text-red-400" />
          )}
          <span
            className={cn(
              'text-sm font-semibold',
              status === 'passing' ? 'text-green-400' : 'text-red-400',
            )}
          >
            {status === 'passing' ? 'Passing' : 'Below threshold'} — target {formatPercent(threshold, 0)}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 text-xs font-medium',
            deltaPositive ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-slate-400',
          )}
        >
          {delta > 0 && <TrendingUp size={12} />}
          {delta < 0 && <TrendingDown size={12} />}
          {delta === 0 && <Minus size={12} />}
          {delta > 0 ? '+' : ''}{formatPercent(delta)} vs last commit
        </div>
      </div>

      {/* Progress bars */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ProgressBar label="Lines" metric={cov.lines} threshold={threshold} />
        <ProgressBar label="Branches" metric={cov.branches} threshold={threshold} />
        <ProgressBar label="Functions" metric={cov.functions} threshold={threshold} />
        <ProgressBar label="Statements" metric={cov.statements} threshold={threshold} />
      </div>
    </div>
  )
}
