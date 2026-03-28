export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'unknown'
export type RepoStatus = 'analyzing' | 'ready' | 'error'

export interface RepositoryAnalysis {
  analyzedAt: string
  detectedStack: string[]
  cloudProvider: CloudProvider
  cloudAccountId: string | null
  hasGithubActions: boolean
  hasDependabot: boolean
  hasCodecov: boolean
  infraFiles: string[]
}

export interface RegisteredRepository {
  id: string
  owner: string
  repo: string
  fullName: string
  githubUrl: string
  defaultBranch: string
  registeredAt: string
  status: RepoStatus
  analysis: RepositoryAnalysis | null
}
