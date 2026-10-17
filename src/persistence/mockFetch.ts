import type { Fetch } from './restRepository'

interface MockFetchOptions {
  latencyMs?: number
  storage?: Storage
  storageKey?: string
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export function createMockFetch({
  latencyMs = 300,
  storage = window.localStorage,
  storageKey = 'sticky-notes',
}: MockFetchOptions = {}): Fetch {
  const handle = (url: string, init?: RequestInit): Response => {
    if (!url.endsWith('/notes')) return json({ error: 'Not found' }, 404)

    switch (init?.method ?? 'GET') {
      case 'GET':
        return new Response(storage.getItem(storageKey) ?? '[]', {
          headers: { 'Content-Type': 'application/json' },
        })
      case 'PUT':
        if (typeof init?.body !== 'string') return json({ error: 'Invalid body' }, 400)
        storage.setItem(storageKey, init.body)
        return new Response(null, { status: 204 })
      default:
        return json({ error: 'Method not allowed' }, 405)
    }
  }

  return (url, init) =>
    new Promise((resolve) => {
      setTimeout(() => {
        try {
          resolve(handle(url, init))
        } catch {
          resolve(json({ error: 'Internal server error' }, 500))
        }
      }, latencyMs)
    })
}
