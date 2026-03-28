export interface ParsedRepo {
  owner: string
  repo: string
  fullName: string
}

export function parseGitHubUrl(url: string): ParsedRepo | null {
  const trimmed = url.trim()

  // Remove trailing .git if present
  const cleaned = trimmed.replace(/\.git$/, '')

  // Match https://github.com/owner/repo or http://github.com/owner/repo
  const fullUrlMatch = cleaned.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (fullUrlMatch) {
    const owner = fullUrlMatch[1]
    const repo = fullUrlMatch[2]
    return { owner, repo, fullName: `${owner}/${repo}` }
  }

  // Match github.com/owner/repo (no protocol)
  const noprotoMatch = cleaned.match(/^github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (noprotoMatch) {
    const owner = noprotoMatch[1]
    const repo = noprotoMatch[2]
    return { owner, repo, fullName: `${owner}/${repo}` }
  }

  // Match owner/repo shorthand
  const shortMatch = cleaned.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shortMatch) {
    const owner = shortMatch[1]
    const repo = shortMatch[2]
    return { owner, repo, fullName: `${owner}/${repo}` }
  }

  return null
}
