import { apiFetch } from './client'
import type { CoverageSummary } from '@/types/coverage'

export async function getCoverage(repoId: string): Promise<CoverageSummary> {
  return apiFetch<CoverageSummary>(`/api/repos/${repoId}/coverage`)
}
