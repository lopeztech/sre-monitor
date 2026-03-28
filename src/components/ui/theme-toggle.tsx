import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

const options = [
  { mode: 'light' as const, icon: Sun, label: 'Light' },
  { mode: 'dark' as const, icon: Moon, label: 'Dark' },
  { mode: 'system' as const, icon: Monitor, label: 'System' },
]

export function ThemeToggle() {
  const { mode, setMode } = useThemeStore()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-700 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.mode}
          onClick={() => setMode(opt.mode)}
          title={opt.label}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            mode === opt.mode
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300',
          )}
        >
          <opt.icon size={14} />
        </button>
      ))}
    </div>
  )
}
