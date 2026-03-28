import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCoverage } from './useCoverage'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCoverage', () => {
  it('fetches coverage data', async () => {
    const { result } = renderHook(() => useCoverage('repo-frontend'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data).toBeDefined()
    expect(result.current.data!.provider).toBeDefined()
    expect(result.current.data!.files.length).toBeGreaterThan(0)
    expect(result.current.data!.threshold).toBeGreaterThan(0)
  })
})
