import { Link, useParams } from '@tanstack/react-router'
import { GitBranch } from 'lucide-react'
import type { RegisteredRepository } from '@/types/repository'
import { cn } from '@/lib/utils'

interface RepoCardProps {
  repo: RegisteredRepository
  collapsed?: boolean
}

const providerLabel: Record<string, string> = {
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'AZ',
  unknown: '?',
}

const providerColor: Record<string, string> = {
  aws: 'bg-orange-950 text-orange-400',
  gcp: 'bg-blue-950 text-blue-400',
  azure: 'bg-sky-950 text-sky-400',
  unknown: 'bg-slate-800 text-slate-400',
}

const statusDot: Record<string, string> = {
  ready: 'bg-green-500',
  analyzing: 'bg-amber-500 animate-pulse',
  error: 'bg-red-500',
}

export function RepoCard({ repo, collapsed }: RepoCardProps) {
  let currentRepoId: string | undefined
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const params = useParams({ strict: false })
    currentRepoId = (params as Record<string, string>).repoId
  } catch {
    currentRepoId = undefined
  }

  const isActive = currentRepoId === repo.id
  const provider = repo.analysis?.cloudProvider ?? 'unknown'

  if (collapsed) {
    return (
      <Link
        to="/app/$repoId"
        params={{ repoId: repo.id }}
        title={repo.fullName}
        className={cn(
          'flex h-9 w-full items-center justify-center rounded-lg transition-colors',
          isActive
            ? 'bg-sky-950 text-sky-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        )}
      >
        <GitBranch size={16} />
      </Link>
    )
  }

  return (
    <Link
      to="/app/$repoId"
      params={{ repoId: repo.id }}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 transition-colors',
        isActive
          ? 'bg-sky-950 text-sky-300'
          : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
      )}
    >
      <div className="relative flex-shrink-0">
        <GitBranch size={16} />
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-slate-950',
            statusDot[repo.status],
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{repo.repo}</p>
        <p className="truncate text-[10px] text-slate-500">{repo.owner}</p>
      </div>
      <span
        className={cn(
          'flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold',
          providerColor[provider],
        )}
      >
        {providerLabel[provider]}
      </span>
    </Link>
  )
}
