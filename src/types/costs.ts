export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'unknown'
export type CostGranularity = 'daily' | 'weekly' | 'monthly'
export type CostTrend = 'up' | 'down' | 'stable'

export interface CostDataPoint {
  date: string
  amount: number
}

export interface CostByService {
  serviceId: string
  serviceName: string
  currentPeriodCost: number
  previousPeriodCost: number
  trend: CostTrend
  trendPercent: number
}

export interface CostAnomaly {
  id: string
  detectedAt: string
  serviceName: string
  expectedAmount: number
  actualAmount: number
  percentageIncrease: number
  description: string
}

export interface CostSummary {
  repoId: string
  provider: CloudProvider
  currentPeriodTotal: number
  previousPeriodTotal: number
  trend: CostTrend
  trendPercent: number
  forecastedMonthTotal: number
  lastUpdated: string
  byService: CostByService[]
  history: CostDataPoint[]
  anomalies: CostAnomaly[]
}
