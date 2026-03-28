import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useVulnerabilities } from './useVulnerabilities'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useVulnerabilities', () => {
  it('fetches vulnerability data', async () => {
    const { result } = renderHook(() => useVulnerabilities('repo-frontend'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data).toBeDefined()
    expect(result.current.data!.securityScore).toBeGreaterThanOrEqual(0)
    expect(result.current.data!.vulnerabilities.length).toBeGreaterThan(0)
  })
})
