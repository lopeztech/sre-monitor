export const DEMO_REPOS = ['frontend-app', 'data-pipeline', 'api-service'] as const

export const QUERY_STALE_TIMES = {
  repository: 5 * 60 * 1000,
  costs: 30 * 60 * 1000,
  pipelines: 30 * 1000,
  vulnerabilities: 10 * 60 * 1000,
  logs: 15 * 1000,
  coverage: 5 * 60 * 1000,
}

export const QUERY_REFETCH_INTERVALS = {
  pipelines: 30 * 1000,
  logs: 15 * 1000,
}
