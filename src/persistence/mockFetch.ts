import type { Fetch } from './restRepository'

interface MockFetchOptions {
  latencyMs?: number
  storage?: Storage
  storageKey?: string
}

const respond = (status: number, body: string | null = null) =>
  new Response(body, { status, headers: { 'Content-Type': 'application/json' } })

const error = (status: number, message: string) =>
  respond(status, JSON.stringify({ error: message }))

export function createMockFetch({
  latencyMs = 300,
  storage = window.localStorage,
  storageKey = 'sticky-notes',
}: MockFetchOptions = {}): Fetch {
  const handle = (url: string, init?: RequestInit): Response => {
    if (!url.endsWith('/notes')) return error(404, 'Not found')

    switch (init?.method ?? 'GET') {
      case 'GET':
        return respond(200, storage.getItem(storageKey) ?? '[]')
      case 'PUT':
        if (typeof init?.body !== 'string') return error(400, 'Invalid body')
        storage.setItem(storageKey, init.body)
        return respond(204)
      default:
        return error(405, 'Method not allowed')
    }
  }

  return (url, init) =>
    new Promise((resolve) => {
      setTimeout(() => {
        try {
          resolve(handle(url, init))
        } catch {
          resolve(error(500, 'Internal server error'))
        }
      }, latencyMs)
    })
}
