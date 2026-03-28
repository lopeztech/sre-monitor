export interface ParsedRepo {
  owner: string
  repo: string
  fullName: string
}

// GitHub allows: alphanumeric, hyphens (owner); alphanumeric, hyphens, dots, underscores (repo)
const OWNER_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
const REPO_RE = /^[a-zA-Z0-9._-]+$/
const MAX_OWNER_LEN = 39
const MAX_REPO_LEN = 100

function validateParts(owner: string, repo: string): ParsedRepo | null {
  if (!owner || !repo) return null
  if (owner.length > MAX_OWNER_LEN || repo.length > MAX_REPO_LEN) return null
  if (!OWNER_RE.test(owner)) return null
  if (!REPO_RE.test(repo)) return null
  return { owner, repo, fullName: `${owner}/${repo}` }
}

export function parseGitHubUrl(url: string): ParsedRepo | null {
  const trimmed = url.trim()

  // Remove trailing .git if present
  const cleaned = trimmed.replace(/\.git$/, '')

  // Match https://github.com/owner/repo or http://github.com/owner/repo
  const fullUrlMatch = cleaned.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (fullUrlMatch) {
    return validateParts(fullUrlMatch[1], fullUrlMatch[2])
  }

  // Match github.com/owner/repo (no protocol)
  const noprotoMatch = cleaned.match(/^github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (noprotoMatch) {
    return validateParts(noprotoMatch[1], noprotoMatch[2])
  }

  // Match owner/repo shorthand
  const shortMatch = cleaned.match(/^([^/\s]+)\/([^/\s]+)$/)
  if (shortMatch) {
    return validateParts(shortMatch[1], shortMatch[2])
  }

  return null
}
