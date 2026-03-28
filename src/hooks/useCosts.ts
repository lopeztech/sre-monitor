import { useQuery } from '@tanstack/react-query'
import { getCosts } from '@/api/costs'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useCosts(repoId: string) {
  return useQuery({
    queryKey: ['costs', repoId],
    queryFn: () => getCosts(repoId),
    staleTime: QUERY_STALE_TIMES.costs,
    enabled: Boolean(repoId),
  })
}
