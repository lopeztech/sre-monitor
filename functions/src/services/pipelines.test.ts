import { describe, it, expect } from 'vitest'
import {
  mapStatus,
  mapConclusion,
  transformRun,
  calculatePassRate,
  calculateAvgDuration,
} from './pipelines.js'
import type { PipelineRun } from '../../shared/types/pipeline.js'

describe('mapStatus', () => {
  it('maps completed + success to success', () => {
    expect(mapStatus('completed', 'success')).toBe('success')
  })

  it('maps completed + failure to failure', () => {
    expect(mapStatus('completed', 'failure')).toBe('failure')
  })

  it('maps completed + cancelled to cancelled', () => {
    expect(mapStatus('completed', 'cancelled')).toBe('cancelled')
  })

  it('maps completed + skipped to skipped', () => {
    expect(mapStatus('completed', 'skipped')).toBe('skipped')
  })

  it('maps completed + timed_out to failure', () => {
    expect(mapStatus('completed', 'timed_out')).toBe('failure')
  })

  it('maps in_progress to in_progress', () => {
    expect(mapStatus('in_progress', null)).toBe('in_progress')
  })

  it('maps action_required to in_progress', () => {
    expect(mapStatus('action_required', null)).toBe('in_progress')
  })

  it('maps queued to queued', () => {
    expect(mapStatus('queued', null)).toBe('queued')
  })

  it('maps waiting to queued', () => {
    expect(mapStatus('waiting', null)).toBe('queued')
  })

  it('maps requested to queued', () => {
    expect(mapStatus('requested', null)).toBe('queued')
  })

  it('maps pending to queued', () => {
    expect(mapStatus('pending', null)).toBe('queued')
  })

  it('maps unknown status to queued', () => {
    expect(mapStatus('stale', null)).toBe('queued')
  })
})

describe('mapConclusion', () => {
  it('maps null to null', () => {
    expect(mapConclusion(null)).toBeNull()
  })

  it('maps valid conclusions', () => {
    expect(mapConclusion('success')).toBe('success')
    expect(mapConclusion('failure')).toBe('failure')
    expect(mapConclusion('cancelled')).toBe('cancelled')
    expect(mapConclusion('skipped')).toBe('skipped')
    expect(mapConclusion('timed_out')).toBe('timed_out')
  })

  it('maps unknown conclusion to null', () => {
    expect(mapConclusion('neutral')).toBeNull()
    expect(mapConclusion('stale')).toBeNull()
  })
})

describe('transformRun', () => {
  const baseRun = {
    id: 123,
    workflow_id: 10,
    name: 'CI',
    status: 'completed',
    conclusion: 'success',
    head_branch: 'main',
    head_sha: 'abc1234567890',
    head_commit: { message: 'fix: something\n\nDetailed description' },
    actor: { login: 'dev-user' },
    run_started_at: '2026-03-29T10:00:00Z',
    created_at: '2026-03-29T09:59:00Z',
    updated_at: '2026-03-29T10:05:00Z',
    html_url: 'https://github.com/org/repo/actions/runs/123',
  }

  it('transforms a completed run', () => {
    const result = transformRun(baseRun)

    expect(result.id).toBe(123)
    expect(result.workflowId).toBe(10)
    expect(result.workflowName).toBe('CI')
    expect(result.status).toBe('success')
    expect(result.conclusion).toBe('success')
    expect(result.branch).toBe('main')
    expect(result.commitSha).toBe('abc1234')
    expect(result.commitMessage).toBe('fix: something')
    expect(result.actor).toBe('dev-user')
    expect(result.durationSeconds).toBe(300)
    expect(result.url).toBe('https://github.com/org/repo/actions/runs/123')
  })

  it('handles null fields gracefully', () => {
    const result = transformRun({
      ...baseRun,
      name: null,
      status: 'in_progress',
      conclusion: null,
      head_branch: null,
      head_commit: null,
      actor: null,
      run_started_at: null,
    })

    expect(result.workflowName).toBe('Unknown')
    expect(result.status).toBe('in_progress')
    expect(result.conclusion).toBeNull()
    expect(result.branch).toBe('unknown')
    expect(result.commitMessage).toBe('')
    expect(result.actor).toBe('unknown')
    expect(result.completedAt).toBeNull()
    expect(result.durationSeconds).toBeNull()
  })
})

describe('calculatePassRate', () => {
  function makeRun(conclusion: PipelineRun['conclusion']): PipelineRun {
    return {
      id: 1, workflowId: 1, workflowName: '', status: 'success',
      conclusion, branch: '', commitSha: '', commitMessage: '',
      actor: '', startedAt: '', completedAt: '', durationSeconds: null, url: '',
    }
  }

  it('returns 100 for all successful runs', () => {
    expect(calculatePassRate([makeRun('success'), makeRun('success')])).toBe(100)
  })

  it('returns 0 for all failed runs', () => {
    expect(calculatePassRate([makeRun('failure'), makeRun('failure')])).toBe(0)
  })

  it('returns 50 for mixed results', () => {
    expect(calculatePassRate([makeRun('success'), makeRun('failure')])).toBe(50)
  })

  it('excludes runs with null conclusion', () => {
    expect(calculatePassRate([makeRun('success'), makeRun(null)])).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(calculatePassRate([])).toBe(0)
  })
})

describe('calculateAvgDuration', () => {
  function makeRun(durationSeconds: number | null): PipelineRun {
    return {
      id: 1, workflowId: 1, workflowName: '', status: 'success',
      conclusion: 'success', branch: '', commitSha: '', commitMessage: '',
      actor: '', startedAt: '', completedAt: '', durationSeconds, url: '',
    }
  }

  it('calculates average of durations', () => {
    expect(calculateAvgDuration([makeRun(100), makeRun(200), makeRun(300)])).toBe(200)
  })

  it('excludes null durations', () => {
    expect(calculateAvgDuration([makeRun(100), makeRun(null), makeRun(300)])).toBe(200)
  })

  it('returns 0 for empty array', () => {
    expect(calculateAvgDuration([])).toBe(0)
  })

  it('returns 0 when all durations are null', () => {
    expect(calculateAvgDuration([makeRun(null), makeRun(null)])).toBe(0)
  })
})
