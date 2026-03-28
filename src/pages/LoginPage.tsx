import { GoogleLogin } from '@react-oauth/google'
import { Activity } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Icon */}
        <div className="w-20 h-20 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/20 dark:shadow-sky-900/40">
          <Activity size={36} className="text-white" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">SRE Monitor</h1>
          <p className="mt-1 text-slate-500 text-sm dark:text-slate-400">Unified monitoring for your GitHub repositories</p>
        </div>

        {/* Sign-in card */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-xl dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500 text-sm text-center dark:text-slate-400">Sign in to access your dashboard</p>

          {CLIENT_ID ? (
            <GoogleLogin
              onSuccess={login}
              onError={() => console.error('Google Sign-In failed')}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="signin_with"
              width="280"
            />
          ) : (
            <div className="text-center p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs leading-relaxed dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-300">
              <p className="font-semibold mb-1">Configuration required</p>
              <p>
                Set <code className="font-mono bg-amber-100 px-1 py-0.5 rounded dark:bg-amber-900/50">VITE_GOOGLE_CLIENT_ID</code> in
                your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded dark:bg-amber-900/50">.env.local</code> file.
              </p>
            </div>
          )}

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-slate-400 text-xs dark:text-slate-600">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <button
            onClick={loginAsGuest}
            className="w-full py-2.5 px-4 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600"
          >
            Continue as Guest
          </button>
        </div>

        <p className="text-slate-400 text-xs text-center dark:text-slate-600">
          Guest mode uses sample data and does not save changes.
        </p>
      </div>
    </div>
  )
}
