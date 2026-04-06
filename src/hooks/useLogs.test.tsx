import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLogs } from './useLogs'
import { useRegistryStore } from '@/store/registryStore'
import { repositoryFixtures } from '@/mocks/fixtures/repositories'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useLogs', () => {
  beforeEach(() => {
    useRegistryStore.setState({ repositories: repositoryFixtures })
  })

  it('fetches log data', async () => {
    const { result } = renderHook(() => useLogs('repo-frontend'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    expect(result.current.data).toBeDefined()
    expect(result.current.data!.totalErrors).toBeGreaterThanOrEqual(0)
    expect(result.current.data!.entries.length).toBeGreaterThan(0)
  })
})
