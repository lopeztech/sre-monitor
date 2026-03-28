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
import { ChartTooltip } from '@/components/ui/chart-tooltip'

interface PipelinePassRateChartProps {
  summary: PipelineSummary
}

function buildChartData(summary: PipelineSummary) {
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

export function PipelinePassRateChart({ summary }: PipelinePassRateChartProps) {
  const data = buildChartData(summary)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          className="fill-slate-500 dark:fill-slate-500"
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
        />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="pass" name="Pass" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="fail" name="Fail" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  )
}
