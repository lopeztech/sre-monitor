export type LogSeverity = 'CRITICAL' | 'ERROR' | 'WARNING'
export type LogSource = 'cloudwatch' | 'gcp_logging' | 'azure_monitor' | 'unknown'

export interface LogEntry {
  id: string
  timestamp: string
  severity: LogSeverity
  source: LogSource
  service: string
  environment: string
  message: string
  count: number
  firstSeen: string
  lastSeen: string
  metadata: Record<string, string>
}

export interface ErrorRateDataPoint {
  timestamp: string
  errorCount: number
  criticalCount: number
}

export interface LogSummary {
  repoId: string
  source: LogSource
  timeRange: '1h' | '6h' | '24h' | '7d'
  totalErrors: number
  totalCritical: number
  topServices: Array<{ service: string; errorCount: number }>
  errorRateHistory: ErrorRateDataPoint[]
  entries: LogEntry[]
  lastUpdated: string
}
