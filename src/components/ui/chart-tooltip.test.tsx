import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartTooltip } from './chart-tooltip'

describe('ChartTooltip', () => {
  it('renders nothing when not active', () => {
    const { container } = render(<ChartTooltip active={false} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when no payload', () => {
    const { container } = render(<ChartTooltip active={true} payload={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders label and payload', () => {
    render(
      <ChartTooltip
        active={true}
        label="Jan 1"
        payload={[{ name: 'Cost', value: 100, color: '#0ea5e9' }]}
      />,
    )
    expect(screen.getByText('Jan 1')).toBeInTheDocument()
    expect(screen.getByText('Cost: 100')).toBeInTheDocument()
  })

  it('uses formatter when provided', () => {
    render(
      <ChartTooltip
        active={true}
        label="Jan 1"
        payload={[{ name: 'Cost', value: 100, color: '#0ea5e9' }]}
        formatter={(v) => `$${v}`}
      />,
    )
    expect(screen.getByText('Cost: $100')).toBeInTheDocument()
  })
})
