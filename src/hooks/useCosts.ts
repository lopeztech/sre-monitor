import { useQuery } from '@tanstack/react-query'
import { getCosts } from '@/api/costs'
import { useRegistryStore } from '@/store/registryStore'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useCosts(repoId: string) {
  const repo = useRegistryStore((s) => s.repositories.find((r) => r.id === repoId))
  const provider = repo?.analysis?.cloudProvider
  const accountId = repo?.analysis?.cloudAccountId

  return useQuery({
    queryKey: ['costs', repoId, provider, accountId],
    queryFn: () => getCosts(repoId, provider!, accountId!),
    staleTime: QUERY_STALE_TIMES.costs,
    enabled: Boolean(repoId) && Boolean(provider) && provider !== 'unknown' && Boolean(accountId),
  })
}
