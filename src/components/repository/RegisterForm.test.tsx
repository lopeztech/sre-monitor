import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RegisterForm } from './RegisterForm'

vi.mock('@/contexts/GitHubAuthContext', () => ({
  useGitHubAuth: () => ({
    githubUser: null,
    isGitHubConnected: false,
    isConnecting: false,
    connectGitHub: vi.fn(),
    disconnectGitHub: vi.fn(),
  }),
}))

const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }: Record<string, unknown>) => <a {...props}>{children as React.ReactNode}</a>,
  useParams: () => ({}),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('RegisterForm', () => {
  it('renders the form', () => {
    render(<RegisterForm />, { wrapper: Wrapper })
    expect(screen.getByText('Register Repository')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub Repository URL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analyze Repository/i })).toBeInTheDocument()
  })

  it('shows validation error for empty submit', async () => {
    render(<RegisterForm />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /Analyze/i }))
    await waitFor(() => {
      expect(screen.getByText(/GitHub URL is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid URL', async () => {
    render(<RegisterForm />, { wrapper: Wrapper })
    await userEvent.type(screen.getByLabelText('GitHub Repository URL'), 'not-a-url')
    await userEvent.click(screen.getByRole('button', { name: /Analyze/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid GitHub URL/i)).toBeInTheDocument()
    })
  })

  it('submits and shows analysis results', async () => {
    render(<RegisterForm />, { wrapper: Wrapper })
    await userEvent.type(
      screen.getByLabelText('GitHub Repository URL'),
      'https://github.com/acme/frontend-app',
    )
    await userEvent.click(screen.getByRole('button', { name: /Analyze/i }))

    // Should show analysis results after MSW responds
    await waitFor(
      () => {
        expect(screen.getByText('Analysis Complete')).toBeInTheDocument()
      },
      { timeout: 10000 },
    )

    expect(screen.getByText('acme/frontend-app')).toBeInTheDocument()
    expect(screen.getByText('Add Repository')).toBeInTheDocument()
  })

  it('shows back button on analysis view', async () => {
    render(<RegisterForm />, { wrapper: Wrapper })
    await userEvent.type(
      screen.getByLabelText('GitHub Repository URL'),
      'https://github.com/acme/frontend-app',
    )
    await userEvent.click(screen.getByRole('button', { name: /Analyze/i }))

    await waitFor(
      () => expect(screen.getByText('Analysis Complete')).toBeInTheDocument(),
      { timeout: 10000 },
    )

    await userEvent.click(screen.getByRole('button', { name: /Back/i }))
    expect(screen.getByText('Register Repository')).toBeInTheDocument()
  })
})
