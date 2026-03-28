import { Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { VulnerabilitySummary } from '@/types/vulnerability'
import type { VulnerabilitySeverity } from '@/types/vulnerability'

interface SecurityScoreCardProps {
  data: VulnerabilitySummary
}

const severityOrder: VulnerabilitySeverity[] = ['critical', 'high', 'medium', 'low', 'informational']

const severityColor: Record<VulnerabilitySeverity, string> = {
  critical: 'text-red-600 dark:text-red-400',
  high: 'text-orange-600 dark:text-orange-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-blue-600 dark:text-blue-400',
  informational: 'text-slate-500 dark:text-slate-400',
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Poor'
}

export function SecurityScoreCard({ data }: SecurityScoreCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start gap-6">
          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <Shield size={20} className={scoreColor(data.securityScore)} />
            </div>
            <p className={cn('text-4xl font-bold tabular-nums', scoreColor(data.securityScore))}>
              {data.securityScore}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{scoreLabel(data.securityScore)}</p>
          </div>

          {/* Breakdown */}
          <div className="flex-1">
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              {data.openCount} open vulnerabilit{data.openCount === 1 ? 'y' : 'ies'}
            </p>
            <div className="space-y-2">
              {severityOrder.map((severity) => {
                const count = data.bySeverity[severity]
                if (count === 0) return null
                return (
                  <div key={severity} className="flex items-center gap-2">
                    <span className={cn('w-20 text-xs font-medium capitalize', severityColor[severity])}>
                      {severity}
                    </span>
                    <div className="flex-1 rounded-full bg-slate-100 h-1.5 dark:bg-slate-800">
                      <div
                        className={cn('h-1.5 rounded-full', {
                          'bg-red-500': severity === 'critical',
                          'bg-orange-500': severity === 'high',
                          'bg-amber-500': severity === 'medium',
                          'bg-blue-500': severity === 'low',
                          'bg-slate-400 dark:bg-slate-500': severity === 'informational',
                        })}
                        style={{ width: `${Math.min(100, (count / data.total) * 100)}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
