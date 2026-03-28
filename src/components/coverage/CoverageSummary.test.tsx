import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CoverageSummary } from './CoverageSummary'
import type { CoverageSummary as CoverageSummaryType } from '@/types/coverage'

const mockData: CoverageSummaryType = {
  repoId: 'repo-1',
  provider: 'codecov',
  defaultBranchCoverage: {
    lines: { covered: 850, total: 1000, percentage: 85 },
    branches: { covered: 600, total: 800, percentage: 75 },
    functions: { covered: 180, total: 200, percentage: 90 },
    statements: { covered: 900, total: 1100, percentage: 81.8 },
  },
  threshold: 80,
  status: 'passing',
  delta: 2.5,
  history: [],
  files: [],
  lastUpdated: '2026-03-15T00:00:00Z',
}

describe('CoverageSummary', () => {
  it('renders passing status', () => {
    render(<CoverageSummary data={mockData} />)
    expect(screen.getByText(/Passing/)).toBeInTheDocument()
  })

  it('renders failing status', () => {
    render(<CoverageSummary data={{ ...mockData, status: 'failing' }} />)
    expect(screen.getByText(/Below threshold/)).toBeInTheDocument()
  })

  it('renders all coverage metrics', () => {
    render(<CoverageSummary data={mockData} />)
    expect(screen.getByText('Lines')).toBeInTheDocument()
    expect(screen.getByText('Branches')).toBeInTheDocument()
    expect(screen.getByText('Functions')).toBeInTheDocument()
    expect(screen.getByText('Statements')).toBeInTheDocument()
  })

  it('shows delta vs last commit', () => {
    render(<CoverageSummary data={mockData} />)
    expect(screen.getByText(/2\.5%/)).toBeInTheDocument()
  })

  it('shows threshold', () => {
    render(<CoverageSummary data={mockData} />)
    expect(screen.getByText(/target 80%/)).toBeInTheDocument()
  })
})
