import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'

function AuthConsumer() {
  const { user, isAuthenticated, isGuest, loginAsGuest, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <span data-testid="guest">{String(isGuest)}</span>
      <span data-testid="name">{user?.name ?? 'none'}</span>
      <button onClick={loginAsGuest}>Guest</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => login({ credential: undefined })}>LoginNoCredential</button>
    </div>
  )
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('authed').textContent).toBe('false')
  })

  it('logs in as guest', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guest' }))
    expect(screen.getByTestId('authed').textContent).toBe('true')
    expect(screen.getByTestId('guest').textContent).toBe('true')
    expect(screen.getByTestId('name').textContent).toBe('Guest')
  })

  it('logs out', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guest' }))
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(screen.getByTestId('authed').textContent).toBe('false')
  })

  it('persists guest session to localStorage', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guest' }))
    const stored = JSON.parse(localStorage.getItem('sre_monitor_user')!)
    expect(stored.name).toBe('Guest')
    expect(stored.isGuest).toBe(true)
  })

  it('does NOT store raw JWT credential in localStorage', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Guest' }))
    const stored = localStorage.getItem('sre_monitor_user')!
    expect(stored).not.toContain('credential')
  })

  it('restores session from localStorage', async () => {
    localStorage.setItem(
      'sre_monitor_user',
      JSON.stringify({ name: 'Guest', email: '', picture: null, sub: 'guest', isGuest: true }),
    )
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await act(async () => {})
    expect(screen.getByTestId('name').textContent).toBe('Guest')
  })

  it('clears corrupted session on restore', async () => {
    localStorage.setItem('sre_monitor_user', JSON.stringify({ bad: 'data' }))
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await act(async () => {})
    expect(screen.getByTestId('authed').textContent).toBe('false')
    expect(localStorage.getItem('sre_monitor_user')).toBeNull()
  })

  it('throws when used outside provider', () => {
    expect(() => {
      render(<AuthConsumer />)
    }).toThrow('useAuth must be used inside <AuthProvider>')
  })

  it('ignores login with no credential', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'LoginNoCredential' }))
    expect(screen.getByTestId('authed').textContent).toBe('false')
  })
})

describe('AuthContext - JWT validation', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  function LoginWithJwt({ jwt }: { jwt: string }) {
    const { login, user } = useAuth()
    return (
      <div>
        <button onClick={() => login({ credential: jwt })}>Login</button>
        <span data-testid="name">{user?.name ?? 'none'}</span>
      </div>
    )
  }

  it('rejects JWT with invalid format (not 3 parts)', async () => {
    render(
      <AuthProvider>
        <LoginWithJwt jwt="not-a-jwt" />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('none')
  })

  it('rejects expired JWT', async () => {
    const jwt = makeJwt({
      name: 'Test',
      email: 'test@example.com',
      sub: '123',
      exp: Math.floor(Date.now() / 1000) - 3600,
    })
    render(
      <AuthProvider>
        <LoginWithJwt jwt={jwt} />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('none')
  })

  it('rejects JWT with wrong issuer', async () => {
    const jwt = makeJwt({
      name: 'Test',
      email: 'test@example.com',
      sub: '123',
      iss: 'https://evil.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    render(
      <AuthProvider>
        <LoginWithJwt jwt={jwt} />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('none')
  })

  it('rejects JWT with missing required fields', async () => {
    const jwt = makeJwt({ foo: 'bar' })
    render(
      <AuthProvider>
        <LoginWithJwt jwt={jwt} />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('none')
  })

  it('accepts valid JWT with Google issuer', async () => {
    const jwt = makeJwt({
      name: 'Valid User',
      email: 'valid@gmail.com',
      sub: 'google-123',
      picture: null,
      iss: 'https://accounts.google.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    render(
      <AuthProvider>
        <LoginWithJwt jwt={jwt} />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('Valid User')
  })

  it('accepts JWT without iss (legacy tokens)', async () => {
    const jwt = makeJwt({
      name: 'Legacy User',
      email: 'legacy@gmail.com',
      sub: 'legacy-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    render(
      <AuthProvider>
        <LoginWithJwt jwt={jwt} />
      </AuthProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByTestId('name').textContent).toBe('Legacy User')
  })
})
