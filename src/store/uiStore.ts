import { create } from 'zustand'

export type CostRangePreset = '30d' | '60d' | '90d'

interface UIStore {
  sidebarCollapsed: boolean
  activeCostRange: CostRangePreset
  customCostRange: { start: string; end: string } | null
  activeLogRange: '1h' | '6h' | '24h' | '7d'
  toggleSidebar: () => void
  setCostRange: (range: CostRangePreset) => void
  setCustomCostRange: (start: string, end: string) => void
  clearCustomCostRange: () => void
  setLogRange: (range: '1h' | '6h' | '24h' | '7d') => void
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarCollapsed: false,
  activeCostRange: '30d',
  customCostRange: null,
  activeLogRange: '24h',

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCostRange: (range) => set({ activeCostRange: range, customCostRange: null }),

  setCustomCostRange: (start, end) => set({ customCostRange: { start, end } }),

  clearCustomCostRange: () => set({ customCostRange: null }),

  setLogRange: (range) => set({ activeLogRange: range }),
}))
