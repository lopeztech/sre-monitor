import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCosts } from './useCosts'
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

describe('useCosts', () => {
  beforeEach(() => {
    useRegistryStore.setState({ repositories: repositoryFixtures })
  })

  it('fetches cost data for a repo', async () => {
    const { result } = renderHook(() => useCosts('repo-frontend'), {
      wrapper: createWrapper(),
    })

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
