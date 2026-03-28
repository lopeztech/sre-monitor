import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { parseGitHubUrl } from '@/lib/github'
import { useRegistryStore } from '@/store/registryStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { apiFetch } from '@/api/client'
import type { RegisteredRepository } from '@/types/repository'

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

export function RegisterForm() {
  const addRepository = useRegistryStore((s) => s.addRepository)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    const parsed = parseGitHubUrl(data.githubUrl)
    if (!parsed) return

    try {
      const repo = await apiFetch<RegisteredRepository>('/api/repos/analyze', {
        method: 'POST',
        body: JSON.stringify({ githubUrl: data.githubUrl }),
      })
      addRepository(repo)
      await navigate({ to: '/app/$repoId', params: { repoId: repo.id } })
    } catch {
      setError('githubUrl', {
        message: 'Failed to analyze repository. Please try again.',
      })
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader
        title="Register Repository"
        subtitle="Add a GitHub repository to start monitoring it"
      />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            {isSubmitting ? 'Analyzing repository...' : 'Add Repository'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
