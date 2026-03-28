import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Brush,
} from 'recharts'
import type { CostDataPoint } from '@/types/costs'
import { formatCurrency } from '@/lib/formatters'
import { ChartTooltip } from '@/components/ui/chart-tooltip'
import type { CostRangePreset } from '@/store/uiStore'

interface CostTrendChartProps {
  data: CostDataPoint[]
  range: CostRangePreset
  customRange?: { start: string; end: string } | null
}

function filterByRange(data: CostDataPoint[], range: CostRangePreset, customRange?: { start: string; end: string } | null) {
  if (customRange) {
    return data.filter((d) => d.date >= customRange.start && d.date <= customRange.end)
  }
  const days = range === '30d' ? 30 : range === '60d' ? 60 : 90
  return data.slice(-days)
}

function formatXAxis(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function CostTrendChart({ data, range, customRange }: CostTrendChartProps) {
  const filtered = filterByRange(data, range, customRange)
  const avg = filtered.length > 0
    ? filtered.reduce((s, d) => s + d.amount, 0) / filtered.length
    : 0

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={filtered} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
          interval={Math.max(0, Math.floor(filtered.length / 6))}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
          cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }}
        />
        <ReferenceLine
          y={avg}
          stroke="#94a3b8"
          strokeDasharray="4 4"
          label={{ value: 'avg', fill: '#94a3b8', fontSize: 10, position: 'right' }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          name="Cost"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
        />
        {filtered.length > 14 && (
          <Brush
            dataKey="date"
            height={20}
            stroke="#64748b"
            fill="transparent"
            tickFormatter={formatXAxis}
            travellerWidth={8}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
