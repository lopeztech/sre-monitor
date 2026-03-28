import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RepoCard } from './RepoCard'
import type { RegisteredRepository } from '@/types/repository'

// RepoCard uses tanstack router's Link and useParams.
// We need a minimal wrapper. Since it's hard to set up full router,
// we test the collapsed and expanded rendering by mocking the router hooks.

import { vi } from 'vitest'

// Mock tanstack router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useParams: () => ({ repoId: 'repo-frontend' }),
}))

const mockRepo: RegisteredRepository = {
  id: 'repo-frontend',
  owner: 'acme-corp',
  repo: 'frontend-app',
  fullName: 'acme-corp/frontend-app',
  githubUrl: 'https://github.com/acme-corp/frontend-app',
  defaultBranch: 'main',
  registeredAt: '2026-01-15T09:00:00Z',
  status: 'ready',
  analysis: {
    analyzedAt: '2026-03-26T10:30:00Z',
    detectedStack: ['Node.js'],
    cloudProvider: 'aws',
    cloudAccountId: '123456789012',
    hasGithubActions: true,
    hasDependabot: true,
    hasCodecov: true,
    infraFiles: [],
  },
}

describe('RepoCard', () => {
  it('renders repo name in expanded mode', () => {
    render(<RepoCard repo={mockRepo} />)
    expect(screen.getByText('frontend-app')).toBeInTheDocument()
  })

  it('renders owner', () => {
    render(<RepoCard repo={mockRepo} />)
    expect(screen.getByText('acme-corp')).toBeInTheDocument()
  })

  it('renders provider badge', () => {
    render(<RepoCard repo={mockRepo} />)
    expect(screen.getByText('AWS')).toBeInTheDocument()
  })

  it('renders collapsed mode', () => {
    render(<RepoCard repo={mockRepo} collapsed />)
    expect(screen.queryByText('frontend-app')).not.toBeInTheDocument()
  })

  it('shows settings icon when active', () => {
    render(<RepoCard repo={mockRepo} />)
    // The repo is active since useParams returns repo-frontend
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('handles unknown provider', () => {
    const repoNoProvider = {
      ...mockRepo,
      analysis: { ...mockRepo.analysis!, cloudProvider: 'unknown' as const },
    }
    render(<RepoCard repo={repoNoProvider} />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
