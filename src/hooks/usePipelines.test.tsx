import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePipelines } from './usePipelines'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePipelines', () => {
  it('fetches pipeline data for a repo', async () => {
    const { result } = renderHook(() => usePipelines('repo-frontend'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data).toBeDefined()
    expect(result.current.data!.repoId).toBe('repo-frontend')
    expect(result.current.data!.workflows.length).toBeGreaterThan(0)
    expect(result.current.data!.overallPassRate7d).toBeGreaterThanOrEqual(0)
  })
})
