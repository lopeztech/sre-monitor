import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { CostSummary as CostSummaryType } from '@/types/costs'

interface CostSummaryProps {
  data: CostSummaryType
}

export function CostSummary({ data }: CostSummaryProps) {
  const trendVariant =
    data.trend === 'up' ? 'danger' : data.trend === 'down' ? 'success' : 'muted'

  const trendIcon =
    data.trend === 'up' ? (
      <TrendingUp size={11} />
    ) : data.trend === 'down' ? (
      <TrendingDown size={11} />
    ) : (
      <Minus size={11} />
    )

  const trendLabel =
    data.trend === 'stable'
      ? 'Stable'
      : `${data.trend === 'up' ? '+' : '-'}${formatPercent(Math.abs(data.trendPercent))} vs last period`

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        title="Current Period"
        value={formatCurrency(data.currentPeriodTotal)}
        subtitle={`Provider: ${data.provider.toUpperCase()}`}
        icon={<DollarSign size={16} />}
        trend={{
          direction: data.trend,
          label: trendLabel,
          positive: data.trend === 'down',
        }}
      />
      <MetricCard
        title="Previous Period"
        value={formatCurrency(data.previousPeriodTotal)}
        icon={<DollarSign size={16} />}
      />
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Forecast (month-end)
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(data.forecastedMonthTotal)}
        </p>
        <Badge variant={trendVariant}>
          {trendIcon}
          {trendLabel}
        </Badge>
        {data.anomalies.length > 0 && (
          <div className="mt-1 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-900 dark:bg-red-950/40">
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              {data.anomalies.length} cost anomal{data.anomalies.length === 1 ? 'y' : 'ies'} detected
            </p>
            <p className="mt-0.5 text-xs text-red-500 dark:text-red-300/70">
              {data.anomalies[0].serviceName}: +{formatPercent(data.anomalies[0].percentageIncrease)} spike
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
