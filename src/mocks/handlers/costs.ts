import { http, HttpResponse, delay } from 'msw'
import { costsFixtures } from '@/mocks/fixtures/costs'

export const costsHandlers = [
  http.get('/api/repos/:repoId/costs', async ({ params }) => {
    const { repoId } = params
    await delay(400)
    const data = costsFixtures[repoId as string]
    if (!data) {
      return HttpResponse.json({ error: 'Cost data not found' }, { status: 404 })
    }
    return HttpResponse.json(data)
  }),
]
