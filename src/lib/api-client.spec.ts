import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, setAuthToken, setRefreshHandler } from './api-client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('api-client 401 refresh handling', () => {
  beforeEach(() => {
    setAuthToken('expired-token')
    setRefreshHandler(null)
  })

  it('refreshes once and retries the request when the refresh handler succeeds', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      // First call: the request that gets a 401.
      .mockResolvedValueOnce(jsonResponse({ message: 'Unauthenticated' }, 401))
      // Second call: retried request, now succeeds.
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)

    const refreshHandler = vi.fn<() => Promise<string | null>>().mockResolvedValue('new-token')
    setRefreshHandler(refreshHandler)

    const result = await api.get('/api/notes')

    expect(refreshHandler).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ ok: true })

    vi.unstubAllGlobals()
  })

  it('dedupes concurrent 401s behind a single refresh call', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 401)) // request A
      .mockResolvedValueOnce(jsonResponse({}, 401)) // request B
      .mockResolvedValueOnce(jsonResponse({ a: true })) // A retried
      .mockResolvedValueOnce(jsonResponse({ b: true })) // B retried
    vi.stubGlobal('fetch', fetchMock)

    const refreshHandler = vi.fn<() => Promise<string | null>>().mockResolvedValue('new-token')
    setRefreshHandler(refreshHandler)

    const [a, b] = await Promise.all([api.get('/api/notes'), api.get('/api/account')])

    expect(refreshHandler).toHaveBeenCalledTimes(1)
    expect(a).toEqual({ a: true })
    expect(b).toEqual({ b: true })

    vi.unstubAllGlobals()
  })

  it('propagates the original error when the refresh handler itself fails', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ message: 'nope' }, 401))
    vi.stubGlobal('fetch', fetchMock)

    setRefreshHandler(vi.fn<() => Promise<string | null>>().mockResolvedValue(null))

    await expect(api.get('/api/notes')).rejects.toMatchObject({ status: 401 })

    vi.unstubAllGlobals()
  })
})
