import { cn } from '@/lib/utils'
import type { VulnerabilitySeverity } from '@/types/vulnerability'

interface SeverityBadgeProps {
  severity: VulnerabilitySeverity
}

const severityClasses: Record<VulnerabilitySeverity, string> = {
  critical: 'bg-red-950 text-red-400 border-red-800',
  high: 'bg-orange-950 text-orange-400 border-orange-800',
  medium: 'bg-amber-950 text-amber-400 border-amber-800',
  low: 'bg-blue-950 text-blue-400 border-blue-800',
  informational: 'bg-slate-800 text-slate-400 border-slate-700',
}

const severityLabel: Record<VulnerabilitySeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Info',
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold',
        severityClasses[severity],
      )}
    >
      {severityLabel[severity]}
    </span>
  )
}
