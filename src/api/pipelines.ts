import { apiFetch } from './client'
import type { PipelineSummary } from '@/types/pipeline'

export async function getPipelines(repoId: string): Promise<PipelineSummary> {
  return apiFetch<PipelineSummary>(`/api/repos/${repoId}/pipelines`)
}
