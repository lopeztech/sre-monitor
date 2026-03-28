import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PipelineList } from './PipelineList'
import type { PipelineWorkflow } from '@/types/pipeline'

const mockWorkflows: PipelineWorkflow[] = [
  {
    id: 1,
    name: 'CI',
    path: '.github/workflows/ci.yml',
    state: 'active',
    passRate7d: 92,
    avgDurationSeconds: 180,
    recentRuns: [
      {
        id: 101,
        workflowId: 1,
        workflowName: 'CI',
        status: 'success',
        conclusion: 'success',
        branch: 'main',
        commitSha: 'abc123',
        commitMessage: 'fix: resolve bug',
        actor: 'dev1',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 120,
        url: 'https://github.com/runs/101',
      },
      {
        id: 102,
        workflowId: 1,
        workflowName: 'CI',
        status: 'failure',
        conclusion: 'failure',
        branch: 'main',
        commitSha: 'def456',
        commitMessage: 'feat: add feature',
        actor: 'dev2',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        durationSeconds: 90,
        url: 'https://github.com/runs/102',
      },
    ],
  },
]

describe('PipelineList', () => {
  it('renders workflow names', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText('CI')).toBeInTheDocument()
  })

  it('renders workflow paths', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText('.github/workflows/ci.yml')).toBeInTheDocument()
  })

  it('shows pass rate badge', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText('92% pass rate')).toBeInTheDocument()
  })

  it('shows average duration', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText(/avg 3m 0s/)).toBeInTheDocument()
  })

  it('renders recent run commit messages', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText('fix: resolve bug')).toBeInTheDocument()
    expect(screen.getByText('feat: add feature')).toBeInTheDocument()
  })

  it('shows run status dots', () => {
    const { container } = render(<PipelineList workflows={mockWorkflows} />)
    const dots = container.querySelectorAll('.rounded-full.h-2\\.5')
    expect(dots.length).toBe(2)
  })

  it('shows run count label', () => {
    render(<PipelineList workflows={mockWorkflows} />)
    expect(screen.getByText(/Last 2 runs/)).toBeInTheDocument()
  })
})
