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
import type { CostDataPoint } from '@/types/costs'
import { formatCurrency } from '@/lib/formatters'

interface CostTrendChartProps {
  data: CostDataPoint[]
  range: '30d' | '60d' | '90d'
}

function filterByRange(data: CostDataPoint[], range: '30d' | '60d' | '90d') {
  const days = range === '30d' ? 30 : range === '60d' ? 60 : 90
  return data.slice(-days)
}

function formatXAxis(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-sky-400">
        {formatCurrency(payload[0].value as number)}
      </p>
    </div>
  )
}

export function CostTrendChart({ data, range }: CostTrendChartProps) {
  const filtered = filterByRange(data, range)

  // Calculate average for reference line
  const avg = filtered.reduce((s, d) => s + d.amount, 0) / filtered.length

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={filtered} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval={Math.floor(filtered.length / 6)}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avg}
          stroke="#334155"
          strokeDasharray="4 4"
          label={{ value: 'avg', fill: '#475569', fontSize: 10, position: 'right' }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#0ea5e9"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
