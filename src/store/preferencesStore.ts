import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type TabId = 'costs' | 'pipelines' | 'security' | 'logs' | 'coverage'

interface RepoPreferences {
  defaultTab: TabId
  hiddenTabs: TabId[]
}

interface PreferencesStore {
  repoPrefs: Record<string, RepoPreferences>
  cardOrder: TabId[]
  getRepoPrefs: (repoId: string) => RepoPreferences
  setDefaultTab: (repoId: string, tab: TabId) => void
  toggleTabVisibility: (repoId: string, tab: TabId) => void
  setCardOrder: (order: TabId[]) => void
}

const DEFAULT_PREFS: RepoPreferences = {
  defaultTab: 'costs',
  hiddenTabs: [],
}

const DEFAULT_ORDER: TabId[] = ['costs', 'pipelines', 'security', 'logs', 'coverage']

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      repoPrefs: {},
      cardOrder: DEFAULT_ORDER,

      getRepoPrefs: (repoId) => {
        return get().repoPrefs[repoId] ?? DEFAULT_PREFS
      },

      setDefaultTab: (repoId, tab) =>
        set((state) => ({
          repoPrefs: {
            ...state.repoPrefs,
            [repoId]: {
              ...DEFAULT_PREFS,
              ...state.repoPrefs[repoId],
              defaultTab: tab,
            },
          },
        })),

      toggleTabVisibility: (repoId, tab) =>
        set((state) => {
          const current = state.repoPrefs[repoId] ?? DEFAULT_PREFS
          const hidden = current.hiddenTabs.includes(tab)
            ? current.hiddenTabs.filter((t) => t !== tab)
            : [...current.hiddenTabs, tab]
          return {
            repoPrefs: {
              ...state.repoPrefs,
              [repoId]: { ...current, hiddenTabs: hidden },
            },
          }
        }),

      setCardOrder: (order) => set({ cardOrder: order }),
    }),
    {
      name: 'sre-monitor-preferences',
    },
  ),
)
