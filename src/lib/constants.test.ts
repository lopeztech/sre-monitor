import { describe, it, expect } from 'vitest'
import { QUERY_STALE_TIMES, QUERY_REFETCH_INTERVALS } from './constants'

describe('constants', () => {
  it('defines stale times for all domains', () => {
    expect(QUERY_STALE_TIMES.costs).toBeGreaterThan(0)
    expect(QUERY_STALE_TIMES.pipelines).toBeGreaterThan(0)
    expect(QUERY_STALE_TIMES.vulnerabilities).toBeGreaterThan(0)
    expect(QUERY_STALE_TIMES.logs).toBeGreaterThan(0)
    expect(QUERY_STALE_TIMES.coverage).toBeGreaterThan(0)
  })

  it('defines refetch intervals for real-time domains', () => {
    expect(QUERY_REFETCH_INTERVALS.pipelines).toBeGreaterThan(0)
    expect(QUERY_REFETCH_INTERVALS.logs).toBeGreaterThan(0)
  })

  it('pipelines refetch faster than stale time', () => {
    expect(QUERY_REFETCH_INTERVALS.pipelines).toBeLessThanOrEqual(QUERY_STALE_TIMES.pipelines)
  })
})
