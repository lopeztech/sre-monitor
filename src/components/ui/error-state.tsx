import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from './card'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn\'t load this data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400">
          <AlertTriangle size={22} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">{description}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
            <RefreshCw size={13} />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
