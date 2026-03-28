import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders default label for healthy', () => {
    render(<StatusBadge status="healthy" />)
    expect(screen.getByText('Healthy')).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<StatusBadge status="warning" label="Analyzing" />)
    expect(screen.getByText('Analyzing')).toBeInTheDocument()
  })

  it('renders dot with correct color for critical', () => {
    const { container } = render(<StatusBadge status="critical" />)
    const dot = container.querySelector('.rounded-full')
    expect(dot?.className).toContain('red')
  })

  it('renders all status types', () => {
    const statuses = ['healthy', 'warning', 'critical', 'unknown'] as const
    statuses.forEach((status) => {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(status.charAt(0).toUpperCase() + status.slice(1))).toBeInTheDocument()
      unmount()
    })
  })
})
