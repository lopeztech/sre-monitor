import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { ErrorRateDataPoint } from '@/types/logs'

interface ErrorRateChartProps {
  data: ErrorRateDataPoint[]
}

function formatHour(ts: string) {
  const d = new Date(ts)
  return `${d.getHours()}:00`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function ErrorRateChart({ data }: ErrorRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7f1d1d" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#7f1d1d" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatHour}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          interval={3}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="errorCount"
          name="Errors"
          stroke="#ef4444"
          strokeWidth={1.5}
          fill="url(#errorGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="criticalCount"
          name="Critical"
          stroke="#991b1b"
          strokeWidth={1.5}
          fill="url(#criticalGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
