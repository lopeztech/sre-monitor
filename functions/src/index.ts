import { http } from '@google-cloud/functions-framework'
import { fetchPipelineSummary } from './services/pipelines.js'
import { analyzeRepository } from './services/analyzer.js'

const ALLOWED_ORIGINS = [
  'https://sre.lopezcloud.dev',
  'http://localhost:5173',
]

function setCors(req: Parameters<Parameters<typeof http>[1]>[0], res: Parameters<Parameters<typeof http>[1]>[1]) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
  res.set('Access-Control-Max-Age', '3600')
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

http('api', async (req, res) => {
  setCors(req, res)

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  const path = req.path

  // ── POST routes ─────────────────────────────────────────────────────────

  if (req.method === 'POST') {
    // POST /api/repos/analyze
    if (path === '/api/repos/analyze') {
      const body = req.body as { githubUrl?: string } | undefined
      const githubUrl = body?.githubUrl

      if (!githubUrl || typeof githubUrl !== 'string') {
        res.status(400).json({ error: 'Missing required field: githubUrl' })
        return
      }

      const parsed = parseGitHubUrl(githubUrl)
      if (!parsed) {
        res.status(400).json({ error: 'Invalid GitHub URL' })
        return
      }

      try {
        const result = await analyzeRepository(parsed.owner, parsed.repo, githubUrl)
        res.json(result)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        const status = message.includes('Not Found') ? 404 : 500
        console.error(`Error analyzing ${githubUrl}:`, err)
        res.status(status).json({ error: message })
      }
      return
    }

    res.status(404).json({ error: 'Not found' })
    return
  }

  // ── GET routes ──────────────────────────────────────────────────────────

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // GET /api/health
  if (path === '/api/health' || path === '/') {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  // GET /api/repos/:repoId/pipelines?owner=X&repo=Y
  const pipelinesMatch = path.match(/^\/api\/repos\/([^/]+)\/pipelines$/)
  if (pipelinesMatch) {
    const repoId = pipelinesMatch[1]
    const owner = req.query.owner as string | undefined
    const repo = req.query.repo as string | undefined

    if (!owner || !repo) {
      res.status(400).json({ error: 'Missing required query params: owner, repo' })
      return
    }

    try {
      const summary = await fetchPipelineSummary(repoId, owner, repo)
      res.json(summary)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      const status = message.includes('Not Found') ? 404 : 500
      console.error(`Error fetching pipelines for ${owner}/${repo}:`, err)
      res.status(status).json({ error: message })
    }
    return
  }

  res.status(404).json({ error: 'Not found' })
})
