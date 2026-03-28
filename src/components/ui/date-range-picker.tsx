import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  startDate: string | null
  endDate: string | null
  onRangeChange: (start: string, end: string) => void
  onClear: () => void
  isActive: boolean
}

function formatInputDate(date: Date) {
  return date.toISOString().split('T')[0]
}

export function DateRangePicker({ startDate, endDate, onRangeChange, onClear, isActive }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [start, setStart] = useState(startDate ?? '')
  const [end, setEnd] = useState(endDate ?? '')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    setStart(startDate ?? '')
    setEnd(endDate ?? '')
  }, [startDate, endDate])

  const today = formatInputDate(new Date())
  const minDate = formatInputDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))

  function handleApply() {
    if (start && end && start <= end) {
      onRangeChange(start, end)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
          isActive
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
        )}
      >
        <Calendar size={12} />
        {isActive && startDate && endDate
          ? `${startDate.slice(5)} — ${endDate.slice(5)}`
          : 'Custom'}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Start date
              </label>
              <input
                type="date"
                value={start}
                min={minDate}
                max={end || today}
                onChange={(e) => setStart(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                End date
              </label>
              <input
                type="date"
                value={end}
                min={start || minDate}
                max={today}
                onChange={(e) => setEnd(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={!start || !end || start > end}
                className="flex-1 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
              {isActive && (
                <button
                  onClick={() => {
                    onClear()
                    setOpen(false)
                  }}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
