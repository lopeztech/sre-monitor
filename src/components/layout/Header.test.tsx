import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRegistryStore } from '@/store/registryStore'
import { useUIStore } from '@/store/uiStore'

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com', picture: null, sub: '123' },
    isGuest: false,
    logout: vi.fn(),
  }),
}))

// Mock ThemeToggle to avoid store issues
vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>,
}))

// Import Header AFTER mocks
import { Header } from './Header'

describe('Header', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarCollapsed: false })
    useRegistryStore.setState({
      repositories: [
        {
          id: 'repo-1', owner: 'acme', repo: 'app', fullName: 'acme/app',
          githubUrl: '', defaultBranch: 'main', registeredAt: '',
          status: 'ready', analysis: null,
        },
      ],
    })
  })

  it('renders sidebar toggle button', () => {
    render(<Header />)
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument()
  })

  it('shows repo name when repoId is provided', () => {
    render(<Header repoId="repo-1" />)
    expect(screen.getByText('acme/app')).toBeInTheDocument()
  })

  it('shows user name', () => {
    render(<Header />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('renders theme toggle', () => {
    render(<Header />)
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
  })

  it('toggles sidebar', async () => {
    render(<Header />)
    expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    await userEvent.click(screen.getByLabelText('Toggle sidebar'))
    expect(useUIStore.getState().sidebarCollapsed).toBe(true)
  })
})
