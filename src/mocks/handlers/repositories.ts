import { http, HttpResponse, delay } from 'msw'
import { repositoryFixtures } from '@/mocks/fixtures/repositories'
import type { RegisteredRepository, RepositoryAnalysis } from '@/types/repository'

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

    await delay(1500)

    // Parse the URL to get owner/repo
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      return HttpResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }

    const [, owner, repo] = match
    const newRepo: RegisteredRepository = {
      id: `repo-${Date.now()}`,
      owner,
      repo,
      fullName: `${owner}/${repo}`,
      githubUrl,
      defaultBranch: 'main',
      registeredAt: new Date().toISOString(),
      status: 'ready',
      analysis: {
        analyzedAt: new Date().toISOString(),
        detectedStack: ['Node.js', 'TypeScript'],
        cloudProvider: 'unknown',
        cloudAccountId: null,
        hasGithubActions: false,
        hasDependabot: false,
        hasCodecov: false,
        infraFiles: [],
      } satisfies RepositoryAnalysis,
    }

    return HttpResponse.json(newRepo)
  }),
]
