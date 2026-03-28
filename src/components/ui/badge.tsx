import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-700 text-slate-200 border-slate-600',
  success: 'bg-green-950 text-green-400 border-green-800',
  warning: 'bg-amber-950 text-amber-400 border-amber-800',
  danger: 'bg-red-950 text-red-400 border-red-800',
  info: 'bg-blue-950 text-blue-400 border-blue-800',
  muted: 'bg-slate-800 text-slate-400 border-slate-700',
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2.5 py-1',
}

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
