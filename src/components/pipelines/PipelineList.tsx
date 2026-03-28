import { Clock, CheckCircle2, XCircle, Circle, SkipForward } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatRelativeTime } from '@/lib/formatters'
import type { PipelineWorkflow, PipelineRunConclusion } from '@/types/pipeline'
import { cn } from '@/lib/utils'

interface PipelineListProps {
  workflows: PipelineWorkflow[]
}

function RunDot({ conclusion }: { conclusion: PipelineRunConclusion }) {
  if (conclusion === 'success')
    return <CheckCircle2 size={14} className="text-green-500" />
  if (conclusion === 'failure')
    return <XCircle size={14} className="text-red-500" />
  if (conclusion === 'cancelled')
    return <Circle size={14} className="text-slate-500" />
  if (conclusion === 'skipped')
    return <SkipForward size={14} className="text-slate-500" />
  return <Circle size={14} className="text-slate-600" />
}

function passRateVariant(rate: number) {
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'danger'
}

export function PipelineList({ workflows }: PipelineListProps) {
  return (
    <div className="space-y-4">
      {workflows.map((wf) => (
        <Card key={wf.id}>
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-100">{wf.name}</p>
                <p className="text-xs text-slate-500">{wf.path}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={passRateVariant(wf.passRate7d)}>
                  {wf.passRate7d.toFixed(0)}% pass rate
                </Badge>
                <Badge variant="muted">
                  <Clock size={10} />
                  avg {formatDuration(wf.avgDurationSeconds)}
                </Badge>
              </div>
            </div>

            {/* Recent runs */}
            <div className="space-y-1.5">
              {wf.recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-800/50 transition-colors"
                >
                  <RunDot conclusion={run.conclusion} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-slate-200">{run.commitMessage}</p>
                    <p className="text-[10px] text-slate-500">
                      {run.actor} · {run.branch} ·{' '}
                      {run.durationSeconds ? formatDuration(run.durationSeconds) : 'in progress'}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-[10px] text-slate-500">
                    {formatRelativeTime(run.startedAt)}
                  </span>
                </div>
              ))}
            </div>

            {/* Run dots summary */}
            <div className="mt-3 flex items-center gap-1 border-t border-slate-800 pt-3">
              <p className="mr-2 text-xs text-slate-500">Last {wf.recentRuns.length} runs:</p>
              {wf.recentRuns.map((run) => (
                <span
                  key={run.id}
                  title={run.conclusion ?? 'in progress'}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    run.conclusion === 'success' ? 'bg-green-500' :
                    run.conclusion === 'failure' ? 'bg-red-500' :
                    run.conclusion === 'cancelled' ? 'bg-slate-500' :
                    'bg-slate-700',
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
