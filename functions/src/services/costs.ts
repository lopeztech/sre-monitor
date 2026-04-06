import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'
import { BigQuery } from '@google-cloud/bigquery'
import type { CloudProvider } from '../../../shared/types/repository.js'
import type {
  CostAnomaly,
  CostByService,
  CostDataPoint,
  CostSummary,
  CostTrend,
} from '../../../shared/types/costs.js'

// ── Types ───────────────────────────────────────────────────────────────────

interface RawDailyCost {
  date: string
  serviceId: string
  serviceName: string
  amount: number
}

// ── In-memory cache (5-minute TTL) ──────────────────────────────────────────

interface CacheEntry {
  data: CostSummary
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 300_000

// ── Date helpers ────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getDateRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 90)
  return { startDate: formatDate(start), endDate: formatDate(end) }
}

// ── Provider adapters ───────────────────────────────────────────────────────

async function fetchAwsCosts(accountId: string, startDate: string, endDate: string): Promise<RawDailyCost[]> {
  const client = new CostExplorerClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_COST_EXPLORER_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_COST_EXPLORER_SECRET_ACCESS_KEY!,
    },
  })

  const command = new GetCostAndUsageCommand({
    TimePeriod: { Start: startDate, End: endDate },
    Granularity: 'DAILY',
    Metrics: ['UnblendedCost'],
    GroupBy: [{ Type: 'DIMENSION', Key: 'SERVICE' }],
    Filter: {
      Dimensions: {
        Key: 'LINKED_ACCOUNT',
        Values: [accountId],
      },
    },
  })

  const response = await client.send(command)
  const results: RawDailyCost[] = []

  for (const result of response.ResultsByTime ?? []) {
    const date = result.TimePeriod?.Start
    if (!date) continue

    for (const group of result.Groups ?? []) {
      const serviceName = group.Keys?.[0] ?? 'Unknown'
      const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount ?? '0')
      if (amount === 0) continue

      results.push({
        date,
        serviceId: serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        serviceName,
        amount,
      })
    }
  }

  return results
}

async function fetchGcpCosts(accountId: string, startDate: string, endDate: string): Promise<RawDailyCost[]> {
  const projectId = process.env.GCP_BILLING_PROJECT_ID
  const dataset = process.env.GCP_BILLING_DATASET
  const table = process.env.GCP_BILLING_TABLE

  if (!projectId || !dataset || !table) {
    throw new Error('GCP billing configuration missing: GCP_BILLING_PROJECT_ID, GCP_BILLING_DATASET, GCP_BILLING_TABLE')
  }

  const bigquery = new BigQuery({ projectId })
  const query = `
    SELECT
      FORMAT_DATE('%Y-%m-%d', DATE(usage_start_time)) AS date,
      service.id AS service_id,
      service.description AS service_name,
      SUM(cost + IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)) AS amount
    FROM \`${projectId}.${dataset}.${table}\`
    WHERE project.id = @accountId
      AND DATE(usage_start_time) >= @startDate
      AND DATE(usage_start_time) <= @endDate
    GROUP BY date, service_id, service_name
    HAVING amount > 0
    ORDER BY date
  `

  const [rows] = await bigquery.query({
    query,
    params: { accountId, startDate, endDate },
  })

  return (rows as Array<{ date: string; service_id: string; service_name: string; amount: number }>).map((row) => ({
    date: row.date,
    serviceId: row.service_id,
    serviceName: row.service_name,
    amount: Number(row.amount),
  }))
}

