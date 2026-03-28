import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCosts } from './useCosts'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useCosts', () => {
  it('fetches cost data for a repo', async () => {
    const { result } = renderHook(() => useCosts('repo-frontend'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data).toBeDefined()
    expect(result.current.data!.repoId).toBe('repo-frontend')
    expect(result.current.data!.provider).toBe('aws')
    expect(result.current.data!.history.length).toBeGreaterThan(0)
    expect(result.current.data!.byService.length).toBeGreaterThan(0)
  })

  it('does not fetch when repoId is empty', () => {
    const { result } = renderHook(() => useCosts(''), {
      wrapper: createWrapper(),
    })
    expect(result.current.isFetching).toBe(false)
  })
})
