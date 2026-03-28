import { cn } from '@/lib/utils'

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'

interface StatusBadgeProps {
  status: HealthStatus
  label?: string
}

const dotColor: Record<HealthStatus, string> = {
  healthy: 'bg-green-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  unknown: 'bg-slate-400 dark:bg-slate-500',
}

const textColor: Record<HealthStatus, string> = {
  healthy: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  critical: 'text-red-600 dark:text-red-400',
  unknown: 'text-slate-500 dark:text-slate-400',
}

const defaultLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  unknown: 'Unknown',
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', textColor[status])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[status])} />
      {label ?? defaultLabels[status]}
    </span>
  )
}
