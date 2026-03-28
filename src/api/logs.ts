import { apiFetch } from './client'
import type { LogSummary } from '@/types/logs'

export async function getLogs(repoId: string, _timeRange?: string): Promise<LogSummary> {
  return apiFetch<LogSummary>(`/api/repos/${repoId}/logs`)
}
