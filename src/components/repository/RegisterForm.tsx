import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { parseGitHubUrl } from '@/lib/github'
import { useRegistryStore } from '@/store/registryStore'
import { useGitHubAuth } from '@/contexts/GitHubAuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiFetch } from '@/api/client'
import type { RegisteredRepository } from '@/types/repository'
import { CheckCircle2, Server, GitBranch, Shield, BarChart2, FileCode2, ArrowLeft, Info } from 'lucide-react'

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

const schema = z.object({
  githubUrl: z
    .string()
    .min(1, 'GitHub URL is required')
    .refine(
      (val) => parseGitHubUrl(val) !== null,
      'Enter a valid GitHub URL (e.g. https://github.com/owner/repo)',
    ),
})

type FormValues = z.infer<typeof schema>

const providerLabel: Record<string, string> = {
  aws: 'Amazon Web Services',
  gcp: 'Google Cloud Platform',
  azure: 'Microsoft Azure',
  unknown: 'Not detected',
}

export function RegisterForm() {
  const addRepository = useRegistryStore((s) => s.addRepository)
  const navigate = useNavigate()
  const { isGitHubConnected, connectGitHub } = useGitHubAuth()
  const [analyzedRepo, setAnalyzedRepo] = useState<RegisteredRepository | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onAnalyze = async (data: FormValues) => {
    const parsed = parseGitHubUrl(data.githubUrl)
    if (!parsed) return

    try {
      const repo = await apiFetch<RegisteredRepository>('/api/repos/analyze', {
        method: 'POST',
        body: JSON.stringify({ githubUrl: data.githubUrl }),
      })
      setAnalyzedRepo(repo)
    } catch (err) {
      const status = err instanceof Error && 'status' in err ? (err as { status: number }).status : 0
      if ((status === 404 || status === 403) && !isGitHubConnected) {
        setError('githubUrl', {
          message: 'Repository not found. It may be private — connect your GitHub account to access it.',
        })
      } else {
        setError('githubUrl', {
          message: 'Failed to analyze repository. Please try again.',
        })
      }
    }
  }

  const onConfirm = async () => {
    if (!analyzedRepo) return
    addRepository(analyzedRepo)
    await navigate({ to: '/app/$repoId', params: { repoId: analyzedRepo.id } })
  }

  if (analyzedRepo) {
    const analysis = analyzedRepo.analysis!
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader
          title="Analysis Complete"
          subtitle={analyzedRepo.fullName}
        />
        <CardContent>
          <div className="space-y-4">
            {/* Detection results */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Server size={14} className="flex-shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Cloud Provider</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {providerLabel[analysis.cloudProvider]}
                    </p>
                  </div>
                  {analysis.cloudProvider !== 'unknown' && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <FileCode2 size={14} className="flex-shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Detected Stack</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {analysis.detectedStack.map((tech) => (
                        <Badge key={tech} variant="default" size="sm">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <GitBranch size={14} className="flex-shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CI/CD</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {analysis.hasGithubActions ? 'GitHub Actions detected' : 'No CI/CD detected'}
                    </p>
                  </div>
                  {analysis.hasGithubActions && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Shield size={14} className="flex-shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Security</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {analysis.hasDependabot ? 'Dependabot enabled' : 'Dependabot not detected'}
                    </p>
                  </div>
                  {analysis.hasDependabot && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <BarChart2 size={14} className="flex-shrink-0 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Coverage</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      {analysis.hasCodecov ? 'Codecov integration found' : 'No coverage provider detected'}
                    </p>
                  </div>
                  {analysis.hasCodecov && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>

                {analysis.infraFiles.length > 0 && (
                  <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                    <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">Infrastructure Files</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.infraFiles.map((f) => (
                        <span key={f} className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setAnalyzedRepo(null)} className="flex-shrink-0">
                <ArrowLeft size={14} />
                Back
              </Button>
              <Button onClick={onConfirm} className="flex-1">
                Add Repository
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader
        title="Register Repository"
        subtitle="Add a GitHub repository to start monitoring it"
      />
      <CardContent>
        {!isGitHubConnected && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-sky-300">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <div>
              <span>Connect your GitHub account to access private repositories. </span>
              <button onClick={connectGitHub} className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-sky-900 dark:hover:text-sky-100">
                <GithubIcon size={12} />
                Connect GitHub
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onAnalyze)} className="space-y-5">
          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/owner/repo"
            error={errors.githubUrl?.message}
            hint="Supports full URLs, github.com/owner/repo, or owner/repo shorthand"
            {...register('githubUrl')}
          />
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Analyzing repository...' : 'Analyze Repository'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
