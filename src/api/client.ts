export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'SREMonitor',
  }

  const jwt = localStorage.getItem('sre_monitor_github_jwt')
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`
  }

  const response = await fetch(url, {
    headers: {
      ...headers,
      ...(options?.headers as Record<string, string>),
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // ignore parse errors
    }

    // Expired or revoked GitHub token — clear session so UI prompts re-auth
    if (response.status === 401) {
      localStorage.removeItem('sre_monitor_github_jwt')
      localStorage.removeItem('sre_monitor_github_user')
      window.dispatchEvent(new Event('github-auth-expired'))
    }

    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}
