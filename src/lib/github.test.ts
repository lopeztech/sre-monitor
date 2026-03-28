import { describe, it, expect } from 'vitest'
import { parseGitHubUrl } from './github'

describe('parseGitHubUrl', () => {
  it('parses full HTTPS URL', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('parses HTTPS URL with trailing slash', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo/')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('parses HTTPS URL with .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('parses HTTP URL', () => {
    const result = parseGitHubUrl('http://github.com/owner/repo')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('parses URL without protocol', () => {
    const result = parseGitHubUrl('github.com/owner/repo')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('parses owner/repo shorthand', () => {
    const result = parseGitHubUrl('owner/repo')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('trims whitespace', () => {
    const result = parseGitHubUrl('  owner/repo  ')
    expect(result).toEqual({ owner: 'owner', repo: 'repo', fullName: 'owner/repo' })
  })

  it('allows hyphens in owner and repo', () => {
    const result = parseGitHubUrl('my-org/my-repo')
    expect(result).toEqual({ owner: 'my-org', repo: 'my-repo', fullName: 'my-org/my-repo' })
  })

  it('allows dots and underscores in repo name', () => {
    const result = parseGitHubUrl('owner/my_repo.js')
    expect(result).toEqual({ owner: 'owner', repo: 'my_repo.js', fullName: 'owner/my_repo.js' })
  })

  it('returns null for invalid URL', () => {
    expect(parseGitHubUrl('')).toBeNull()
    expect(parseGitHubUrl('just-a-string')).toBeNull()
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull()
  })

  it('returns null for URL with extra path segments', () => {
    expect(parseGitHubUrl('https://github.com/owner/repo/tree/main')).toBeNull()
  })

  // Security-specific tests
  it('rejects owner with special characters', () => {
    expect(parseGitHubUrl('own<er/repo')).toBeNull()
    expect(parseGitHubUrl('own"er/repo')).toBeNull()
    expect(parseGitHubUrl('owner!/repo')).toBeNull()
  })

  it('rejects owner starting with hyphen', () => {
    expect(parseGitHubUrl('-owner/repo')).toBeNull()
  })

  it('rejects owner exceeding 39 characters', () => {
    const longOwner = 'a'.repeat(40)
    expect(parseGitHubUrl(`${longOwner}/repo`)).toBeNull()
  })

  it('rejects repo exceeding 100 characters', () => {
    const longRepo = 'a'.repeat(101)
    expect(parseGitHubUrl(`owner/${longRepo}`)).toBeNull()
  })

  it('accepts owner at max length (39)', () => {
    const owner = 'a'.repeat(39)
    const result = parseGitHubUrl(`${owner}/repo`)
    expect(result).not.toBeNull()
    expect(result!.owner).toBe(owner)
  })
})
