/**
 * UI Smoke Tests
 *
 * Verify that core pages and components render without crashing.
 * These are intentionally lightweight — they check that key elements
 * appear on screen, not detailed behaviour.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRegistryStore } from '@/store/registryStore'
import { useUIStore } from '@/store/uiStore'
import { repositoryFixtures } from '@/mocks/fixtures/repositories'

// ── Shared mocks ────────────────────────────────────────────────────────────

const mockLogout = vi.fn()
const mockLoginAsGuest = vi.fn()
const mockLogin = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com', picture: null, sub: '123' },
    isAuthenticated: true,
    isGuest: false,
    isLoading: false,
    login: mockLogin,
    loginAsGuest: mockLoginAsGuest,
    logout: mockLogout,
  }),
}))

vi.mock('@/contexts/GitHubAuthContext', () => ({
  useGitHubAuth: () => ({
    githubUser: null,
    isGitHubConnected: false,
    isConnecting: false,
    connectGitHub: vi.fn(),
    disconnectGitHub: vi.fn(),
    handleCallback: vi.fn(),
  }),
  GitHubAuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getOAuthReturnUrl: () => '/',
}))

vi.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>,
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [k: string]: unknown }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useParams: () => ({ repoId: 'repo-frontend' }),
  useNavigate: () => vi.fn(),
  Navigate: () => null,
  useSearch: () => ({ code: '', state: '' }),
  createRoute: () => ({ addChildren: () => ({}) }),
  createRouter: () => ({}),
  createRootRoute: () => ({}),
  RouterProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}))

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  useRegistryStore.setState({ repositories: repositoryFixtures })
  useUIStore.setState({ sidebarCollapsed: false })
})

// ── Login Page ──────────────────────────────────────────────────────────────

describe('Smoke: LoginPage', () => {
  // Need to re-mock useAuth as unauthenticated for login page tests
  it('renders guest login button and branding', async () => {
    // Import dynamically to get fresh module
    const { default: LoginPage } = await import('@/pages/LoginPage')
    render(<LoginPage />)

    expect(screen.getByText('SRE Monitor')).toBeInTheDocument()
    expect(screen.getByText('Continue as Guest')).toBeInTheDocument()
    expect(screen.getByText(/Sign in to access your dashboard/)).toBeInTheDocument()
  })
})

// ── Header ──────────────────────────────────────────────────────────────────

describe('Smoke: Header', () => {
  it('renders with repo info and user controls', async () => {
    const { Header } = await import('@/components/layout/Header')
    render(<Header repoId="repo-frontend" />)

    expect(screen.getByText('acme-corp/frontend-app')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument()
    expect(screen.getByLabelText('Sign out')).toBeInTheDocument()
    expect(screen.getByText('Connect GitHub')).toBeInTheDocument()
  })

  it('renders without repo context', async () => {
    const { Header } = await import('@/components/layout/Header')
    render(<Header />)

    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })
})

// ── Sidebar ─────────────────────────────────────────────────────────────────

describe('Smoke: Sidebar', () => {
  it('renders repo list and add button', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar')
    render(<Sidebar />)

    expect(screen.getByText('SRE Monitor')).toBeInTheDocument()
    expect(screen.getByText('frontend-app')).toBeInTheDocument()
    expect(screen.getByText('data-pipeline')).toBeInTheDocument()
    expect(screen.getByText('api-service')).toBeInTheDocument()
    expect(screen.getByText('Add Repository')).toBeInTheDocument()
  })

  it('renders collapsed state', async () => {
    useUIStore.setState({ sidebarCollapsed: true })
    const { Sidebar } = await import('@/components/layout/Sidebar')
    render(<Sidebar />)

    // Title should be hidden when collapsed
    expect(screen.queryByText('SRE Monitor')).not.toBeInTheDocument()
  })
})

// ── Register Form ───────────────────────────────────────────────────────────

describe('Smoke: RegisterForm', () => {
  it('renders URL input and analyze button', async () => {
    const { RegisterForm } = await import('@/components/repository/RegisterForm')
    render(<RegisterForm />, { wrapper: createWrapper() })

    expect(screen.getByText('Register Repository')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub Repository URL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analyze Repository/i })).toBeInTheDocument()
  })

  it('shows GitHub connection banner when not connected', async () => {
    const { RegisterForm } = await import('@/components/repository/RegisterForm')
    render(<RegisterForm />, { wrapper: createWrapper() })

    expect(screen.getByText(/Connect your GitHub account to access private repositories/)).toBeInTheDocument()
  })

  it('validates empty submission', async () => {
    const { RegisterForm } = await import('@/components/repository/RegisterForm')
    render(<RegisterForm />, { wrapper: createWrapper() })

    await userEvent.click(screen.getByRole('button', { name: /Analyze Repository/i }))
    await waitFor(() => {
      expect(screen.getByText(/GitHub URL is required/)).toBeInTheDocument()
    })
  })

  it('analyzes a valid repo URL via MSW', async () => {
    const { RegisterForm } = await import('@/components/repository/RegisterForm')
    render(<RegisterForm />, { wrapper: createWrapper() })

    await userEvent.type(screen.getByLabelText('GitHub Repository URL'), 'https://github.com/acme/frontend-app')
    await userEvent.click(screen.getByRole('button', { name: /Analyze Repository/i }))

    await waitFor(() => {
      expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
    }, { timeout: 10000 })

    expect(screen.getByText('Add Repository')).toBeInTheDocument()
  })
})

// ── Dashboard Overview Cards ────────────────────────────────────────────────

describe('Smoke: Dashboard Overview Cards', () => {
  it('renders cost overview card', async () => {
    const mod = await import('@/routes/app/$repoId')
    // The route file exports internal components; find CostsOverviewCard via the module
    // Since components aren't directly exported, test via the hook
    const { useCosts } = await import('@/hooks/useCosts')
    const { renderHook } = await import('@testing-library/react')

    const { result } = renderHook(() => useCosts('repo-frontend'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toBeDefined()
    expect(result.current.data!.totalCost).toBeGreaterThan(0)
  })

  it('renders pipeline data', async () => {
    const { usePipelines } = await import('@/hooks/usePipelines')
    const { renderHook } = await import('@testing-library/react')

    const { result } = renderHook(() => usePipelines('repo-frontend'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data!.workflows.length).toBeGreaterThan(0)
  })

  it('renders vulnerability data', async () => {
    const { useVulnerabilities } = await import('@/hooks/useVulnerabilities')
    const { renderHook } = await import('@testing-library/react')

    const { result } = renderHook(() => useVulnerabilities('repo-frontend'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toBeDefined()
  })

  it('renders log data', async () => {
    const { useLogs } = await import('@/hooks/useLogs')
    const { renderHook } = await import('@testing-library/react')

    const { result } = renderHook(() => useLogs('repo-frontend'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toBeDefined()
  })

  it('renders coverage data', async () => {
    const { useCoverage } = await import('@/hooks/useCoverage')
    const { renderHook } = await import('@testing-library/react')

    const { result } = renderHook(() => useCoverage('repo-frontend'), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toBeDefined()
  })
})

// ── Pipeline Components ─────────────────────────────────────────────────────

describe('Smoke: Pipeline Components', () => {
  it('renders PipelineList with workflows', async () => {
    const { PipelineList } = await import('@/components/pipelines/PipelineList')
    const { pipelinesFixtures } = await import('@/mocks/fixtures/pipelines')
    const data = pipelinesFixtures['repo-frontend']

    render(<PipelineList workflows={data.workflows} />)

    for (const wf of data.workflows) {
      expect(screen.getByText(wf.name)).toBeInTheDocument()
    }
  })
})

// ── Cost Components ─────────────────────────────────────────────────────────

describe('Smoke: Cost Components', () => {
  it('renders CostByServiceTable', async () => {
    const { CostByServiceTable } = await import('@/components/costs/CostByServiceTable')
    const { costsFixtures } = await import('@/mocks/fixtures/costs')
    const data = costsFixtures['repo-frontend']

    render(<CostByServiceTable services={data.byService} />)

    expect(screen.getByText('Service')).toBeInTheDocument()
  })
})

// ── Security Components ─────────────────────────────────────────────────────

describe('Smoke: Security Components', () => {
  it('renders VulnerabilityList', async () => {
    const { VulnerabilityList } = await import('@/components/security/VulnerabilityList')
    const { vulnerabilitiesFixtures } = await import('@/mocks/fixtures/vulnerabilities')
    const data = vulnerabilitiesFixtures['repo-frontend']

    render(<VulnerabilityList vulnerabilities={data.vulnerabilities} />)

    expect(screen.getByText(data.vulnerabilities[0].packageName)).toBeInTheDocument()
  })
})
