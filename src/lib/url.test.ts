import { describe, it, expect } from 'vitest'
import { isSafeUrl } from './url'

describe('isSafeUrl', () => {
  it('allows https URLs', () => {
    expect(isSafeUrl('https://github.com/advisories/GHSA-xxx')).toBe(true)
  })

  it('allows http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true)
  })

  it('rejects javascript: protocol', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
  })

  it('rejects data: protocol', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isSafeUrl('')).toBe(false)
  })

  it('rejects malformed URL', () => {
    expect(isSafeUrl('not-a-url')).toBe(false)
  })

  it('rejects ftp protocol', () => {
    expect(isSafeUrl('ftp://files.example.com')).toBe(false)
  })

  it('rejects file: protocol', () => {
    expect(isSafeUrl('file:///etc/passwd')).toBe(false)
  })
})
