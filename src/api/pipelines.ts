import { apiFetch } from './client'
import type { PipelineSummary } from '@/types/pipeline'

export async function getPipelines(repoId: string, owner: string, repo: string): Promise<PipelineSummary> {
  return apiFetch<PipelineSummary>(
    `/api/repos/${repoId}/pipelines?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
  )
}
