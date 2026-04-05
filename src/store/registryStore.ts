import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CloudProvider, RegisteredRepository, RepoStatus, RepositoryAnalysis } from '@/types/repository'
import { repositoryFixtures } from '@/mocks/fixtures/repositories'

const DEMO_REPO_IDS = new Set(repositoryFixtures.map((r) => r.id))

interface RegistryStore {
  repositories: RegisteredRepository[]
  addRepository: (repo: RegisteredRepository) => void
  removeRepository: (id: string) => void
  updateRepositoryStatus: (id: string, status: RepoStatus) => void
  updateRepositoryAnalysis: (id: string, analysis: RepositoryAnalysis) => void
  updateCloudProvider: (id: string, provider: CloudProvider | undefined, accountId: string | undefined) => void
  seedDemoRepos: () => void
  clearDemoRepos: () => void
}

export const useRegistryStore = create<RegistryStore>()(
  persist(
    (set, get) => ({
      repositories: [],

      addRepository: (repo) =>
        set((state) => ({
          repositories: [...state.repositories.filter((r) => r.id !== repo.id), repo],
        })),

      removeRepository: (id) =>
        set((state) => ({
          repositories: state.repositories.filter((r) => r.id !== id),
        })),

      updateRepositoryStatus: (id, status) =>
        set((state) => ({
          repositories: state.repositories.map((r) =>
            r.id === id ? { ...r, status } : r,
          ),
        })),

      updateRepositoryAnalysis: (id, analysis) =>
        set((state) => ({
          repositories: state.repositories.map((r) =>
            r.id === id ? { ...r, analysis, status: 'ready' } : r,
          ),
        })),

      updateCloudProvider: (id, provider, accountId) =>
        set((state) => ({
          repositories: state.repositories.map((r) =>
            r.id === id
              ? { ...r, cloudProviderManual: provider, cloudAccountIdManual: accountId }
              : r,
          ),
        })),

      seedDemoRepos: () => {
        const { repositories } = get()
        if (repositories.length === 0) {
          set({ repositories: repositoryFixtures })
        }
      },

      clearDemoRepos: () => {
        set((state) => ({
          repositories: state.repositories.filter((r) => !DEMO_REPO_IDS.has(r.id)),
        }))
      },
    }),
    {
      name: 'sre-monitor-registry',
    },
  ),
)
