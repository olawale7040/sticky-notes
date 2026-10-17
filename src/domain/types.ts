export interface Point {
  readonly x: number
  readonly y: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export interface Rect extends Point, Size {}

export type NoteId = string & { readonly __brand: 'NoteId' }

export const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export interface Note {
  readonly id: NoteId
  readonly rect: Rect
  readonly text: string
  readonly color: NoteColor
  readonly zIndex: number
}

export interface NotesState {
  readonly notes: readonly Note[]
}

export type NotesAction =
  | { type: 'notes/loaded'; notes: readonly Note[] }
  | { type: 'notes/boundsChanged'; bounds: Size }
  | { type: 'note/created'; id: NoteId; rect: Rect; color: NoteColor }
  | { type: 'note/rectChanged'; id: NoteId; rect: Rect }
  | { type: 'note/textChanged'; id: NoteId; text: string }
  | { type: 'note/colorChanged'; id: NoteId; color: NoteColor }
  | { type: 'note/broughtToFront'; id: NoteId }
  | { type: 'note/removed'; id: NoteId }
