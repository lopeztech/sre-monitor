import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogFilters } from './LogFilters'
import { useUIStore } from '@/store/uiStore'
import type { LogEntry } from '@/types/logs'

const now = new Date().toISOString()
const mockEntries: LogEntry[] = [
  {
    id: '1', timestamp: now, severity: 'CRITICAL', source: 'cloudwatch',
    service: 'api-gateway', environment: 'production', message: 'DB timeout',
    count: 5, firstSeen: now, lastSeen: now, metadata: {},
  },
  {
    id: '2', timestamp: now, severity: 'ERROR', source: 'cloudwatch',
    service: 'auth-service', environment: 'staging', message: 'Auth failed',
    count: 2, firstSeen: now, lastSeen: now, metadata: {},
  },
  {
    id: '3', timestamp: now, severity: 'WARNING', source: 'cloudwatch',
    service: 'api-gateway', environment: 'production', message: 'High latency',
    count: 1, firstSeen: now, lastSeen: now, metadata: {},
  },
]

describe('LogFilters', () => {
  beforeEach(() => {
    useUIStore.setState({ activeLogRange: '24h' })
  })

  it('renders time range buttons', () => {
    render(<LogFilters />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
    expect(screen.getByText('7d')).toBeInTheDocument()
  })

  it('changes time range on click', async () => {
    render(<LogFilters />)
    await userEvent.click(screen.getByText('7d'))
    expect(useUIStore.getState().activeLogRange).toBe('7d')
  })

  it('renders search input', () => {
    render(<LogFilters entries={mockEntries} onFilterChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument()
  })

  it('filters entries by search query', async () => {
    const onFilter = vi.fn()
    render(<LogFilters entries={mockEntries} onFilterChange={onFilter} />)
    await userEvent.type(screen.getByPlaceholderText('Search logs...'), 'timeout')

    // Last call should have only the entry matching "timeout"
    const lastCall = onFilter.mock.calls[onFilter.mock.calls.length - 1][0]
    expect(lastCall).toHaveLength(1)
    expect(lastCall[0].message).toContain('timeout')
  })

  it('shows filter button', () => {
    render(<LogFilters entries={mockEntries} onFilterChange={vi.fn()} />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('toggles advanced filters panel', async () => {
    render(<LogFilters entries={mockEntries} onFilterChange={vi.fn()} />)
    await userEvent.click(screen.getByText('Filters'))
    expect(screen.getByText('Severity')).toBeInTheDocument()
  })

  it('renders without entries prop (no-filter mode)', () => {
    render(<LogFilters />)
    // Should render time range buttons fine
    expect(screen.getByText('24h')).toBeInTheDocument()
  })
})
