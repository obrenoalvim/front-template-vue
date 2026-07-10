import { env } from '@/lib/env'

const BASE_URL = env.VITE_API_URL

let authToken: string | null = null

/** Set/clear the Sanctum bearer token attached to every request. Wired up by the auth store. */
export function setAuthToken(token: string | null) {
  authToken = token
}

// Registered once by the auth store (setRefreshHandler) — kept here as a plain
// callback instead of importing the store directly, since the store imports
// this module and a two-way import would be circular. Returns the new access
// token on success, or null if the refresh token itself is dead (caller logs out).
let refreshHandler: (() => Promise<string | null>) | null = null

export function setRefreshHandler(handler: (() => Promise<string | null>) | null) {
  refreshHandler = handler
}

// Shared across all callers so N requests that 401 around the same time trigger
// exactly one refresh instead of each rotating the refresh token and invalidating
// the others.
let refreshing: Promise<string | null> | null = null

export interface ApiErrorShape {
  status: number
  message: string
  body: unknown
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(path, BASE_URL)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function request<T>(
  method: string,
  path: string,
  { params, body, ...init }: RequestOptions & { body?: unknown } = {},
  isRetry = false,
): Promise<T> {
  const url = buildUrl(path, params)

  const res = await fetch(url, {
    ...init,
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    if (res.status === 401 && !isRetry && refreshHandler && path !== '/api/auth/refresh') {
      refreshing ??= refreshHandler().finally(() => {
        refreshing = null
      })
      const newToken = await refreshing
      if (newToken) {
        return request<T>(method, path, { params, body, ...init }, true)
      }
    }

    const errorBody = await res.json().catch(() => undefined)
    if (import.meta.env.DEV) {
      console.error(`[api] ${method} ${url} -> ${res.status}`, errorBody)
    }
    throw new ApiError(
      res.status,
      (errorBody as { message?: string })?.message ?? res.statusText,
      errorBody,
    )
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/**
 * Laravel's /api/auth/refresh is authenticated BY the refresh token itself
 * (Sanctum ability check, see back-template-laravel's AuthController) — not a
 * token-in-body call — so this bypasses the normal `authToken` header and
 * doesn't go through `request()` (that would recurse into the 401 handler above).
 */
export async function refreshWithToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await fetch(buildUrl('/api/auth/refresh'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => undefined)
    throw new ApiError(
      res.status,
      (errorBody as { message?: string })?.message ?? res.statusText,
      errorBody,
    )
  }

  return res.json() as Promise<{ accessToken: string; refreshToken: string }>
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('DELETE', path, { ...options, body }),
}
