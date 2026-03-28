import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExportButton } from './export-button'

describe('ExportButton', () => {
  it('renders default label', () => {
    render(<ExportButton onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<ExportButton onClick={vi.fn()} label="Download" />)
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<ExportButton onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
