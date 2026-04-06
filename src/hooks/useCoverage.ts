import { useQuery } from '@tanstack/react-query'
import { getCoverage } from '@/api/coverage'
import { useRegistryStore } from '@/store/registryStore'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useCoverage(repoId: string) {
  const repo = useRegistryStore((s) => s.repositories.find((r) => r.id === repoId))

  return useQuery({
    queryKey: ['coverage', repoId],
    queryFn: () => getCoverage(repoId, repo!.owner, repo!.repo),
    staleTime: QUERY_STALE_TIMES.coverage,
    enabled: Boolean(repoId) && Boolean(repo),
  })
}
