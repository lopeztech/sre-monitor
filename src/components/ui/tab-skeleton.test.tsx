import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  CostsTabSkeleton,
  PipelinesTabSkeleton,
  SecurityTabSkeleton,
  LogsTabSkeleton,
  CoverageTabSkeleton,
} from './tab-skeleton'

describe('Tab skeletons', () => {
  it('renders CostsTabSkeleton with pulse animations', () => {
    const { container } = render(<CostsTabSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5)
  })

  it('renders PipelinesTabSkeleton', () => {
    const { container } = render(<PipelinesTabSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5)
  })

  it('renders SecurityTabSkeleton', () => {
    const { container } = render(<SecurityTabSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5)
  })

  it('renders LogsTabSkeleton', () => {
    const { container } = render(<LogsTabSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5)
  })

  it('renders CoverageTabSkeleton', () => {
    const { container } = render(<CoverageTabSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5)
  })
})
