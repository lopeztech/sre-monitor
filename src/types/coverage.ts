export type CoverageStatus = 'passing' | 'failing' | 'unknown'

export interface CoverageMetric {
  covered: number
  total: number
  percentage: number
}

export interface CoverageMetrics {
  lines: CoverageMetric
  branches: CoverageMetric
  functions: CoverageMetric
  statements: CoverageMetric
}

export interface CoverageHistoryPoint {
  commitSha: string
  branch: string
  date: string
  linesCoverage: number
  branchesCoverage: number
}

export interface CoverageFileEntry {
  path: string
  lines: CoverageMetric
  branches: CoverageMetric
  functions: CoverageMetric
  status: CoverageStatus
}

export interface CoverageSummary {
  repoId: string
  provider: 'codecov' | 'github_actions' | 'unknown'
  defaultBranchCoverage: CoverageMetrics
  threshold: number
  status: CoverageStatus
  delta: number
  history: CoverageHistoryPoint[]
  files: CoverageFileEntry[]
  lastUpdated: string
}
