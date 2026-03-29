import type {
  PipelineRun,
  PipelineRunConclusion,
  PipelineRunStatus,
  PipelineSummary,
  PipelineWorkflow,
} from '../../../shared/types/pipeline.js'
import { listWorkflows, listWorkflowRuns } from './github.js'

// ── In-memory cache (60s TTL) ───────────────────────────────────────────────

interface CacheEntry {
  data: PipelineSummary
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60_000

// ── Status mapping ──────────────────────────────────────────────────────────

export function mapStatus(ghStatus: string, ghConclusion: string | null): PipelineRunStatus {
  switch (ghStatus) {
    case 'completed':
      switch (ghConclusion) {
        case 'success':
          return 'success'
        case 'failure':
          return 'failure'
        case 'cancelled':
          return 'cancelled'
        case 'skipped':
          return 'skipped'
        case 'timed_out':
          return 'failure'
        default:
          return 'failure'
      }
    case 'in_progress':
    case 'action_required':
      return 'in_progress'
    case 'queued':
    case 'waiting':
    case 'requested':
    case 'pending':
      return 'queued'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'queued'
  }
}

export function mapConclusion(ghConclusion: string | null): PipelineRunConclusion {
  if (ghConclusion === null) return null
  const valid: PipelineRunConclusion[] = ['success', 'failure', 'cancelled', 'skipped', 'timed_out']
  return valid.includes(ghConclusion as PipelineRunConclusion)
    ? (ghConclusion as PipelineRunConclusion)
    : null
}

// ── Transform GitHub API run → frontend PipelineRun ─────────────────────────

interface GitHubWorkflowRun {
  id: number
  workflow_id: number
  name: string | null
  status: string | null
  conclusion: string | null
  head_branch: string | null
  head_sha: string
  head_commit: { message: string } | null
  actor: { login: string } | null
  run_started_at?: string | null
  created_at: string
  updated_at: string
  html_url: string
}

export function transformRun(run: GitHubWorkflowRun): PipelineRun {
  const status = mapStatus(run.status ?? 'queued', run.conclusion)
  const conclusion = mapConclusion(run.conclusion)
  const startedAt = run.run_started_at ?? run.created_at
  const completedAt = run.status === 'completed' ? run.updated_at : null
  const durationSeconds =
    completedAt && startedAt
      ? Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)
      : null

  return {
    id: run.id,
    workflowId: run.workflow_id,
    workflowName: run.name ?? 'Unknown',
    status,
    conclusion,
    branch: run.head_branch ?? 'unknown',
    commitSha: run.head_sha.slice(0, 7),
    commitMessage: (run.head_commit?.message ?? '').split('\n')[0],
    actor: run.actor?.login ?? 'unknown',
    startedAt,
    completedAt,
    durationSeconds,
    url: run.html_url,
  }
}

// ── Calculate workflow metrics ──────────────────────────────────────────────

export function calculatePassRate(runs: PipelineRun[]): number {
  const completed = runs.filter((r) => r.conclusion !== null)
  if (completed.length === 0) return 0
  const passed = completed.filter((r) => r.conclusion === 'success').length
  return Math.round((passed / completed.length) * 10000) / 100
}

export function calculateAvgDuration(runs: PipelineRun[]): number {
  const durations = runs.map((r) => r.durationSeconds).filter((d): d is number => d !== null)
  if (durations.length === 0) return 0
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

// ── Main fetch function ─────────────────────────────────────────────────────

export async function fetchPipelineSummary(
  repoId: string,
  owner: string,
  repo: string,
  githubToken?: string,
  userId?: string,
): Promise<PipelineSummary> {
  const cacheKey = `${owner}/${repo}:${userId ?? 'shared'}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return { ...cached.data, repoId }
  }

  const ghWorkflows = await listWorkflows(owner, repo, githubToken)

  const workflows: PipelineWorkflow[] = await Promise.all(
    ghWorkflows.map(async (wf) => {
      const ghRuns = await listWorkflowRuns(owner, repo, wf.id, {}, githubToken)
      const runs = ghRuns.map((run) => transformRun({
        id: run.id,
        workflow_id: run.workflow_id,
        name: run.name ?? null,
        status: run.status ?? null,
        conclusion: run.conclusion ?? null,
        head_branch: run.head_branch,
        head_sha: run.head_sha,
        head_commit: run.head_commit ?? null,
        actor: run.actor ?? null,
        run_started_at: run.run_started_at ?? null,
        created_at: run.created_at,
        updated_at: run.updated_at,
        html_url: run.html_url,
      }))

      return {
        id: wf.id,
        name: wf.name,
        path: wf.path,
        state: wf.state === 'active' ? 'active' : 'disabled_manually',
        recentRuns: runs.slice(0, 5),
        passRate7d: calculatePassRate(runs),
        avgDurationSeconds: calculateAvgDuration(runs),
      } satisfies PipelineWorkflow
    }),
  )

  const allRuns = workflows.flatMap((w) => w.recentRuns)
  const totalRuns7d = allRuns.length
  const failedRuns7d = allRuns.filter((r) => r.conclusion === 'failure').length

  const summary: PipelineSummary = {
    repoId,
    workflows,
    totalRuns7d,
    failedRuns7d,
    overallPassRate7d: totalRuns7d > 0 ? Math.round(((totalRuns7d - failedRuns7d) / totalRuns7d) * 10000) / 100 : 0,
    lastUpdated: new Date().toISOString(),
  }

  cache.set(cacheKey, { data: summary, expiresAt: Date.now() + CACHE_TTL_MS })
  return summary
}