async function fetchAzureCosts(subscriptionId: string, startDate: string, endDate: string): Promise<RawDailyCost[]> {
  const tenantId = process.env.AZURE_COST_MGMT_TENANT_ID
  const clientId = process.env.AZURE_COST_MGMT_CLIENT_ID
  const clientSecret = process.env.AZURE_COST_MGMT_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Azure Cost Management configuration missing: AZURE_COST_MGMT_TENANT_ID, AZURE_COST_MGMT_CLIENT_ID, AZURE_COST_MGMT_CLIENT_SECRET')
  }

  // Obtain OAuth2 token
  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://management.azure.com/.default',
      }),
    },
  )

  if (!tokenResponse.ok) {
    throw new Error(`Azure authentication failed: ${tokenResponse.status}`)
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string }

  // Query Cost Management
  const costResponse = await fetch(
    `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-11-01`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'ActualCost',
        timeframe: 'Custom',
        timePeriod: { from: `${startDate}T00:00:00Z`, to: `${endDate}T23:59:59Z` },
        dataset: {
          granularity: 'Daily',
          aggregation: {
            totalCost: { name: 'Cost', function: 'Sum' },
          },
          grouping: [{ type: 'Dimension', name: 'ServiceName' }],
        },
      }),
    },
  )

  if (!costResponse.ok) {
    throw new Error(`Azure Cost Management query failed: ${costResponse.status}`)
  }

  const costData = (await costResponse.json()) as {
    properties: {
      columns: Array<{ name: string }>
      rows: Array<Array<number | string>>
    }
  }

  const columns = costData.properties.columns.map((c) => c.name)
  const costIdx = columns.indexOf('Cost')
  const serviceIdx = columns.indexOf('ServiceName')
  const dateIdx = columns.indexOf('UsageDate')

  return costData.properties.rows
    .filter((row) => Number(row[costIdx]) > 0)
    .map((row) => {
      const rawDate = String(row[dateIdx])
      // Azure returns dates as YYYYMMDD numbers
      const date = rawDate.length === 8
        ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
        : rawDate
      const serviceName = String(row[serviceIdx])
      return {
        date,
        serviceId: serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        serviceName,
        amount: Number(row[costIdx]),
      }
    })
}

// ── Analytics ───────────────────────────────────────────────────────────────

export function calculateTrend(current: number, previous: number): { trend: CostTrend; trendPercent: number } {
  if (previous === 0) return { trend: 'stable', trendPercent: 0 }
  const pct = Math.round(((current - previous) / previous) * 10000) / 100
  const absPct = Math.abs(pct)

  if (absPct < 2) return { trend: 'stable', trendPercent: absPct }
  return { trend: pct > 0 ? 'up' : 'down', trendPercent: absPct }
}

