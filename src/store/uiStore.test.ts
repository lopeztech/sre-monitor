import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      activeCostRange: '30d',
      customCostRange: null,
      activeLogRange: '24h',
    })
  })

  describe('sidebar', () => {
    it('starts expanded', () => {
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })

    it('toggles sidebar', () => {
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('cost range', () => {
    it('defaults to 30d', () => {
      expect(useUIStore.getState().activeCostRange).toBe('30d')
    })

    it('sets cost range', () => {
      useUIStore.getState().setCostRange('90d')
      expect(useUIStore.getState().activeCostRange).toBe('90d')
    })

    it('clears custom range when setting preset', () => {
      useUIStore.getState().setCustomCostRange('2026-01-01', '2026-01-31')
      expect(useUIStore.getState().customCostRange).not.toBeNull()
      useUIStore.getState().setCostRange('60d')
      expect(useUIStore.getState().customCostRange).toBeNull()
    })

    it('sets custom cost range', () => {
      useUIStore.getState().setCustomCostRange('2026-01-01', '2026-01-31')
      expect(useUIStore.getState().customCostRange).toEqual({
        start: '2026-01-01',
        end: '2026-01-31',
      })
    })

    it('clears custom cost range', () => {
      useUIStore.getState().setCustomCostRange('2026-01-01', '2026-01-31')
      useUIStore.getState().clearCustomCostRange()
      expect(useUIStore.getState().customCostRange).toBeNull()
    })
  })

  describe('log range', () => {
    it('defaults to 24h', () => {
      expect(useUIStore.getState().activeLogRange).toBe('24h')
    })

    it('sets log range', () => {
      useUIStore.getState().setLogRange('7d')
      expect(useUIStore.getState().activeLogRange).toBe('7d')
    })
  })
})
