import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CostSummary } from './CostSummary'
import type { CostSummary as CostSummaryType } from '@/types/costs'

const mockData: CostSummaryType = {
  repoId: 'repo-1',
  provider: 'aws',
  currentPeriodTotal: 1250.50,
  previousPeriodTotal: 1100.25,
  trend: 'up',
  trendPercent: 13.6,
  forecastedMonthTotal: 1400.00,
  lastUpdated: '2026-03-15T00:00:00Z',
  byService: [],
  history: [],
  anomalies: [
    {
      id: 'a1',
      detectedAt: '2026-03-10T00:00:00Z',
      serviceName: 'EC2',
      expectedAmount: 100,
      actualAmount: 250,
      percentageIncrease: 150,
      description: 'EC2 spike',
    },
  ],
}

describe('CostSummary', () => {
  it('renders current period cost', () => {
    render(<CostSummary data={mockData} />)
    expect(screen.getByText('$1,250.50')).toBeInTheDocument()
  })

  it('renders previous period cost', () => {
    render(<CostSummary data={mockData} />)
    expect(screen.getByText('$1,100.25')).toBeInTheDocument()
  })

  it('renders forecast', () => {
    render(<CostSummary data={mockData} />)
    expect(screen.getByText('$1,400.00')).toBeInTheDocument()
  })

  it('renders provider', () => {
    render(<CostSummary data={mockData} />)
    expect(screen.getByText(/AWS/)).toBeInTheDocument()
  })

  it('shows anomaly alert when anomalies exist', () => {
    render(<CostSummary data={mockData} />)
    expect(screen.getByText(/1 cost anomaly detected/)).toBeInTheDocument()
    expect(screen.getByText(/EC2/)).toBeInTheDocument()
  })

  it('does not show anomaly when none present', () => {
    render(<CostSummary data={{ ...mockData, anomalies: [] }} />)
    expect(screen.queryByText(/anomal/)).not.toBeInTheDocument()
  })
})
