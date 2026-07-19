/** Говорим САМО с gateway-а; в dev Vite proxy препраща /api към :8080. */

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

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

/** AuthProvider регистрира logout при 401 от gateway (изтекъл/невалиден JWT). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

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

export async function postAuth<TResponse>(
  path: string,
  body: unknown,
  accessToken: string,
): Promise<TResponse> {
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  })
  if (response.status === 401) {
    unauthorizedHandler?.()
  }
  return handle<TResponse>(response)
}

export async function getAuth<TResponse>(path: string, accessToken: string): Promise<TResponse> {
  const response = await fetch(`/api${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 401) {
    unauthorizedHandler?.()
  }
  return handle<TResponse>(response)
}

export async function deleteAuth(path: string, accessToken: string): Promise<void> {
  const response = await fetch(`/api${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 401) {
    unauthorizedHandler?.()
  }
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null
    throw errorBody?.code
      ? new ApiError(errorBody)
      : new Error(`Неочаквана грешка (HTTP ${response.status})`)
  }
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
