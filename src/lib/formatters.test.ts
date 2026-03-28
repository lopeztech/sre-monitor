import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatDuration,
} from './formatters'

describe('formatCurrency', () => {
  it('formats positive numbers as USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats small amounts', () => {
    expect(formatCurrency(0.5)).toBe('$0.50')
  })

  it('formats large amounts with commas', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })
})

describe('formatPercent', () => {
  it('formats with default 1 decimal', () => {
    expect(formatPercent(85.678)).toBe('85.7%')
  })

  it('formats with 0 decimals', () => {
    expect(formatPercent(85.678, 0)).toBe('86%')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('formats 100%', () => {
    expect(formatPercent(100)).toBe('100.0%')
  })
})

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2026-03-15T10:30:00Z')
    expect(result).toMatch(/Mar/)
    expect(result).toMatch(/15/)
    expect(result).toMatch(/2026/)
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent times', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(fiveMinAgo)).toBe('5 minutes ago')
  })

  it('returns hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('returns days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('uses singular form for 1', () => {
    const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
  })
})

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s')
  })

  it('formats zero', () => {
    expect(formatDuration(0)).toBe('0s')
  })

  it('formats exact minutes', () => {
    expect(formatDuration(120)).toBe('2m 0s')
  })
})
