import { useQuery } from '@tanstack/react-query'
import { getVulnerabilities } from '@/api/vulnerabilities'
import { QUERY_STALE_TIMES } from '@/lib/constants'

export function useVulnerabilities(repoId: string) {
  return useQuery({
    queryKey: ['vulnerabilities', repoId],
    queryFn: () => getVulnerabilities(repoId),
    staleTime: QUERY_STALE_TIMES.vulnerabilities,
    enabled: Boolean(repoId),
  })
}
