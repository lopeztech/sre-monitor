import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from './MetricCard'

describe('MetricCard', () => {
  it('renders title and value', () => {
    render(<MetricCard title="Cost" value="$100" />)
    expect(screen.getByText('Cost')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<MetricCard title="Cost" value="$100" subtitle="AWS" />)
    expect(screen.getByText('AWS')).toBeInTheDocument()
  })

  it('renders trend with direction', () => {
    render(
      <MetricCard
        title="Cost"
        value="$100"
        trend={{ direction: 'up', label: '+10%', positive: false }}
      />,
    )
    expect(screen.getByText('+10%')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    const { container } = render(<MetricCard title="Cost" value="$100" loading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('does not show value when loading', () => {
    render(<MetricCard title="Cost" value="$100" loading />)
    expect(screen.queryByText('$100')).not.toBeInTheDocument()
  })

  it('applies status border class', () => {
    const { container } = render(<MetricCard title="X" value="1" status="critical" />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('red')
  })
})
