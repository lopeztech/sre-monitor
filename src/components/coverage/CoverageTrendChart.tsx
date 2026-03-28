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

interface CoverageTrendChartProps {
  history: CoverageHistoryPoint[]
  threshold: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}%
        </p>
      ))}
    </div>
  )
}

export function CoverageTrendChart({ history, threshold }: CoverageTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          domain={[Math.max(0, Math.min(...history.map((h) => h.linesCoverage)) - 5), 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
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
          activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="branchesCoverage"
          name="Branches"
          stroke="#8b5cf6"
          strokeWidth={1.5}
          dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
