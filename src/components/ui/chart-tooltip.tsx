interface ChartTooltipProps {
  active?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[]
  label?: string
  formatter?: (value: number, name: string) => string
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {label && <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{label}</p>}
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {formatter ? formatter(p.value, p.name) : p.value}
        </p>
      ))}
    </div>
  )
}
