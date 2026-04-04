import { describe, it, expect } from 'vitest'
import { calculateTrend, calculateForecast, detectAnomalies } from './costs.js'
import type { CostDataPoint } from '../../../shared/types/costs.js'

describe('calculateTrend', () => {
  it('returns "up" when current exceeds previous by >=2%', () => {
    const result = calculateTrend(110, 100)
    expect(result.trend).toBe('up')
    expect(result.trendPercent).toBe(10)
  })

  it('returns "down" when current is below previous by >=2%', () => {
    const result = calculateTrend(90, 100)
    expect(result.trend).toBe('down')
    expect(result.trendPercent).toBe(10)
  })

  it('returns "stable" when change is under 2%', () => {
    const result = calculateTrend(101, 100)
    expect(result.trend).toBe('stable')
    expect(result.trendPercent).toBe(1)
  })

  it('returns "stable" when previous is 0', () => {
    const result = calculateTrend(100, 0)
    expect(result.trend).toBe('stable')
    expect(result.trendPercent).toBe(0)
  })
})

describe('calculateForecast', () => {
  it('projects monthly total from daily average', () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`

    // Generate 10 days of $100/day in current month
    const history: CostDataPoint[] = Array.from({ length: 10 }, (_, i) => ({
      date: `${prefix}-${String(i + 1).padStart(2, '0')}`,
      amount: 100,
    }))

    const forecast = calculateForecast(history)
    expect(forecast).toBe(100 * daysInMonth)
  })

  it('falls back to previous month when current month has <2 data points', () => {
    const now = new Date()
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const prefix = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`

    const history: CostDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: `${prefix}-${String(i + 1).padStart(2, '0')}`,
      amount: 50,
    }))

    const forecast = calculateForecast(history)
    expect(forecast).toBe(1500)
  })

  it('returns 0 when no history exists', () => {
    expect(calculateForecast([])).toBe(0)
  })
})

describe('detectAnomalies', () => {
  it('detects a cost spike above mean + 2*stddev', () => {
    const now = new Date()
    const entries = []

    // 30 days of stable ~$10/day for service-a
    for (let i = 30; i >= 1; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      entries.push({
        date: d.toISOString().slice(0, 10),
        serviceId: 'service-a',
        serviceName: 'Service A',
        amount: 10 + (i % 3) * 0.5, // small variation: 10, 10.5, 11
      })
    }

    // Add a spike yesterday
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    entries.push({
      date: yesterday.toISOString().slice(0, 10),
      serviceId: 'service-a',
      serviceName: 'Service A',
      amount: 50, // massive spike
    })

    const anomalies = detectAnomalies(entries)
    expect(anomalies.length).toBeGreaterThanOrEqual(1)
    expect(anomalies[0].serviceName).toBe('Service A')
    expect(anomalies[0].actualAmount).toBe(50)
    expect(anomalies[0].percentageIncrease).toBeGreaterThan(0)
  })

  it('returns empty when costs are stable', () => {
    const now = new Date()
    const entries = []

    for (let i = 30; i >= 1; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      entries.push({
        date: d.toISOString().slice(0, 10),
        serviceId: 'service-a',
        serviceName: 'Service A',
        amount: 10,
      })
    }

    expect(detectAnomalies(entries)).toEqual([])
  })

  it('ignores services with fewer than 7 data points', () => {
    const now = new Date()
    const entries = []

    for (let i = 5; i >= 1; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      entries.push({
        date: d.toISOString().slice(0, 10),
        serviceId: 'service-a',
        serviceName: 'Service A',
        amount: i === 1 ? 100 : 10,
      })
    }

    expect(detectAnomalies(entries)).toEqual([])
  })
})
