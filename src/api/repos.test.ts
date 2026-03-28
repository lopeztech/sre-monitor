import { describe, it, expect } from 'vitest'
import { apiFetch } from './client'
import type { RegisteredRepository } from '@/types/repository'

describe('Repository API (integration with MSW)', () => {
  it('analyzes a repository URL', async () => {
    const result = await apiFetch<RegisteredRepository>('/api/repos/analyze', {
      method: 'POST',
      body: JSON.stringify({ githubUrl: 'https://github.com/acme/frontend-app' }),
    })

    expect(result.owner).toBe('acme')
    expect(result.repo).toBe('frontend-app')
    expect(result.fullName).toBe('acme/frontend-app')
    expect(result.status).toBe('ready')
    expect(result.analysis).not.toBeNull()
    expect(result.analysis!.detectedStack.length).toBeGreaterThan(0)
    expect(result.analysis!.hasGithubActions).toBe(true)
  })

  it('returns 400 for invalid URL', async () => {
    await expect(
      apiFetch('/api/repos/analyze', {
        method: 'POST',
        body: JSON.stringify({ githubUrl: 'not-a-url' }),
      }),
    ).rejects.toThrow()
  })

  it('fetches cost data for demo repo', async () => {
    const result = await apiFetch<{ repoId: string; provider: string }>('/api/repos/repo-frontend/costs')
    expect(result.repoId).toBe('repo-frontend')
    expect(result.provider).toBe('aws')
  })

  it('fetches pipeline data for demo repo', async () => {
    const result = await apiFetch<{ repoId: string; workflows: unknown[] }>('/api/repos/repo-frontend/pipelines')
    expect(result.repoId).toBe('repo-frontend')
    expect(result.workflows.length).toBeGreaterThan(0)
  })

  it('fetches vulnerability data for demo repo', async () => {
    const result = await apiFetch<{ repoId: string; securityScore: number }>('/api/repos/repo-frontend/vulnerabilities')
    expect(result.repoId).toBe('repo-frontend')
    expect(result.securityScore).toBeGreaterThanOrEqual(0)
  })

  it('fetches log data for demo repo', async () => {
    const result = await apiFetch<{ repoId: string; entries: unknown[] }>('/api/repos/repo-frontend/logs')
    expect(result.repoId).toBe('repo-frontend')
    expect(result.entries.length).toBeGreaterThan(0)
  })

  it('fetches coverage data for demo repo', async () => {
    const result = await apiFetch<{ repoId: string; files: unknown[] }>('/api/repos/repo-frontend/coverage')
    expect(result.repoId).toBe('repo-frontend')
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('returns 404 for unknown repo', async () => {
    await expect(apiFetch('/api/repos/nonexistent')).rejects.toThrow()
  })
})
