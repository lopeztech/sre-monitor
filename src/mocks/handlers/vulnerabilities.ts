import { http, HttpResponse, delay } from 'msw'
import { vulnerabilitiesFixtures } from '@/mocks/fixtures/vulnerabilities'

export const vulnerabilitiesHandlers = [
  http.get('/api/repos/:repoId/vulnerabilities', async ({ params }) => {
    const { repoId } = params
    await delay(500)
    const data = vulnerabilitiesFixtures[repoId as string]
    if (!data) {
      return HttpResponse.json({ error: 'Vulnerability data not found' }, { status: 404 })
    }
    return HttpResponse.json(data)
  }),
]
