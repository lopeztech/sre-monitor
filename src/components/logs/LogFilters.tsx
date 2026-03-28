import { useState, useMemo } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import type { LogEntry, LogSeverity } from '@/types/logs'

const ranges = ['1h', '6h', '24h', '7d'] as const
const severities: LogSeverity[] = ['CRITICAL', 'ERROR', 'WARNING']

interface LogFiltersProps {
  entries?: LogEntry[]
  onFilterChange?: (filtered: LogEntry[]) => void
}

export function LogFilters({ entries, onFilterChange }: LogFiltersProps) {
  const { activeLogRange, setLogRange } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverities, setSelectedSeverities] = useState<Set<LogSeverity>>(new Set(severities))
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedEnv, setSelectedEnv] = useState<string>('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const services = useMemo(() => {
    if (!entries) return []
    return [...new Set(entries.map((e) => e.service))].sort()
  }, [entries])

  const environments = useMemo(() => {
    if (!entries) return []
    return [...new Set(entries.map((e) => e.environment))].sort()
  }, [entries])

  // Apply filters and notify parent
  useMemo(() => {
    if (!entries || !onFilterChange) return
    let filtered = entries

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          e.message.toLowerCase().includes(q) ||
          e.service.toLowerCase().includes(q) ||
          Object.values(e.metadata).some((v) => v.toLowerCase().includes(q)),
      )
    }

    if (selectedSeverities.size < severities.length) {
      filtered = filtered.filter((e) => selectedSeverities.has(e.severity))
    }

    if (selectedService) {
      filtered = filtered.filter((e) => e.service === selectedService)
    }

    if (selectedEnv) {
      filtered = filtered.filter((e) => e.environment === selectedEnv)
    }

    onFilterChange(filtered)
  }, [entries, searchQuery, selectedSeverities, selectedService, selectedEnv, onFilterChange])

  const toggleSeverity = (sev: LogSeverity) => {
    setSelectedSeverities((prev) => {
      const next = new Set(prev)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })
  }

  const hasActiveFilters = searchQuery || selectedSeverities.size < severities.length || selectedService || selectedEnv

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Time range selector */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setLogRange(range)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                activeLogRange === range
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Search box */}
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="h-7 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-7 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Advanced filter toggle */}
        <button
          onClick={() => setShowAdvanced((a) => !a)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
            showAdvanced || hasActiveFilters
              ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400'
              : 'border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          <Filter size={12} />
          Filters
          {hasActiveFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white">
              {(searchQuery ? 1 : 0) + (selectedSeverities.size < severities.length ? 1 : 0) + (selectedService ? 1 : 0) + (selectedEnv ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          {/* Severity filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Severity</span>
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors border',
                  selectedSeverities.has(sev)
                    ? sev === 'CRITICAL'
                      ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
                      : sev === 'ERROR'
                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        : 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    : 'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600',
                )}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Service filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Service</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="h-6 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All</option>
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Environment filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Env</span>
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="h-6 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All</option>
              {environments.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <>
              <div className="h-5 w-px bg-slate-300 dark:bg-slate-700" />
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSeverities(new Set(severities))
                  setSelectedService('')
                  setSelectedEnv('')
                }}
                className="text-[10px] font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
