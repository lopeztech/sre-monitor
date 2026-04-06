import { apiFetch } from './client'
import type { LogSummary } from '@/types/logs'

export async function getLogs(repoId: string, projectId: string, timeRange?: string): Promise<LogSummary> {
  const params = new URLSearchParams({ projectId })
  if (timeRange) params.set('range', timeRange)
  return apiFetch<LogSummary>(`/api/repos/${repoId}/logs?${params.toString()}`)
}
