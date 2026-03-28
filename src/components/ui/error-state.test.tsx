import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from './error-state'

describe('ErrorState', () => {
  it('renders default title and description', () => {
    render(<ErrorState />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    render(<ErrorState title="Custom error" description="Custom msg" />)
    expect(screen.getByText('Custom error')).toBeInTheDocument()
    expect(screen.getByText('Custom msg')).toBeInTheDocument()
  })

  it('shows retry button when onRetry provided', () => {
    render(<ErrorState onRetry={vi.fn()} />)
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls onRetry when clicking retry', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('hides retry when no onRetry', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
