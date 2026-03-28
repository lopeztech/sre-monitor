import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: {
    direction: 'up' | 'down' | 'stable'
    label: string
    positive?: boolean
  }
  status?: 'healthy' | 'warning' | 'critical' | 'unknown'
  loading?: boolean
  icon?: React.ReactNode
}

const statusBorder: Record<NonNullable<MetricCardProps['status']>, string> = {
  healthy: 'border-green-800',
  warning: 'border-amber-800',
  critical: 'border-red-800',
  unknown: 'border-slate-800',
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  status,
  loading,
  icon,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const trendColor =
    trend == null
      ? ''
      : trend.positive == null
        ? 'text-slate-400'
        : trend.positive
          ? 'text-green-400'
          : 'text-red-400'

  return (
    <Card className={cn(status && statusBorder[status])}>
      <CardContent className="pt-5">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {title}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', trendColor)}>
                {trend.direction === 'up' && <TrendingUp size={12} />}
                {trend.direction === 'down' && <TrendingDown size={12} />}
                {trend.direction === 'stable' && <Minus size={12} />}
                <span>{trend.label}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
