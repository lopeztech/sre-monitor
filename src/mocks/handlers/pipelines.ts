import { http, HttpResponse, delay } from 'msw'
import { pipelinesFixtures } from '@/mocks/fixtures/pipelines'

export const pipelinesHandlers = [
  http.get('/api/repos/:repoId/pipelines', async ({ params }) => {
    const { repoId } = params
    await delay(300)
    const data = pipelinesFixtures[repoId as string]
    if (!data) {
      return HttpResponse.json({ error: 'Pipeline data not found' }, { status: 404 })
    }
    return HttpResponse.json(data)
  }),
]
