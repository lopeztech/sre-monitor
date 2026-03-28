import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SecurityScoreCard } from './SecurityScoreCard'
import type { VulnerabilitySummary } from '@/types/vulnerability'

const mockData: VulnerabilitySummary = {
  repoId: 'repo-1',
  total: 10,
  bySeverity: { critical: 1, high: 2, medium: 3, low: 3, informational: 1 },
  openCount: 6,
  securityScore: 72,
  vulnerabilities: [],
  lastUpdated: '2026-03-15T00:00:00Z',
}

describe('SecurityScoreCard', () => {
  it('renders the security score', () => {
    render(<SecurityScoreCard data={mockData} />)
    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('shows score label', () => {
    render(<SecurityScoreCard data={mockData} />)
    expect(screen.getByText('Fair')).toBeInTheDocument()
  })

  it('shows good label for score >= 80', () => {
    render(<SecurityScoreCard data={{ ...mockData, securityScore: 85 }} />)
    expect(screen.getByText('Good')).toBeInTheDocument()
  })

  it('shows poor label for score < 60', () => {
    render(<SecurityScoreCard data={{ ...mockData, securityScore: 45 }} />)
    expect(screen.getByText('Poor')).toBeInTheDocument()
  })

  it('shows open vulnerability count', () => {
    render(<SecurityScoreCard data={mockData} />)
    expect(screen.getByText(/6 open vulnerabilities/)).toBeInTheDocument()
  })

  it('renders severity bars for non-zero counts', () => {
    render(<SecurityScoreCard data={mockData} />)
    expect(screen.getByText('critical')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
  })
})
