import { describe, it, expect, beforeEach } from 'vitest'
import { usePreferencesStore } from './preferencesStore'

describe('preferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      repoPrefs: {},
      cardOrder: ['costs', 'pipelines', 'security', 'logs', 'coverage'],
    })
  })

  it('returns default preferences for unknown repo', () => {
    const prefs = usePreferencesStore.getState().getRepoPrefs('unknown-repo')
    expect(prefs.defaultTab).toBe('costs')
    expect(prefs.hiddenTabs).toEqual([])
  })

  it('sets default tab for a repo', () => {
    usePreferencesStore.getState().setDefaultTab('repo-1', 'security')
    const prefs = usePreferencesStore.getState().getRepoPrefs('repo-1')
    expect(prefs.defaultTab).toBe('security')
  })

  it('toggles tab visibility - hide', () => {
    usePreferencesStore.getState().toggleTabVisibility('repo-1', 'logs')
    const prefs = usePreferencesStore.getState().getRepoPrefs('repo-1')
    expect(prefs.hiddenTabs).toContain('logs')
  })

  it('toggles tab visibility - show again', () => {
    usePreferencesStore.getState().toggleTabVisibility('repo-1', 'logs')
    usePreferencesStore.getState().toggleTabVisibility('repo-1', 'logs')
    const prefs = usePreferencesStore.getState().getRepoPrefs('repo-1')
    expect(prefs.hiddenTabs).not.toContain('logs')
  })

  it('sets card order', () => {
    const newOrder = ['security', 'costs', 'pipelines', 'logs', 'coverage'] as const
    usePreferencesStore.getState().setCardOrder([...newOrder])
    expect(usePreferencesStore.getState().cardOrder).toEqual(newOrder)
  })

  it('keeps preferences independent per repo', () => {
    usePreferencesStore.getState().setDefaultTab('repo-1', 'pipelines')
    usePreferencesStore.getState().setDefaultTab('repo-2', 'logs')

    expect(usePreferencesStore.getState().getRepoPrefs('repo-1').defaultTab).toBe('pipelines')
    expect(usePreferencesStore.getState().getRepoPrefs('repo-2').defaultTab).toBe('logs')
  })
})
