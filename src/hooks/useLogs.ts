import { useQuery } from '@tanstack/react-query'
import { getLogs } from '@/api/logs'
import { QUERY_STALE_TIMES, QUERY_REFETCH_INTERVALS } from '@/lib/constants'
import { useUIStore } from '@/store/uiStore'

export function useLogs(repoId: string) {
  const activeLogRange = useUIStore((s) => s.activeLogRange)

  return useQuery({
    queryKey: ['logs', repoId, activeLogRange],
    queryFn: () => getLogs(repoId, activeLogRange),
    staleTime: QUERY_STALE_TIMES.logs,
    refetchInterval: QUERY_REFETCH_INTERVALS.logs,
    enabled: Boolean(repoId),
  })
}
