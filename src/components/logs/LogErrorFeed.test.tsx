import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogErrorFeed } from './LogErrorFeed'
import type { LogEntry } from '@/types/logs'

const now = new Date().toISOString()

const mockEntries: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: now,
    severity: 'CRITICAL',
    source: 'cloudwatch',
    service: 'api-gateway',
    environment: 'production',
    message: 'Database connection timeout',
    count: 5,
    firstSeen: now,
    lastSeen: now,
    metadata: { traceId: 'abc-123', region: 'us-east-1' },
  },
  {
    id: 'log-2',
    timestamp: now,
    severity: 'ERROR',
    source: 'cloudwatch',
    service: 'auth-service',
    environment: 'staging',
    message: 'Token validation failed',
    count: 1,
    firstSeen: now,
    lastSeen: now,
    metadata: {},
  },
]

describe('LogErrorFeed', () => {
  it('renders log entries', () => {
    render(<LogErrorFeed entries={mockEntries} />)
    expect(screen.getByText('Database connection timeout')).toBeInTheDocument()
    expect(screen.getByText('Token validation failed')).toBeInTheDocument()
  })

  it('shows severity badges', () => {
    render(<LogErrorFeed entries={mockEntries} />)
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
    expect(screen.getByText('ERROR')).toBeInTheDocument()
  })

  it('shows service names', () => {
    render(<LogErrorFeed entries={mockEntries} />)
    expect(screen.getByText('api-gateway')).toBeInTheDocument()
    expect(screen.getByText('auth-service')).toBeInTheDocument()
  })

  it('shows occurrence count for entries with count > 1', () => {
    render(<LogErrorFeed entries={mockEntries} />)
    expect(screen.getByText('x5')).toBeInTheDocument()
  })

  it('expands metadata on click', async () => {
    render(<LogErrorFeed entries={mockEntries} />)
    // The first entry has metadata, so clicking should expand it
    const expandButtons = screen.getAllByRole('button')
    await userEvent.click(expandButtons[0])
    expect(screen.getByText('traceId')).toBeInTheDocument()
    expect(screen.getByText('abc-123')).toBeInTheDocument()
  })

  it('shows empty state message when no entries', () => {
    render(<LogErrorFeed entries={[]} />)
    expect(screen.getByText('No log entries to display.')).toBeInTheDocument()
  })

  it('shows environment info', () => {
    render(<LogErrorFeed entries={mockEntries} />)
    expect(screen.getByText(/production/)).toBeInTheDocument()
  })
})
