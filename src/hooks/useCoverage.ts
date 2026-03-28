import { useQuery } from '@tanstack/react-query'
import { getCoverage } from '@/api/coverage'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useCoverage(repoId: string) {
  return useQuery({
    queryKey: ['coverage', repoId],
    queryFn: () => getCoverage(repoId),
    staleTime: QUERY_STALE_TIMES.coverage,
    enabled: Boolean(repoId),
  })
}
