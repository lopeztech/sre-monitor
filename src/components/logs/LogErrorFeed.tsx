import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/formatters'
import type { LogEntry, LogSeverity } from '@/types/logs'
import { cn } from '@/lib/utils'

interface LogErrorFeedProps {
  entries: LogEntry[]
}

const severityVariant: Record<LogSeverity, 'danger' | 'warning' | 'muted'> = {
  CRITICAL: 'danger',
  ERROR: 'warning',
  WARNING: 'muted',
}

function LogEntryRow({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false)
  const hasMetadata = Object.keys(entry.metadata).length > 0

  return (
    <div className="border-b border-slate-800/50 last:border-0">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
        disabled={!hasMetadata}
      >
        {hasMetadata ? (
          expanded ? (
            <ChevronDown size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
          ) : (
            <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
          )
        ) : (
          <span className="mt-0.5 w-3.5 flex-shrink-0" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={severityVariant[entry.severity]}>{entry.severity}</Badge>
            <span className="text-xs font-medium text-slate-300">{entry.service}</span>
            {entry.count > 1 && (
              <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                ×{entry.count}
              </span>
            )}
            <span className="ml-auto text-[10px] text-slate-500">
              {formatRelativeTime(entry.lastSeen)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-200">{entry.message}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {entry.environment} · first seen {formatRelativeTime(entry.firstSeen)}
          </p>
        </div>
      </button>

      {expanded && hasMetadata && (
        <div className="mx-4 mb-3 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Metadata
          </p>
          <dl className="space-y-1">
            {Object.entries(entry.metadata).map(([key, value]) => (
              <div key={key} className="flex gap-3">
                <dt className="w-32 flex-shrink-0 text-[11px] font-medium text-slate-400">{key}</dt>
                <dd className={cn('flex-1 text-[11px] text-slate-300 break-all font-mono')}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

export function LogErrorFeed({ entries }: LogErrorFeedProps) {
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">No log entries to display.</div>
    )
  }

  return (
    <div className="divide-y divide-slate-800/50">
      {entries.map((entry) => (
        <LogEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
