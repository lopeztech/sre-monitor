import { useQuery } from '@tanstack/react-query'
import { getVulnerabilities } from '@/api/vulnerabilities'
import { useRegistryStore } from '@/store/registryStore'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useVulnerabilities(repoId: string) {
  const repo = useRegistryStore((s) => s.repositories.find((r) => r.id === repoId))

  return useQuery({
    queryKey: ['vulnerabilities', repoId],
    queryFn: () => getVulnerabilities(repoId, repo!.owner, repo!.repo),
    staleTime: QUERY_STALE_TIMES.vulnerabilities,
    enabled: Boolean(repoId) && Boolean(repo),
  })
}
