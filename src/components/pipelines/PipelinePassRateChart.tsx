import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import type { PipelineSummary } from '@/types/pipeline'

interface PipelinePassRateChartProps {
  summary: PipelineSummary
}

function buildChartData(summary: PipelineSummary) {
  // Build 7 days of aggregated pass/fail data from all workflows
  const days: Record<string, { date: string; pass: number; fail: number }> = {}
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    days[key] = { date: label, pass: 0, fail: 0 }
  }

  summary.workflows.forEach((wf) => {
    wf.recentRuns.forEach((run) => {
      const key = run.startedAt.split('T')[0]
      if (days[key]) {
        if (run.conclusion === 'success') days[key].pass++
        else if (run.conclusion === 'failure') days[key].fail++
      }
    })
  })

  return Object.values(days)
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

export function PipelinePassRateChart({ summary }: PipelinePassRateChartProps) {
  const data = buildChartData(summary)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
        />
        <Bar dataKey="pass" name="Pass" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="fail" name="Fail" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
