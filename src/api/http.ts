/** Формат на грешките от всички сервизи (REZERV.md §2.6). */
export interface ApiErrorBody {
  status: number
  code: string
  message: string
  correlationId: string
  timestamp: string
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(body: ApiErrorBody) {
    super(body.message)
    this.status = body.status
    this.code = body.code
  }
}

/** Говорим САМО с gateway-а; в dev Vite proxy препраща /api към :8080. */
export async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return handle<TResponse>(response)
}

export async function get<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`/api${path}`)
  return handle<TResponse>(response)
}

async function handle<TResponse>(response: Response): Promise<TResponse> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw errorBody?.code
      ? new ApiError(errorBody)
      : new Error(`Неочаквана грешка (HTTP ${response.status})`)
  }
  return (await response.json()) as TResponse
}
