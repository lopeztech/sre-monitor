import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CoverageFileTable } from './CoverageFileTable'
import type { CoverageFileEntry } from '@/types/coverage'

const mockFiles: CoverageFileEntry[] = [
  {
    path: 'src/App.tsx',
    lines: { covered: 85, total: 100, percentage: 85 },
    branches: { covered: 60, total: 80, percentage: 75 },
    functions: { covered: 18, total: 20, percentage: 90 },
    status: 'passing',
  },
  {
    path: 'src/api/client.ts',
    lines: { covered: 20, total: 50, percentage: 40 },
    branches: { covered: 5, total: 20, percentage: 25 },
    functions: { covered: 3, total: 10, percentage: 30 },
    status: 'failing',
  },
]

describe('CoverageFileTable', () => {
  it('renders file paths', () => {
    render(<CoverageFileTable files={mockFiles} threshold={80} />)
    expect(screen.getByText('src/App.tsx')).toBeInTheDocument()
    expect(screen.getByText('src/api/client.ts')).toBeInTheDocument()
  })

  it('renders coverage percentages', () => {
    render(<CoverageFileTable files={mockFiles} threshold={80} />)
    expect(screen.getByText('85.0%')).toBeInTheDocument()
    expect(screen.getByText('40.0%')).toBeInTheDocument()
  })

  it('colors coverage values based on threshold', () => {
    const { container } = render(<CoverageFileTable files={mockFiles} threshold={80} />)
    const cells = container.querySelectorAll('td')
    // Find the 40.0% cell - should be red (below threshold)
    const lowCell = Array.from(cells).find((c) => c.textContent === '40.0%')
    expect(lowCell?.className).toContain('red')
  })

  it('sorts by column on click', async () => {
    render(<CoverageFileTable files={mockFiles} threshold={80} />)
    const fileHeader = screen.getByRole('button', { name: /file/i })
    await userEvent.click(fileHeader)
    // Should toggle sort
  })

  it('shows column headers', () => {
    render(<CoverageFileTable files={mockFiles} threshold={80} />)
    expect(screen.getByText(/Lines/)).toBeInTheDocument()
    expect(screen.getByText(/Branches/)).toBeInTheDocument()
    expect(screen.getByText(/Functions/)).toBeInTheDocument()
  })
})
