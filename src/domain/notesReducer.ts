import { isSameRect, type Rect, type Size } from './geometry'
import { fitNoteRect, MIN_NOTE_SIZE, type Note, type NoteColor, type NoteId } from './note'

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

export const initialNotesState: NotesState = { notes: [] }

const topZIndex = (notes: readonly Note[]): number =>
  notes.reduce((max, note) => Math.max(max, note.zIndex), 0)

const withMinSize = (rect: Rect): Rect => ({
  ...rect,
  width: Math.max(rect.width, MIN_NOTE_SIZE.width),
  height: Math.max(rect.height, MIN_NOTE_SIZE.height),
})

function mapNotes(state: NotesState, update: (note: Note) => Note): NotesState {
  let changed = false
  const notes = state.notes.map((note) => {
    const next = update(note)
    if (next !== note) changed = true
    return next
  })
  return changed ? { notes } : state
}

const updateNote = (state: NotesState, id: NoteId, update: (note: Note) => Note): NotesState =>
  mapNotes(state, (note) => (note.id === id ? update(note) : note))

const withRect = (note: Note, rect: Rect): Note =>
  isSameRect(note.rect, rect) ? note : { ...note, rect }

export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'notes/loaded':
      return { notes: action.notes }

    case 'notes/boundsChanged':
      return mapNotes(state, (note) => withRect(note, fitNoteRect(note.rect, action.bounds)))

    case 'note/created':
      return {
        notes: [
          ...state.notes,
          {
            id: action.id,
            rect: withMinSize(action.rect),
            text: '',
            color: action.color,
            zIndex: topZIndex(state.notes) + 1,
          },
        ],
      }

    case 'note/rectChanged':
      return updateNote(state, action.id, (note) => withRect(note, withMinSize(action.rect)))

    case 'note/textChanged':
      return updateNote(state, action.id, (note) =>
        note.text === action.text ? note : { ...note, text: action.text },
      )

    case 'note/colorChanged':
      return updateNote(state, action.id, (note) =>
        note.color === action.color ? note : { ...note, color: action.color },
      )

    case 'note/broughtToFront': {
      const top = topZIndex(state.notes)
      return updateNote(state, action.id, (note) =>
        note.zIndex === top ? note : { ...note, zIndex: top + 1 },
      )
    }

    case 'note/removed': {
      const notes = state.notes.filter((note) => note.id !== action.id)
      return notes.length === state.notes.length ? state : { notes }
    }
  }
}
