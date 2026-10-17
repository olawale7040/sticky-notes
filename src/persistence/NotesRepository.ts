import type { Note } from '../domain/note'

export interface NotesRepository {
  load(): Promise<Note[]>
  save(notes: readonly Note[]): Promise<void>
}
