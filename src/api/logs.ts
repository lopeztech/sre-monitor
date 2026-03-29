import { apiFetch } from './client'
import type { LogSummary } from '@/types/logs'

export async function getLogs(repoId: string, timeRange?: string): Promise<LogSummary> {
  const params = timeRange ? `?range=${encodeURIComponent(timeRange)}` : ''
  return apiFetch<LogSummary>(`/api/repos/${repoId}/logs${params}`)
}
