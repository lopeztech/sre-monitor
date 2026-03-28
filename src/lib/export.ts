function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`
    }
    return val
  }
  const lines = [headers.map(escape).join(',')]
  rows.forEach((row) => lines.push(row.map(escape).join(',')))
  return lines.join('\n')
}

export function exportCostsCsv(data: { history: { date: string; amount: number }[]; byService: { serviceName: string; currentPeriodCost: number; previousPeriodCost: number }[] }) {
  const headers = ['Date', 'Amount']
  const rows = data.history.map((d) => [d.date, d.amount.toFixed(2)])
  downloadFile(toCsv(headers, rows), 'cost-history.csv', 'text/csv')
}

export function exportCostsByServiceCsv(services: { serviceName: string; currentPeriodCost: number; previousPeriodCost: number; trendPercent: number }[]) {
  const headers = ['Service', 'Current Period', 'Previous Period', 'Change %']
  const rows = services.map((s) => [s.serviceName, s.currentPeriodCost.toFixed(2), s.previousPeriodCost.toFixed(2), s.trendPercent.toFixed(1)])
  downloadFile(toCsv(headers, rows), 'cost-by-service.csv', 'text/csv')
}

export function exportPipelinesCsv(workflows: { name: string; path: string; passRate7d: number; avgDurationSeconds: number; recentRuns: { commitMessage: string; conclusion: string | null; startedAt: string; actor: string }[] }[]) {
  const headers = ['Workflow', 'Path', 'Pass Rate (7d)', 'Avg Duration (s)', 'Recent Runs']
  const rows = workflows.map((wf) => [
    wf.name,
    wf.path,
    wf.passRate7d.toFixed(1),
    String(wf.avgDurationSeconds),
    String(wf.recentRuns.length),
  ])
  downloadFile(toCsv(headers, rows), 'pipelines.csv', 'text/csv')
}

export function exportVulnerabilitiesCsv(vulns: { severity: string; packageName: string; packageEcosystem: string; cveId: string | null; summary: string; state: string; patchedVersion: string | null }[]) {
  const headers = ['Severity', 'Package', 'Ecosystem', 'CVE', 'Summary', 'State', 'Patched Version']
  const rows = vulns.map((v) => [
    v.severity,
    v.packageName,
    v.packageEcosystem,
    v.cveId ?? '',
    v.summary,
    v.state,
    v.patchedVersion ?? 'N/A',
  ])
  downloadFile(toCsv(headers, rows), 'vulnerabilities.csv', 'text/csv')
}

export function exportLogsCsv(entries: { timestamp: string; severity: string; service: string; environment: string; message: string; count: number }[]) {
  const headers = ['Timestamp', 'Severity', 'Service', 'Environment', 'Message', 'Count']
  const rows = entries.map((e) => [
    e.timestamp,
    e.severity,
    e.service,
    e.environment,
    e.message,
    String(e.count),
  ])
  downloadFile(toCsv(headers, rows), 'log-errors.csv', 'text/csv')
}

export function exportCoverageCsv(files: { path: string; lines: { percentage: number }; branches: { percentage: number }; functions: { percentage: number } }[]) {
  const headers = ['File', 'Lines %', 'Branches %', 'Functions %']
  const rows = files.map((f) => [
    f.path,
    f.lines.percentage.toFixed(1),
    f.branches.percentage.toFixed(1),
    f.functions.percentage.toFixed(1),
  ])
  downloadFile(toCsv(headers, rows), 'coverage.csv', 'text/csv')
}
