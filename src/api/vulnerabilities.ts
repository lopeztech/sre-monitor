import { apiFetch } from './client'
import type { VulnerabilitySummary } from '@/types/vulnerability'

export async function getVulnerabilities(repoId: string, owner: string, repo: string): Promise<VulnerabilitySummary> {
  return apiFetch<VulnerabilitySummary>(`/api/repos/${repoId}/vulnerabilities?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)
}
