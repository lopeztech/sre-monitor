import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const ranges = ['1h', '6h', '24h', '7d'] as const

export function LogFilters() {
  const { activeLogRange, setLogRange } = useUIStore()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => setLogRange(range)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            activeLogRange === range
              ? 'bg-slate-700 text-slate-100'
              : 'text-slate-400 hover:text-slate-200',
          )}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
