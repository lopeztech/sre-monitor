import { describe, it, expect } from 'vitest'
import { apiFetch, ApiError } from './client'
import { server } from '@/test/msw-server'
import { http, HttpResponse } from 'msw'

describe('apiFetch', () => {
  it('fetches JSON data successfully', async () => {
    server.use(
      http.get('/api/test', () => {
        return HttpResponse.json({ message: 'ok' })
      }),
    )
    const data = await apiFetch<{ message: string }>('/api/test')
    expect(data.message).toBe('ok')
  })

  it('throws ApiError on non-OK response', async () => {
    server.use(
      http.get('/api/fail', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      }),
    )
    await expect(apiFetch('/api/fail')).rejects.toThrow(ApiError)
    try {
      await apiFetch('/api/fail')
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError)
      expect((e as ApiError).status).toBe(404)
      expect((e as ApiError).message).toBe('Not found')
    }
  })

  it('throws ApiError with generic message on non-JSON error', async () => {
    server.use(
      http.get('/api/error', () => {
        return new HttpResponse('Server error', { status: 500 })
      }),
    )
    await expect(apiFetch('/api/error')).rejects.toThrow(ApiError)
  })

  it('sets Content-Type header to JSON', async () => {
    let receivedHeaders: Headers | null = null
    server.use(
      http.get('/api/headers', ({ request }) => {
        receivedHeaders = request.headers
        return HttpResponse.json({ ok: true })
      }),
    )
    await apiFetch('/api/headers')
    expect(receivedHeaders!.get('content-type')).toBe('application/json')
  })

  it('sets X-Requested-With CSRF header', async () => {
    let receivedHeaders: Headers | null = null
    server.use(
      http.get('/api/csrf', ({ request }) => {
        receivedHeaders = request.headers
        return HttpResponse.json({ ok: true })
      }),
    )
    await apiFetch('/api/csrf')
    expect(receivedHeaders!.get('x-requested-with')).toBe('SREMonitor')
  })
})
