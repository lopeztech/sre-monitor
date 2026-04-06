import { useQuery } from '@tanstack/react-query'
import { getLogs } from '@/api/logs'
import { useRegistryStore } from '@/store/registryStore'
import { QUERY_STALE_TIMES, QUERY_REFETCH_INTERVALS } from '@/lib/constants'
import { useUIStore } from '@/store/uiStore'

export function useLogs(repoId: string) {
  const activeLogRange = useUIStore((s) => s.activeLogRange)
  const repo = useRegistryStore((s) => s.repositories.find((r) => r.id === repoId))
  const projectId = repo?.cloudAccountIdManual ?? repo?.analysis?.cloudAccountId

  return useQuery({
    queryKey: ['logs', repoId, activeLogRange, projectId],
    queryFn: () => getLogs(repoId, projectId!, activeLogRange),
    staleTime: QUERY_STALE_TIMES.logs,
    refetchInterval: QUERY_REFETCH_INTERVALS.logs,
    enabled: Boolean(repoId) && Boolean(projectId),
  })
}
