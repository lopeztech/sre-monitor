import { useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import type { CoverageFileEntry } from '@/types/coverage'
import { formatPercent } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface CoverageFileTableProps {
  files: CoverageFileEntry[]
  threshold: number
}

type SortKey = 'path' | 'lines' | 'branches' | 'functions'

function coverageColor(pct: number, threshold: number) {
  if (pct >= threshold) return 'text-green-400'
  if (pct >= threshold - 10) return 'text-amber-400'
  return 'text-red-400'
}

export function CoverageFileTable({ files, threshold }: CoverageFileTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('lines')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = [...files].sort((a, b) => {
    let diff = 0
    if (sortKey === 'path') diff = a.path.localeCompare(b.path)
    else if (sortKey === 'lines') diff = a.lines.percentage - b.lines.percentage
    else if (sortKey === 'branches') diff = a.branches.percentage - b.branches.percentage
    else if (sortKey === 'functions') diff = a.functions.percentage - b.functions.percentage
    return sortDir === 'asc' ? diff : -diff
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function SortHeader({ label, k }: { label: string; k: SortKey }) {
    return (
      <button
        onClick={() => handleSort(k)}
        className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
      >
        {label}
        <ArrowUpDown size={11} />
      </button>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="pb-2 text-left">
              <SortHeader label="File" k="path" />
            </th>
            <th className="pb-2 text-right">
              <SortHeader label="Lines" k="lines" />
            </th>
            <th className="pb-2 text-right">
              <SortHeader label="Branches" k="branches" />
            </th>
            <th className="pb-2 text-right">
              <SortHeader label="Functions" k="functions" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {sorted.map((file) => (
            <tr key={file.path} className="hover:bg-slate-800/30 transition-colors">
              <td className="py-2 pr-4">
                <p className="font-mono text-xs text-slate-300">{file.path}</p>
              </td>
              <td className={cn('py-2 pr-4 text-right text-xs font-semibold tabular-nums', coverageColor(file.lines.percentage, threshold))}>
                {formatPercent(file.lines.percentage)}
              </td>
              <td className={cn('py-2 pr-4 text-right text-xs font-semibold tabular-nums', coverageColor(file.branches.percentage, threshold))}>
                {formatPercent(file.branches.percentage)}
              </td>
              <td className={cn('py-2 text-right text-xs font-semibold tabular-nums', coverageColor(file.functions.percentage, threshold))}>
                {formatPercent(file.functions.percentage)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
