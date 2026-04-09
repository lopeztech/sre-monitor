import type {
  Vulnerability,
  VulnerabilitySeverity,
  VulnerabilitySummary,
  VulnerabilityEcosystem,
  VulnerabilityState,
} from '../../../shared/types/vulnerability.js'

// ── GitHub Dependabot Alerts API types ─────────────────────────────────────

interface DependabotAlert {
  number: number
  state: 'open' | 'dismissed' | 'fixed' | 'auto_dismissed'
  dependency: {
    package: {
      ecosystem: string
      name: string
    }
    manifest_path: string
  }
  security_advisory: {
    ghsa_id: string
    cve_id: string | null
    summary: string
    description: string
    severity: string
    cvss: {
      score: number | null
    } | null
    published_at: string
    updated_at: string
  }
  security_vulnerability: {
    vulnerable_version_range: string
    first_patched_version: {
      identifier: string
    } | null
  }
  html_url: string
  created_at: string
  updated_at: string
}

// ── Ecosystem mapping ──────────────────────────────────────────────────────

const ECOSYSTEM_MAP: Record<string, VulnerabilityEcosystem> = {
  npm: 'npm',
  pip: 'pip',
  maven: 'maven',
  go: 'go',
  cargo: 'cargo',
  composer: 'composer',
  nuget: 'nuget',
}

function mapEcosystem(ecosystem: string): VulnerabilityEcosystem {
  return ECOSYSTEM_MAP[ecosystem.toLowerCase()] ?? 'npm'
}

function mapSeverity(severity: string): VulnerabilitySeverity {
  const s = severity.toLowerCase()
  if (s === 'critical') return 'critical'
  if (s === 'high') return 'high'
  if (s === 'medium') return 'medium'
  if (s === 'low') return 'low'
  return 'informational'
}

function mapState(state: string): VulnerabilityState {
  if (state === 'open') return 'open'
  if (state === 'dismissed') return 'dismissed'
  if (state === 'fixed') return 'fixed'
  if (state === 'auto_dismissed') return 'auto_dismissed'
  return 'open'
}

// ── Security score calculation ─────────────────────────────────────────────

function calculateSecurityScore(vulnerabilities: Vulnerability[]): number {
  const open = vulnerabilities.filter((v) => v.state === 'open')
  if (open.length === 0) return 100

  let penalty = 0
  for (const v of open) {
    switch (v.severity) {
      case 'critical': penalty += 25; break
      case 'high': penalty += 15; break
      case 'medium': penalty += 8; break
      case 'low': penalty += 3; break
      case 'informational': penalty += 1; break
    }
  }

  return Math.max(0, Math.round(100 - penalty))
}

// ── Main export ────────────────────────────────────────────────────────────

export async function fetchVulnerabilitySummary(
  repoId: string,
  owner: string,
  repo: string,
  githubToken?: string,
): Promise<VulnerabilitySummary> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (githubToken) {
    headers['Authorization'] = `Bearer ${githubToken}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/dependabot/alerts?per_page=100&sort=updated&direction=desc`,
    { headers },
  )

  if (response.status === 403 || response.status === 404) {
    // Dependabot not enabled or repo not found — return empty
    return emptyResult(repoId)
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`GitHub Dependabot API error ${response.status}: ${text}`)
  }

  const alerts = (await response.json()) as DependabotAlert[]

  const vulnerabilities: Vulnerability[] = alerts.map((alert) => ({
    id: `GHSA-${alert.number}`,
    cveId: alert.security_advisory.cve_id,
    ghsaId: alert.security_advisory.ghsa_id,
    summary: alert.security_advisory.summary,
    description: alert.security_advisory.description,
    severity: mapSeverity(alert.security_advisory.severity),
    cvssScore: alert.security_advisory.cvss?.score ?? null,
    state: mapState(alert.state),
    packageName: alert.dependency.package.name,
    packageEcosystem: mapEcosystem(alert.dependency.package.ecosystem),
    vulnerableVersionRange: alert.security_vulnerability.vulnerable_version_range,
    patchedVersion: alert.security_vulnerability.first_patched_version?.identifier ?? null,
    manifestPath: alert.dependency.manifest_path,
    publishedAt: alert.security_advisory.published_at,
    updatedAt: alert.updated_at,
    url: alert.html_url,
  }))

  const bySeverity: Record<VulnerabilitySeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  }

  for (const v of vulnerabilities) {
    bySeverity[v.severity]++
  }

  const openCount = vulnerabilities.filter((v) => v.state === 'open').length

  return {
    repoId,
    total: vulnerabilities.length,
    bySeverity,
    openCount,
    securityScore: calculateSecurityScore(vulnerabilities),
    vulnerabilities,
    lastUpdated: new Date().toISOString(),
  }
}

function emptyResult(repoId: string): VulnerabilitySummary {
  return {
    repoId,
    total: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
    openCount: 0,
    securityScore: 100,
    vulnerabilities: [],
    lastUpdated: new Date().toISOString(),
  }
}
