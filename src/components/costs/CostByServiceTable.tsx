import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent } from '@/lib/formatters'
import type { CostByService } from '@/types/costs'
import { cn } from '@/lib/utils'

interface CostByServiceTableProps {
  services: CostByService[]
}

export function CostByServiceTable({ services }: CostByServiceTableProps) {
  const sorted = [...services].sort((a, b) => b.currentPeriodCost - a.currentPeriodCost)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="pb-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Service</th>
            <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Current</th>
            <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Previous</th>
            <th className="pb-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          {sorted.map((svc) => {
            const variant =
              svc.trend === 'up' ? 'danger' : svc.trend === 'down' ? 'success' : 'muted'
            const sign = svc.trend === 'up' ? '+' : svc.trend === 'down' ? '-' : ''
            return (
              <tr key={svc.serviceId} className="group">
                <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">{svc.serviceName}</td>
                <td className="py-2.5 text-right text-slate-700 dark:text-slate-200">
                  {formatCurrency(svc.currentPeriodCost)}
                </td>
                <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                  {formatCurrency(svc.previousPeriodCost)}
                </td>
                <td className="py-2.5 text-right">
                  <Badge variant={variant}>
                    <span className={cn('flex items-center gap-0.5')}>
                      {svc.trend === 'up' && <TrendingUp size={10} />}
                      {svc.trend === 'down' && <TrendingDown size={10} />}
                      {svc.trend === 'stable' && <Minus size={10} />}
                      {sign}{formatPercent(Math.abs(svc.trendPercent))}
                    </span>
                  </Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
