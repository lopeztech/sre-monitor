import { useQuery } from '@tanstack/react-query'
import { getPipelines } from '@/api/pipelines'
import { useRegistryStore } from '@/store/registryStore'
import { QUERY_STALE_TIMES, QUERY_REFETCH_INTERVALS } from '@/lib/constants'

export function usePipelines(repoId: string) {
  const repo = useRegistryStore((s) => s.repositories.find((r) => r.id === repoId))

  return useQuery({
    queryKey: ['pipelines', repoId],
    queryFn: () => getPipelines(repoId, repo!.owner, repo!.repo),
    staleTime: QUERY_STALE_TIMES.pipelines,
    refetchInterval: QUERY_REFETCH_INTERVALS.pipelines,
    enabled: Boolean(repoId) && Boolean(repo),
  })
}
