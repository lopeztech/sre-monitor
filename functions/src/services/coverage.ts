import type {
  CoverageSummary,
  CoverageMetrics,
  CoverageHistoryPoint,
  CoverageFileEntry,
  CoverageStatus,
} from '../../../shared/types/coverage.js'

// ── Codecov API types ──────────────────────────────────────────────────────

interface CodecovRepoResponse {
  totals: {
    coverage: number
    lines: number
    hits: number
    branches: number
    methods: number
    files: number
  } | null
  branch: string
  updatedAt: string
}

interface CodecovCommit {
  commitid: string
  branch: string
  timestamp: string
  totals: {
    coverage: number
    branches: number
  } | null
}

interface CodecovFileReport {
  name: string
  totals: {
    coverage: number
    lines: number
    hits: number
    misses: number
    branches: number
    methods: number
    hits_branches?: number
    misses_branches?: number
    hits_methods?: number
    misses_methods?: number
  }
}

// ── Fetch helpers ──────────────────────────────────────────────────────────

const CODECOV_BASE = 'https://api.codecov.io/api/v2'

async function codecovFetch<T>(path: string, githubToken?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  // Use the Codecov token if available, otherwise try GitHub token for auth
  const codecovToken = process.env.CODECOV_API_TOKEN
  if (codecovToken) {
    headers['Authorization'] = `Bearer ${codecovToken}`
  } else if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`
  }

  const response = await fetch(`${CODECOV_BASE}${path}`, { headers })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Codecov API error ${response.status}: ${text}`)
  }

  return response.json() as Promise<T>
}

// ── Main export ────────────────────────────────────────────────────────────

export async function fetchCoverageSummary(
  repoId: string,
  owner: string,
  repo: string,
  githubToken?: string,
): Promise<CoverageSummary> {
  // Fetch repo overview, recent commits, and file-level report in parallel
  const [repoData, commitsData, fileReport] = await Promise.allSettled([
    codecovFetch<CodecovRepoResponse>(`/github/${owner}/repos/${repo}/`, githubToken),
    codecovFetch<{ results: CodecovCommit[] }>(`/github/${owner}/repos/${repo}/commits/?page_size=10`, githubToken),
    codecovFetch<{ results: CodecovFileReport[] }>(`/github/${owner}/repos/${repo}/file_report/`, githubToken),
  ])

  const repoInfo = repoData.status === 'fulfilled' ? repoData.value : null
  const commits = commitsData.status === 'fulfilled' ? commitsData.value.results : []
  const files = fileReport.status === 'fulfilled' ? fileReport.value.results : []

  if (!repoInfo?.totals) {
    throw new Error('No coverage data available for this repository')
  }

  const totals = repoInfo.totals
  const lineCoverage = totals.coverage
  const threshold = 80

  // Build coverage metrics
  const defaultBranchCoverage: CoverageMetrics = {
    lines: {
      covered: totals.hits,
      total: totals.lines,
      percentage: round(lineCoverage),
    },
    branches: {
      covered: Math.round(totals.branches * (lineCoverage / 100)),
      total: totals.branches,
      percentage: round(lineCoverage), // Codecov doesn't always separate branch coverage
    },
    functions: {
      covered: Math.round(totals.methods * (lineCoverage / 100)),
      total: totals.methods,
      percentage: round(lineCoverage),
    },
    statements: {
      covered: totals.hits,
      total: totals.lines,
      percentage: round(lineCoverage),
    },
  }

  // Build history from recent commits
  const history: CoverageHistoryPoint[] = commits
    .filter((c) => c.totals)
    .map((c) => ({
      commitSha: c.commitid.slice(0, 7),
      branch: c.branch || repoInfo.branch || 'main',
      date: c.timestamp.slice(0, 10),
      linesCoverage: round(c.totals!.coverage),
      branchesCoverage: round(c.totals!.branches || c.totals!.coverage),
    }))

  // Compute delta from last two data points
  const delta = history.length >= 2
    ? round(history[0].linesCoverage - history[1].linesCoverage)
    : 0

  // Build file entries
  const fileEntries: CoverageFileEntry[] = files.slice(0, 20).map((f) => {
    const fileCov = round(f.totals.coverage)
    const fileStatus: CoverageStatus = fileCov >= threshold ? 'passing' : 'failing'
    return {
      path: f.name,
      lines: {
        covered: f.totals.hits,
        total: f.totals.lines,
        percentage: fileCov,
      },
      branches: {
        covered: f.totals.hits_branches ?? Math.round(f.totals.branches * (f.totals.coverage / 100)),
        total: f.totals.branches,
        percentage: round(f.totals.branches > 0 ? ((f.totals.hits_branches ?? Math.round(f.totals.branches * (f.totals.coverage / 100))) / f.totals.branches) * 100 : 0),
      },
      functions: {
        covered: f.totals.hits_methods ?? Math.round(f.totals.methods * (f.totals.coverage / 100)),
        total: f.totals.methods,
        percentage: round(f.totals.methods > 0 ? ((f.totals.hits_methods ?? Math.round(f.totals.methods * (f.totals.coverage / 100))) / f.totals.methods) * 100 : 0),
      },
      status: fileStatus,
    }
  })

  const status: CoverageStatus = lineCoverage >= threshold ? 'passing' : 'failing'

  return {
    repoId,
    provider: 'codecov',
    defaultBranchCoverage,
    threshold,
    status,
    delta,
    history,
    files: fileEntries,
    lastUpdated: repoInfo.updatedAt || new Date().toISOString(),
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
