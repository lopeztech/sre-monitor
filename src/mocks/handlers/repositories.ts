import { http, HttpResponse, delay } from 'msw'
import { repositoryFixtures } from '@/mocks/fixtures/repositories'
import type { RegisteredRepository, RepositoryAnalysis, CloudProvider } from '@/types/repository'

// Simulated stack detection based on repo name patterns
function detectStack(repoName: string): string[] {
  const name = repoName.toLowerCase()
  if (name.includes('frontend') || name.includes('ui') || name.includes('web'))
    return ['Node.js', 'TypeScript', 'React', 'Vite', 'Tailwind CSS']
  if (name.includes('api') || name.includes('service') || name.includes('backend'))
    return ['Go', 'Docker', 'Kubernetes', 'PostgreSQL']
  if (name.includes('data') || name.includes('pipeline') || name.includes('etl'))
    return ['Python', 'Apache Airflow', 'Docker', 'BigQuery']
  if (name.includes('mobile') || name.includes('app'))
    return ['TypeScript', 'React Native', 'Expo']
  return ['Node.js', 'TypeScript']
}

function detectProvider(repoName: string): CloudProvider {
  const name = repoName.toLowerCase()
  if (name.includes('gcp') || name.includes('google') || name.includes('data'))
    return 'gcp'
  if (name.includes('azure') || name.includes('dotnet'))
    return 'azure'
  if (name.includes('aws') || name.includes('lambda'))
    return 'aws'
  // Default based on stack heuristics
  const stack = detectStack(repoName)
  if (stack.includes('BigQuery') || stack.includes('Apache Airflow')) return 'gcp'
  return 'aws'
}

function detectInfraFiles(repoName: string): string[] {
  const name = repoName.toLowerCase()
  const files: string[] = ['.github/workflows/ci.yml']

  if (name.includes('api') || name.includes('service')) {
    files.push('.github/workflows/deploy-production.yml', 'Dockerfile', 'helm/Chart.yaml', 'helm/values.yaml')
  }
  if (name.includes('data') || name.includes('pipeline')) {
    files.push('Dockerfile', 'docker-compose.yml', 'cloudbuild.yaml')
  }
  if (name.includes('frontend') || name.includes('web')) {
    files.push('.github/workflows/deploy.yml')
  }

  const stack = detectStack(repoName)
  if (stack.includes('Docker')) files.push('Dockerfile')
  if (stack.includes('Kubernetes')) files.push('k8s/')

  return [...new Set(files)]
}

export const repositoryHandlers = [
  http.get('/api/repos', async () => {
    await delay(300)
    return HttpResponse.json(repositoryFixtures)
  }),

  http.get('/api/repos/:repoId', async ({ params }) => {
    const { repoId } = params
    const repo = repositoryFixtures.find((r) => r.id === repoId)
    if (!repo) {
      return HttpResponse.json({ error: 'Repository not found' }, { status: 404 })
    }
    await delay(200)
    return HttpResponse.json(repo)
  }),

  http.post('/api/repos/analyze', async ({ request }) => {
    const body = (await request.json()) as { githubUrl: string }
    const { githubUrl } = body

    await delay(2000)

    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return HttpResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }

    const [, owner, repo] = match
    const cleanRepo = repo.replace(/\.git$/, '')
    const stack = detectStack(cleanRepo)
    const provider = detectProvider(cleanRepo)
    const infraFiles = detectInfraFiles(cleanRepo)

    const analysis: RepositoryAnalysis = {
      analyzedAt: new Date().toISOString(),
      detectedStack: stack,
      cloudProvider: provider,
      cloudAccountId: provider === 'aws' ? '123456789012' : provider === 'gcp' ? `${owner}-production` : null,
      hasGithubActions: true,
      hasDependabot: Math.random() > 0.3,
      hasCodecov: Math.random() > 0.5,
      infraFiles,
    }

    const newRepo: RegisteredRepository = {
      id: `repo-${Date.now()}`,
      owner,
      repo: cleanRepo,
      fullName: `${owner}/${cleanRepo}`,
      githubUrl,
      defaultBranch: 'main',
      registeredAt: new Date().toISOString(),
      status: 'ready',
      analysis,
    }

    return HttpResponse.json(newRepo)
  }),
]
