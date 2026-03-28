import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' })
    document.documentElement.classList.remove('dark', 'light')
  })

  it('defaults to system mode', () => {
    expect(useThemeStore.getState().mode).toBe('system')
  })

  it('sets dark mode', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('sets light mode', () => {
    useThemeStore.getState().setMode('light')
    expect(useThemeStore.getState().mode).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('sets system mode and applies based on media query', () => {
    useThemeStore.getState().setMode('system')
    expect(useThemeStore.getState().mode).toBe('system')
    // Our mock matchMedia returns true for prefers-color-scheme: dark
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
})
