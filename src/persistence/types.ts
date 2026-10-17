import type { Note } from '../domain/types'

export interface NotesRepository {
  load(): Promise<Note[]>
  save(notes: readonly Note[]): Promise<void>
}

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>
