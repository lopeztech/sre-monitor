import { useQuery } from '@tanstack/react-query'
import { getPipelines } from '@/api/pipelines'
import { QUERY_STALE_TIMES, QUERY_REFETCH_INTERVALS } from '@/lib/constants'

export function usePipelines(repoId: string) {
  return useQuery({
    queryKey: ['pipelines', repoId],
    queryFn: () => getPipelines(repoId),
    staleTime: QUERY_STALE_TIMES.pipelines,
    refetchInterval: QUERY_REFETCH_INTERVALS.pipelines,
    enabled: Boolean(repoId),
  })
}
