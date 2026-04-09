import { Logging } from '@google-cloud/logging'
import type {
  LogEntry,
  LogSeverity,
  LogSummary,
  ErrorRateDataPoint,
} from '../../../shared/types/logs.js'

// ── Time range helpers ─────────────────────────────────────────────────────

type TimeRange = '1h' | '6h' | '24h' | '7d'

function getStartTime(range: TimeRange): Date {
  const now = new Date()
  switch (range) {
    case '1h': return new Date(now.getTime() - 60 * 60 * 1000)
    case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000)
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }
}

function getBucketInterval(range: TimeRange): number {
  switch (range) {
    case '1h': return 5 * 60 * 1000      // 5 min buckets
    case '6h': return 30 * 60 * 1000     // 30 min buckets
    case '24h': return 60 * 60 * 1000    // 1 hour buckets
    case '7d': return 6 * 60 * 60 * 1000 // 6 hour buckets
  }
}

function isValidRange(range: string): range is TimeRange {
  return ['1h', '6h', '24h', '7d'].includes(range)
}

// ── Main export ────────────────────────────────────────────────────────────

export async function fetchLogSummary(
  repoId: string,
  gcpProjectId: string,
  range: string,
): Promise<LogSummary> {
  const timeRange: TimeRange = isValidRange(range) ? range : '24h'
  const startTime = getStartTime(timeRange)

  const logging = new Logging({ projectId: gcpProjectId })

  // Query for ERROR and above severity logs
  const filter = [
    `timestamp >= "${startTime.toISOString()}"`,
    'severity >= ERROR',
  ].join(' AND ')

  let entries: Array<{ metadata: Record<string, unknown>; data: unknown }>
  try {
    const result = await logging.getEntries({
      filter,
      orderBy: 'timestamp desc',
      pageSize: 500,
    })
    entries = result[0]
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    // Permission denied or project not found — return empty rather than 500
    if (msg.includes('PERMISSION_DENIED') || msg.includes('NOT_FOUND') || msg.includes('INVALID_ARGUMENT')) {
      return {
        repoId,
        source: 'gcp_logging',
        timeRange,
        totalErrors: 0,
        totalCritical: 0,
        topServices: [],
        errorRateHistory: [],
        entries: [],
        lastUpdated: new Date().toISOString(),
      }
    }
    throw err
  }

  // Map to our LogEntry type
  const logEntries: LogEntry[] = []
  const seen = new Map<string, LogEntry>()

  for (const entry of entries) {
    const meta = entry.metadata as {
      severity?: string
      timestamp?: string
      resource?: { type?: string; labels?: Record<string, string> }
      labels?: Record<string, string>
      insertId?: string
    }
    const data = entry.data as string | { message?: string; textPayload?: string } | undefined

    const severity = mapSeverity(meta.severity ?? 'ERROR')
    const timestamp = meta.timestamp ?? new Date().toISOString()
    const service = meta.resource?.labels?.service_name
      ?? meta.resource?.labels?.container_name
      ?? meta.resource?.type
      ?? 'unknown'
    const environment = meta.resource?.labels?.location
      ?? meta.resource?.labels?.zone
      ?? 'default'

    let message = ''
    if (typeof data === 'string') {
      message = data
    } else if (data && typeof data === 'object') {
      message = data.message ?? data.textPayload ?? JSON.stringify(data)
    }

    // Truncate long messages
    if (message.length > 500) {
      message = message.slice(0, 500) + '...'
    }

    // Deduplicate by message prefix (group similar errors)
    const key = `${service}:${severity}:${message.slice(0, 100)}`
    const existing = seen.get(key)

    if (existing) {
      existing.count++
      if (timestamp < existing.firstSeen) existing.firstSeen = timestamp
      if (timestamp > existing.lastSeen) existing.lastSeen = timestamp
    } else {
      const logEntry: LogEntry = {
        id: meta.insertId ?? `log-${logEntries.length}`,
        timestamp,
        severity,
        source: 'gcp_logging',
        service,
        environment,
        message,
        count: 1,
        firstSeen: timestamp,
        lastSeen: timestamp,
        metadata: meta.labels ?? {},
      }
      seen.set(key, logEntry)
      logEntries.push(logEntry)
    }
  }

  // Sort by count descending (most frequent errors first)
  logEntries.sort((a, b) => b.count - a.count)

  // Build top services
  const serviceErrors = new Map<string, number>()
  for (const entry of logEntries) {
    serviceErrors.set(entry.service, (serviceErrors.get(entry.service) ?? 0) + entry.count)
  }
  const topServices = Array.from(serviceErrors.entries())
    .map(([service, errorCount]) => ({ service, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10)

  // Build error rate histogram
  const bucketMs = getBucketInterval(timeRange)
  const errorRateHistory = buildHistogram(entries, startTime, bucketMs)

  const totalErrors = logEntries.reduce((sum, e) => sum + e.count, 0)
  const totalCritical = logEntries
    .filter((e) => e.severity === 'CRITICAL')
    .reduce((sum, e) => sum + e.count, 0)

  return {
    repoId,
    source: 'gcp_logging',
    timeRange,
    totalErrors,
    totalCritical,
    topServices,
    errorRateHistory,
    entries: logEntries.slice(0, 100),
    lastUpdated: new Date().toISOString(),
  }
}

function mapSeverity(severity: string): LogSeverity {
  const s = severity.toUpperCase()
  if (s === 'CRITICAL' || s === 'ALERT' || s === 'EMERGENCY') return 'CRITICAL'
  if (s === 'ERROR') return 'ERROR'
  return 'WARNING'
}

function buildHistogram(
  entries: Array<{ metadata: Record<string, unknown> }>,
  startTime: Date,
  bucketMs: number,
): ErrorRateDataPoint[] {
  const now = Date.now()
  const startMs = startTime.getTime()
  const bucketCount = Math.ceil((now - startMs) / bucketMs)

  const errorBuckets = new Array<number>(bucketCount).fill(0)
  const criticalBuckets = new Array<number>(bucketCount).fill(0)

  for (const entry of entries) {
    const meta = entry.metadata as { severity?: string; timestamp?: string }
    const ts = new Date(meta.timestamp ?? '').getTime()
    if (ts < startMs) continue

    const idx = Math.min(Math.floor((ts - startMs) / bucketMs), bucketCount - 1)
    errorBuckets[idx]++

    const severity = (meta.severity ?? '').toUpperCase()
    if (severity === 'CRITICAL' || severity === 'ALERT' || severity === 'EMERGENCY') {
      criticalBuckets[idx]++
    }
  }

  return errorBuckets.map((errorCount, i) => ({
    timestamp: new Date(startMs + i * bucketMs).toISOString(),
    errorCount,
    criticalCount: criticalBuckets[i],
  }))
}
