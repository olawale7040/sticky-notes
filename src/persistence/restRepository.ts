import type { Fetch, NotesRepository } from './types'
import { parseNotes } from './parseNotes'

export function createRestRepository(baseUrl: string, fetchFn: Fetch): NotesRepository {
  const url = `${baseUrl}/notes`

  return {
    async load() {
      const response = await fetchFn(url)
      if (!response.ok) throw new Error(`Failed to load notes (${response.status})`)
      return parseNotes(await response.json())
    },
    async save(notes) {
      const response = await fetchFn(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes),
      })
      if (!response.ok) throw new Error(`Failed to save notes (${response.status})`)
    },
  }
}