export function calculateForecast(history: CostDataPoint[]): number {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const totalDays = daysInMonth(year, month)

  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const currentMonthPoints = history.filter((p) => p.date.startsWith(currentMonthPrefix))

  if (currentMonthPoints.length < 2) {
    // Not enough data this month — use previous month's total
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const prevPrefix = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`
    const prevPoints = history.filter((p) => p.date.startsWith(prevPrefix))
    if (prevPoints.length === 0) return 0
    return Math.round(prevPoints.reduce((sum, p) => sum + p.amount, 0) * 100) / 100
  }

  const totalSpend = currentMonthPoints.reduce((sum, p) => sum + p.amount, 0)
  const dailyAvg = totalSpend / currentMonthPoints.length
  return Math.round(dailyAvg * totalDays * 100) / 100
}

export function detectAnomalies(rawCosts: RawDailyCost[]): CostAnomaly[] {
  const anomalies: CostAnomaly[] = []
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Group by service
  const byService = new Map<string, { serviceName: string; entries: Array<{ date: string; amount: number }> }>()
  for (const entry of rawCosts) {
    let svc = byService.get(entry.serviceId)
    if (!svc) {
      svc = { serviceName: entry.serviceName, entries: [] }
      byService.set(entry.serviceId, svc)
    }
    svc.entries.push({ date: entry.date, amount: entry.amount })
  }

  for (const [serviceId, svc] of byService) {
    // Use trailing 30-day window for stats
    const trailing = svc.entries.filter((e) => new Date(e.date) >= thirtyDaysAgo)
    if (trailing.length < 7) continue

    const amounts = trailing.map((e) => e.amount)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const variance = amounts.reduce((sum, v) => sum + (v - mean) ** 2, 0) / amounts.length
    const stddev = Math.sqrt(variance)
    const threshold = mean + 2 * stddev

    // Check last 7 days for anomalies
    const recent = svc.entries.filter((e) => new Date(e.date) >= sevenDaysAgo)
    for (const entry of recent) {
      if (entry.amount > threshold && entry.amount > 1.0) {
        const pctIncrease = Math.round(((entry.amount - mean) / mean) * 1000) / 10
        anomalies.push({
          id: `${serviceId}-${entry.date}`,
          detectedAt: `${entry.date}T00:00:00Z`,
          serviceName: svc.serviceName,
          expectedAmount: Math.round(mean * 100) / 100,
          actualAmount: Math.round(entry.amount * 100) / 100,
          percentageIncrease: pctIncrease,
          description: `${svc.serviceName} costs were ${pctIncrease}% above the 30-day average of $${mean.toFixed(2)}.`,
        })
      }
    }
  }

  return anomalies.sort((a, b) => b.percentageIncrease - a.percentageIncrease)
}

// ── Transform raw data to CostSummary ───────────────────────────────────────

function buildCostSummary(
  repoId: string,
  provider: CloudProvider,
  rawCosts: RawDailyCost[],
): CostSummary {
  // Aggregate daily totals
  const dailyTotals = new Map<string, number>()
  for (const entry of rawCosts) {
    dailyTotals.set(entry.date, (dailyTotals.get(entry.date) ?? 0) + entry.amount)
  }
  const history: CostDataPoint[] = Array.from(dailyTotals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))

  // Split into current and previous 30-day periods
  const dates = history.map((p) => p.date).sort()
  const midpoint = dates.length >= 60 ? dates[dates.length - 30] : dates[Math.floor(dates.length / 2)]

  const currentPeriod = history.filter((p) => p.date >= midpoint)
  const previousPeriod = history.filter((p) => p.date < midpoint)

  const currentPeriodTotal = Math.round(currentPeriod.reduce((s, p) => s + p.amount, 0) * 100) / 100
  const previousPeriodTotal = Math.round(previousPeriod.reduce((s, p) => s + p.amount, 0) * 100) / 100

  const { trend, trendPercent } = calculateTrend(currentPeriodTotal, previousPeriodTotal)

  // By-service breakdown
  const serviceCurrentTotals = new Map<string, { serviceName: string; amount: number }>()
  const servicePreviousTotals = new Map<string, { serviceName: string; amount: number }>()

  for (const entry of rawCosts) {
    const bucket = entry.date >= midpoint ? serviceCurrentTotals : servicePreviousTotals
    const existing = bucket.get(entry.serviceId)
    if (existing) {
      existing.amount += entry.amount
    } else {
      bucket.set(entry.serviceId, { serviceName: entry.serviceName, amount: entry.amount })
    }
  }

  const byService: CostByService[] = Array.from(serviceCurrentTotals.entries())
    .map(([serviceId, curr]) => {
      const prev = servicePreviousTotals.get(serviceId)
      const currentPeriodCost = Math.round(curr.amount * 100) / 100
      const previousPeriodCost = Math.round((prev?.amount ?? 0) * 100) / 100
      const svcTrend = calculateTrend(currentPeriodCost, previousPeriodCost)
      return {
        serviceId,
        serviceName: curr.serviceName,
        currentPeriodCost,
        previousPeriodCost,
        trend: svcTrend.trend,
        trendPercent: svcTrend.trendPercent,
      }
    })
    .sort((a, b) => b.currentPeriodCost - a.currentPeriodCost)

  return {
    repoId,
    provider,
    currentPeriodTotal,
    previousPeriodTotal,
    trend,
    trendPercent,
    forecastedMonthTotal: calculateForecast(history),
    lastUpdated: new Date().toISOString(),
    byService,
    history,
    anomalies: detectAnomalies(rawCosts),
  }
}

// ── Main export ─────────────────────────────────────────────────────────────

export async function fetchCostSummary(
  repoId: string,
  provider: CloudProvider,
  accountId: string,
): Promise<CostSummary> {
  const cacheKey = `${provider}:${accountId}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, repoId }
  }

  const { startDate, endDate } = getDateRange()

  let rawCosts: RawDailyCost[]
  switch (provider) {
    case 'aws':
      rawCosts = await fetchAwsCosts(accountId, startDate, endDate)
      break
    case 'gcp':
      rawCosts = await fetchGcpCosts(accountId, startDate, endDate)
      break
    case 'azure':
      rawCosts = await fetchAzureCosts(accountId, startDate, endDate)
      break
    default:
      throw new Error(`Unsupported cloud provider: ${provider}`)
  }

  const summary = buildCostSummary(repoId, provider, rawCosts)
  cache.set(cacheKey, { data: summary, expiresAt: Date.now() + CACHE_TTL_MS })
  return summary
}
