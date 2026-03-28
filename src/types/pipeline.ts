export type PipelineRunStatus = 'success' | 'failure' | 'in_progress' | 'cancelled' | 'skipped' | 'queued'
export type PipelineRunConclusion = 'success' | 'failure' | 'cancelled' | 'skipped' | 'timed_out' | null

export interface PipelineRun {
  id: number
  workflowId: number
  workflowName: string
  status: PipelineRunStatus
  conclusion: PipelineRunConclusion
  branch: string
  commitSha: string
  commitMessage: string
  actor: string
  startedAt: string
  completedAt: string | null
  durationSeconds: number | null
  url: string
}

export interface PipelineWorkflow {
  id: number
  name: string
  path: string
  state: 'active' | 'disabled_manually'
  recentRuns: PipelineRun[]
  passRate7d: number
  avgDurationSeconds: number
}

export interface PipelineSummary {
  repoId: string
  workflows: PipelineWorkflow[]
  totalRuns7d: number
  failedRuns7d: number
  overallPassRate7d: number
  lastUpdated: string
}
