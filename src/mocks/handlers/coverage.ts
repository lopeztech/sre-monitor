import { http, HttpResponse, delay } from 'msw'
import { coverageFixtures } from '@/mocks/fixtures/coverage'

export const coverageHandlers = [
  http.get('/api/repos/:repoId/coverage', async ({ params }) => {
    const { repoId } = params
    await delay(350)
    const data = coverageFixtures[repoId as string]
    if (!data) {
      return HttpResponse.json({ error: 'Coverage data not found' }, { status: 404 })
    }
    return HttpResponse.json(data)
  }),
]
