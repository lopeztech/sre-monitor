import { describe, it, expect, beforeEach } from 'vitest'
import { useRegistryStore } from './registryStore'
import type { RegisteredRepository } from '@/types/repository'

const mockRepo: RegisteredRepository = {
  id: 'test-repo-1',
  owner: 'test-owner',
  repo: 'test-repo',
  fullName: 'test-owner/test-repo',
  githubUrl: 'https://github.com/test-owner/test-repo',
  defaultBranch: 'main',
  registeredAt: '2026-01-01T00:00:00Z',
  status: 'ready',
  analysis: null,
}

describe('registryStore', () => {
  beforeEach(() => {
    useRegistryStore.setState({ repositories: [] })
  })

  it('starts with empty repositories', () => {
    expect(useRegistryStore.getState().repositories).toEqual([])
  })

  it('adds a repository', () => {
    useRegistryStore.getState().addRepository(mockRepo)
    expect(useRegistryStore.getState().repositories).toHaveLength(1)
    expect(useRegistryStore.getState().repositories[0].id).toBe('test-repo-1')
  })

  it('replaces repository with same id', () => {
    useRegistryStore.getState().addRepository(mockRepo)
    const updated = { ...mockRepo, status: 'error' as const }
    useRegistryStore.getState().addRepository(updated)
    expect(useRegistryStore.getState().repositories).toHaveLength(1)
    expect(useRegistryStore.getState().repositories[0].status).toBe('error')
  })

  it('removes a repository', () => {
    useRegistryStore.getState().addRepository(mockRepo)
    useRegistryStore.getState().removeRepository('test-repo-1')
    expect(useRegistryStore.getState().repositories).toHaveLength(0)
  })

  it('updates repository status', () => {
    useRegistryStore.getState().addRepository(mockRepo)
    useRegistryStore.getState().updateRepositoryStatus('test-repo-1', 'analyzing')
    expect(useRegistryStore.getState().repositories[0].status).toBe('analyzing')
  })

  it('updates repository analysis', () => {
    useRegistryStore.getState().addRepository(mockRepo)
    const analysis = {
      analyzedAt: '2026-03-01T00:00:00Z',
      detectedStack: ['Node.js'],
      cloudProvider: 'aws' as const,
      cloudAccountId: '123',
      hasGithubActions: true,
      hasDependabot: false,
      hasCodecov: false,
      infraFiles: [],
    }
    useRegistryStore.getState().updateRepositoryAnalysis('test-repo-1', analysis)
    const repo = useRegistryStore.getState().repositories[0]
    expect(repo.analysis).toEqual(analysis)
    expect(repo.status).toBe('ready')
  })

  it('seeds demo repos only when empty', () => {
    useRegistryStore.getState().seedDemoRepos()
    const count = useRegistryStore.getState().repositories.length
    expect(count).toBeGreaterThan(0)

    // Seeding again should not add more
    useRegistryStore.getState().seedDemoRepos()
    expect(useRegistryStore.getState().repositories.length).toBe(count)
  })
})
