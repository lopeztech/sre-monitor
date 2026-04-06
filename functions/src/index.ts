import { http } from '@google-cloud/functions-framework'
import { fetchPipelineSummary } from './services/pipelines.js'
import { fetchCostSummary } from './services/costs.js'
import { fetchCoverageSummary } from './services/coverage.js'
import { fetchVulnerabilitySummary } from './services/vulnerabilities.js'
import { analyzeRepository } from './services/analyzer.js'
import { createSessionJwt, verifySessionJwt } from './services/auth.js'
import type { GitHubUser } from '../../shared/types/auth.js'
import type { CloudProvider } from '../../shared/types/repository.js'

const ALLOWED_ORIGINS = [
  'https://sre.lopezcloud.dev',
  'http://localhost:5173',
]

type Req = Parameters<Parameters<typeof http>[1]>[0]
type Res = Parameters<Parameters<typeof http>[1]>[1]

function setCors(req: Req, res: Res) {
  const origin = req.headers.origin
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization')
  res.set('Access-Control-Max-Age', '3600')
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

function extractAuth(req: Req): { githubToken: string; ghUser: GitHubUser } | null {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return verifySessionJwt(header.slice(7))
  } catch {
    return null
  }
}

http('api', async (req, res) => {
  setCors(req, res)

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  const path = req.path
  const auth = extractAuth(req)

  // ── POST routes ─────────────────────────────────────────────────────────

  if (req.method === 'POST') {
    // POST /api/auth/github/callback
    if (path === '/api/auth/github/callback') {
      const body = req.body as { code?: string } | undefined
      const code = body?.code

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Missing required field: code' })
        return
      }

      try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
            code,
          }),
        })

        const tokenData = await tokenResponse.json() as { access_token?: string; error?: string; error_description?: string }
        if (tokenData.error || !tokenData.access_token) {
          res.status(400).json({ error: tokenData.error_description ?? 'Failed to exchange code for token' })
          return
        }

        // Fetch GitHub user profile
        const userResponse = await fetch('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        if (!userResponse.ok) {
          res.status(500).json({ error: 'Failed to fetch GitHub user profile' })
          return
        }

        const userData = await userResponse.json() as { login: string; id: number; avatar_url: string }
        const ghUser: GitHubUser = {
          login: userData.login,
          id: userData.id,
          avatar_url: userData.avatar_url,
        }

        const jwt = createSessionJwt(tokenData.access_token, ghUser)
        res.json({ jwt, user: ghUser })
      } catch (err) {
        console.error('GitHub OAuth callback error:', err)
        res.status(500).json({ error: 'OAuth token exchange failed' })
      }
      return
    }

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
        const result = await analyzeRepository(parsed.owner, parsed.repo, githubUrl, auth?.githubToken)
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
  if (path === '/api/health' || path === '/health' || path === '/') {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
    return
  }

  // GET /api/auth/github/verify
  if (path === '/api/auth/github/verify') {
    if (!auth) {
      res.status(401).json({ error: 'Invalid or missing token' })
      return
    }
    res.json({ valid: true, user: auth.ghUser })
    return
  }

  // GET /api/github/repos — list authenticated user's GitHub repositories
  if (path === '/api/github/repos') {
    if (!auth) {
      res.status(401).json({ error: 'GitHub authentication required' })
      return
    }

    try {
      const page = parseInt(req.query.page as string) || 1
      const perPage = Math.min(parseInt(req.query.per_page as string) || 30, 100)

      const ghResponse = await fetch(
        `https://api.github.com/user/repos?sort=updated&direction=desc&per_page=${perPage}&page=${page}&type=all`,
        {
          headers: {
            Authorization: `Bearer ${auth.githubToken}`,
            Accept: 'application/vnd.github+json',
          },
        },
      )

      if (!ghResponse.ok) {
        res.status(ghResponse.status).json({ error: 'Failed to fetch repositories from GitHub' })
        return
      }

      const repos = (await ghResponse.json()) as Array<{
        id: number
        full_name: string
        name: string
        owner: { login: string; avatar_url: string }
        html_url: string
        description: string | null
        private: boolean
        default_branch: string
        language: string | null
        updated_at: string
      }>

      res.json(
        repos.map((r) => ({
          id: r.id,
          fullName: r.full_name,
          name: r.name,
          owner: r.owner.login,
          ownerAvatar: r.owner.avatar_url,
          htmlUrl: r.html_url,
          description: r.description,
          isPrivate: r.private,
          defaultBranch: r.default_branch,
          language: r.language,
          updatedAt: r.updated_at,
        })),
      )
    } catch (err) {
      console.error('Error fetching GitHub repos:', err)
      res.status(500).json({ error: 'Failed to fetch repositories' })
    }
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
      const summary = await fetchPipelineSummary(
        repoId, owner, repo,
        auth?.githubToken,
        auth?.ghUser.id.toString(),
      )
      res.json(summary)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      const status = message.includes('Not Found') ? 404 : 500
      console.error(`Error fetching pipelines for ${owner}/${repo}:`, err)
      res.status(status).json({ error: message })
    }
    return
  }

  // GET /api/repos/:repoId/costs?provider=aws|gcp|azure&accountId=XXXXX
  const costsMatch = path.match(/^\/api\/repos\/([^/]+)\/costs$/)
  if (costsMatch) {
    const repoId = costsMatch[1]
    const provider = req.query.provider as string | undefined
    const accountId = req.query.accountId as string | undefined

    if (!provider || !accountId) {
      res.status(400).json({ error: 'Missing required query params: provider, accountId' })
      return
    }

    if (!['aws', 'gcp', 'azure'].includes(provider)) {
      res.status(400).json({ error: 'Invalid provider. Must be aws, gcp, or azure' })
      return
    }

    try {
      const summary = await fetchCostSummary(repoId, provider as CloudProvider, accountId)
      res.json(summary)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      console.error(`Error fetching costs for ${repoId}:`, err)
      res.status(500).json({ error: message })
    }
    return
  }

  // GET /api/repos/:repoId/vulnerabilities?owner=X&repo=Y
  const vulnMatch = path.match(/^\/api\/repos\/([^/]+)\/vulnerabilities$/)
  if (vulnMatch) {
    const repoId = vulnMatch[1]
    const owner = req.query.owner as string | undefined
    const repo = req.query.repo as string | undefined

    if (!owner || !repo) {
      res.status(400).json({ error: 'Missing required query params: owner, repo' })
      return
    }

    try {
      const summary = await fetchVulnerabilitySummary(repoId, owner, repo, auth?.githubToken)
      res.json(summary)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      console.error(`Error fetching vulnerabilities for ${owner}/${repo}:`, err)
      res.status(500).json({ error: message })
    }
    return
  }

  // GET /api/repos/:repoId/coverage?owner=X&repo=Y
  const coverageMatch = path.match(/^\/api\/repos\/([^/]+)\/coverage$/)
  if (coverageMatch) {
    const repoId = coverageMatch[1]
    const owner = req.query.owner as string | undefined
    const repo = req.query.repo as string | undefined

    if (!owner || !repo) {
      res.status(400).json({ error: 'Missing required query params: owner, repo' })
      return
    }

    try {
      const summary = await fetchCoverageSummary(repoId, owner, repo, auth?.githubToken)
      res.json(summary)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      console.error(`Error fetching coverage for ${owner}/${repo}:`, err)
      res.status(500).json({ error: message })
    }
    return
  }

  res.status(404).json({ error: 'Not found' })
})
