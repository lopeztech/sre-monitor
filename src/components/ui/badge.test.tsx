import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">OK</Badge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('green')
  })

  it('applies size classes', () => {
    const { container } = render(<Badge size="md">Big</Badge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('text-sm')
  })

  it('defaults to default variant and sm size', () => {
    const { container } = render(<Badge>Default</Badge>)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('text-xs')
  })
})
