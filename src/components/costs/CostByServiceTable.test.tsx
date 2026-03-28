import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CostByServiceTable } from './CostByServiceTable'
import type { CostByService } from '@/types/costs'

const mockServices: CostByService[] = [
  { serviceId: 'ec2', serviceName: 'EC2', currentPeriodCost: 500, previousPeriodCost: 400, trend: 'up', trendPercent: 25 },
  { serviceId: 's3', serviceName: 'S3', currentPeriodCost: 200, previousPeriodCost: 250, trend: 'down', trendPercent: 20 },
  { serviceId: 'rds', serviceName: 'RDS', currentPeriodCost: 300, previousPeriodCost: 300, trend: 'stable', trendPercent: 0 },
]

describe('CostByServiceTable', () => {
  it('renders all services', () => {
    render(<CostByServiceTable services={mockServices} />)
    expect(screen.getByText('EC2')).toBeInTheDocument()
    expect(screen.getByText('S3')).toBeInTheDocument()
    expect(screen.getByText('RDS')).toBeInTheDocument()
  })

  it('sorts by current period cost descending', () => {
    const { container } = render(<CostByServiceTable services={mockServices} />)
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0].textContent).toContain('EC2')
    expect(rows[1].textContent).toContain('RDS')
    expect(rows[2].textContent).toContain('S3')
  })

  it('shows column headers', () => {
    render(<CostByServiceTable services={mockServices} />)
    expect(screen.getByText('Service')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  it('formats currency values', () => {
    render(<CostByServiceTable services={mockServices} />)
    expect(screen.getByText('$500.00')).toBeInTheDocument()
  })
})
