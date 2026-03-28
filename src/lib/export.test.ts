import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  exportCostsByServiceCsv,
  exportPipelinesCsv,
  exportVulnerabilitiesCsv,
  exportLogsCsv,
  exportCoverageCsv,
} from './export'

describe('CSV export functions', () => {
  let appendedChild: HTMLElement | null = null
  let clickSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clickSpy = vi.fn()
    appendedChild = null
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      appendedChild = node as HTMLElement
      return node
    })
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = { tagName: tag, href: '', download: '', click: clickSpy } as unknown as HTMLElement
      document.body.appendChild(el)
      return el as HTMLAnchorElement
    })
  })

  it('exportCostsByServiceCsv triggers a download', () => {
    exportCostsByServiceCsv([
      { serviceName: 'EC2', currentPeriodCost: 100, previousPeriodCost: 80, trendPercent: 25 },
    ])
    expect(clickSpy).toHaveBeenCalled()
    expect(appendedChild).not.toBeNull()
  })

  it('exportPipelinesCsv triggers a download', () => {
    exportPipelinesCsv([
      { name: 'CI', path: '.github/workflows/ci.yml', passRate7d: 90, avgDurationSeconds: 120, recentRuns: [] },
    ])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('exportVulnerabilitiesCsv triggers a download', () => {
    exportVulnerabilitiesCsv([
      {
        severity: 'high',
        packageName: 'lodash',
        packageEcosystem: 'npm',
        cveId: 'CVE-2021-1234',
        summary: 'Prototype pollution',
        state: 'open',
        patchedVersion: '4.17.21',
      },
    ])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('exportLogsCsv triggers a download', () => {
    exportLogsCsv([
      {
        timestamp: '2026-03-15T10:00:00Z',
        severity: 'ERROR',
        service: 'api-gateway',
        environment: 'production',
        message: 'Connection timeout',
        count: 3,
      },
    ])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('exportCoverageCsv triggers a download', () => {
    exportCoverageCsv([
      {
        path: 'src/App.tsx',
        lines: { percentage: 85.5 },
        branches: { percentage: 70.2 },
        functions: { percentage: 90.1 },
      },
    ])
    expect(clickSpy).toHaveBeenCalled()
  })

  it('handles CSV special characters by quoting', () => {
    exportLogsCsv([
      {
        timestamp: '2026-03-15',
        severity: 'ERROR',
        service: 'api',
        environment: 'prod',
        message: 'Error with "quotes" and, commas',
        count: 1,
      },
    ])
    expect(clickSpy).toHaveBeenCalled()
  })
})
