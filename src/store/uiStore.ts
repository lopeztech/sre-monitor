import { create } from 'zustand'

interface UIStore {
  sidebarCollapsed: boolean
  activeCostRange: '30d' | '60d' | '90d'
  activeLogRange: '1h' | '6h' | '24h' | '7d'
  toggleSidebar: () => void
  setCostRange: (range: '30d' | '60d' | '90d') => void
  setLogRange: (range: '1h' | '6h' | '24h' | '7d') => void
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarCollapsed: false,
  activeCostRange: '30d',
  activeLogRange: '24h',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCostRange: (range) => set({ activeCostRange: range }),

  setLogRange: (range) => set({ activeLogRange: range }),
}))
