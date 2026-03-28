import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { RegisterForm } from '@/components/repository/RegisterForm'

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-100">Add Repository</h1>
        <p className="mt-1 text-sm text-slate-400">
          Connect a GitHub repository to start monitoring your SRE metrics.
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
