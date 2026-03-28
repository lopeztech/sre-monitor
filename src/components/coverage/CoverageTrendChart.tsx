import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import type { CoverageHistoryPoint } from '@/types/coverage'
import { ChartTooltip } from '@/components/ui/chart-tooltip'

interface CoverageTrendChartProps {
  history: CoverageHistoryPoint[]
  threshold: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function CoverageTrendChart({ history, threshold }: CoverageTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          domain={[Math.max(0, Math.min(...history.map((h) => h.linesCoverage)) - 5), 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => `${v.toFixed(1)}%`} />}
          cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
        />
        <ReferenceLine
          y={threshold}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{ value: `${threshold}% target`, fill: '#f59e0b', fontSize: 10, position: 'right' }}
        />
        <Line
          type="monotone"
          dataKey="linesCoverage"
          name="Lines"
          stroke="#0ea5e9"
          strokeWidth={1.5}
          dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="branchesCoverage"
          name="Branches"
          stroke="#8b5cf6"
          strokeWidth={1.5}
          dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
