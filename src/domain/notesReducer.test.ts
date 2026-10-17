import { MIN_NOTE_SIZE } from './note'
import { initialNotesState, notesReducer } from './notesReducer'
import type { NoteId, NotesAction, NotesState } from './types'

const id = (value: string) => value as NoteId
const rect = { x: 0, y: 0, width: 200, height: 150 }

const reduce = (actions: NotesAction[], state: NotesState = initialNotesState) =>
  actions.reduce(notesReducer, state)

const withTwoNotes = reduce([
  { type: 'note/created', id: id('a'), rect, color: 'yellow' },
  { type: 'note/created', id: id('b'), rect, color: 'blue' },
])

describe('notesReducer', () => {
  it('creates notes on top of existing ones', () => {
    expect(withTwoNotes.notes.map((n) => [n.id, n.zIndex])).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  it('enforces the minimum note size', () => {
    const state = reduce(
      [{ type: 'note/rectChanged', id: id('a'), rect: { ...rect, width: 1, height: 1 } }],
      withTwoNotes,
    )
    expect(state.notes[0]?.rect).toMatchObject(MIN_NOTE_SIZE)
  })

  it('brings a note to front', () => {
    const state = reduce([{ type: 'note/broughtToFront', id: id('a') }], withTwoNotes)
    expect(state.notes.find((n) => n.id === 'a')?.zIndex).toBe(3)
  })

  it('returns the same state when nothing changes', () => {
    const noOps: NotesAction[] = [
      { type: 'note/broughtToFront', id: id('b') },
      { type: 'note/textChanged', id: id('a'), text: '' },
      { type: 'note/colorChanged', id: id('a'), color: 'yellow' },
      { type: 'note/removed', id: id('missing') },
    ]
    for (const action of noOps) {
      expect(notesReducer(withTwoNotes, action)).toBe(withTwoNotes)
    }
  })

  it('keeps untouched notes referentially equal', () => {
    const state = reduce([{ type: 'note/textChanged', id: id('a'), text: 'hi' }], withTwoNotes)
    expect(state.notes[0]?.text).toBe('hi')
    expect(state.notes[1]).toBe(withTwoNotes.notes[1])
  })

  it('removes a note', () => {
    const state = reduce([{ type: 'note/removed', id: id('a') }], withTwoNotes)
    expect(state.notes.map((n) => n.id)).toEqual(['b'])
  })

  it('pulls notes back inside when the board shrinks', () => {
    const state = reduce(
      [
        { type: 'note/rectChanged', id: id('a'), rect: { ...rect, x: 1700, y: 900 } },
        { type: 'notes/boundsChanged', bounds: { width: 1024, height: 700 } },
      ],
      withTwoNotes,
    )
    expect(state.notes[0]?.rect).toEqual({ ...rect, x: 1024 - 200, y: 700 - 150 })
    expect(state.notes[1]).toBe(withTwoNotes.notes[1])
  })

  it('ignores bounds changes and moves that leave every note in place', () => {
    expect(
      notesReducer(withTwoNotes, {
        type: 'notes/boundsChanged',
        bounds: { width: 1024, height: 700 },
      }),
    ).toBe(withTwoNotes)
    expect(notesReducer(withTwoNotes, { type: 'note/rectChanged', id: id('a'), rect })).toBe(
      withTwoNotes,
    )
  })
})
