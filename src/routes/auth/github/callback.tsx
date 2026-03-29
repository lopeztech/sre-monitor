import { createRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Route as rootRoute } from '../../__root'
import { useGitHubAuth, getOAuthReturnUrl } from '@/contexts/GitHubAuthContext'
import { Activity, AlertCircle } from 'lucide-react'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/github/callback',
  validateSearch: (search: Record<string, unknown>) => ({
    code: (search.code as string) ?? '',
    state: (search.state as string) ?? '',
  }),
  component: GitHubCallback,
})

function GitHubCallback() {
  const { code, state } = useSearch({ from: '/auth/github/callback' })
  const { handleCallback } = useGitHubAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code || !state) {
      setError('Missing authorization code or state parameter')
      return
    }

    handleCallback(code, state)
      .then(() => {
        const returnUrl = getOAuthReturnUrl()
        navigate({ to: returnUrl })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to connect GitHub account')
      })
  }, [code, state, handleCallback, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-20 h-20 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/20 dark:shadow-sky-900/40">
          <Activity size={36} className="text-white" />
        </div>

        {error ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 mb-2">
              <AlertCircle size={20} />
              <h2 className="text-lg font-semibold">Connection Failed</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Return to dashboard
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Connecting GitHub...</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Exchanging authorization code</p>
          </div>
        )}
      </div>
    </div>
  )
}
