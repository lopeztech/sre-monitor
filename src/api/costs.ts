import { apiFetch } from './client'
import type { CostSummary } from '@/types/costs'

export async function getCosts(repoId: string): Promise<CostSummary> {
  return apiFetch<CostSummary>(`/api/repos/${repoId}/costs`)
}
