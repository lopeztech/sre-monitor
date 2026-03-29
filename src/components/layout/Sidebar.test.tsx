import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import { useRegistryStore } from '@/store/registryStore'
import { useUIStore } from '@/store/uiStore'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: Record<string, unknown>) => <a href={to as string} {...props}>{children as React.ReactNode}</a>,
  useParams: () => ({}),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarCollapsed: false })
    useRegistryStore.setState({ repositories: [] })
  })

  it('renders the logo text when expanded', () => {
    render(<Sidebar />)
    expect(screen.getByText('SRE Monitor')).toBeInTheDocument()
  })

  it('hides logo text when collapsed', () => {
    useUIStore.setState({ sidebarCollapsed: true })
    render(<Sidebar />)
    expect(screen.queryByText('SRE Monitor')).not.toBeInTheDocument()
  })

  it('shows "No repos yet" when empty', () => {
    render(<Sidebar />)
    expect(screen.getByText('No repos yet')).toBeInTheDocument()
  })

  it('renders Add Repository link', () => {
    render(<Sidebar />)
    expect(screen.getByText('Add Repository')).toBeInTheDocument()
  })

  it('renders repos when available', () => {
    useRegistryStore.setState({
      repositories: [
        {
          id: 'r1', owner: 'acme', repo: 'app', fullName: 'acme/app',
          githubUrl: 'https://github.com/acme/app', defaultBranch: 'main',
          registeredAt: '2026-01-01', status: 'ready', analysis: null,
        },
      ],
    })
    render(<Sidebar />)
    expect(screen.getByText('app')).toBeInTheDocument()
  })
})
