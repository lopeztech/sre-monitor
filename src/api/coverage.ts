import { apiFetch } from './client'
import type { CoverageSummary } from '@/types/coverage'

export async function getCoverage(repoId: string, owner: string, repo: string): Promise<CoverageSummary> {
  return apiFetch<CoverageSummary>(`/api/repos/${repoId}/coverage?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
}
