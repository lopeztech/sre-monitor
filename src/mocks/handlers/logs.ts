import { http, HttpResponse, delay } from 'msw'
import { logsFixtures } from '@/mocks/fixtures/logs'

export const logsHandlers = [
  http.get('/api/repos/:repoId/logs', async ({ params }) => {
    const { repoId } = params
    await delay(200)
    const data = logsFixtures[repoId as string]
    if (!data) {
      return HttpResponse.json({ error: 'Log data not found' }, { status: 404 })
    }
    return HttpResponse.json(data)
  }),
]
