import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { Note, NoteId } from '../domain/note'
import type { NotesRepository } from '../persistence/NotesRepository'
import { NotesProvider } from './NotesProvider'
import { useNotesDispatch } from './notesContext'
import { useNotesPersistence } from './useNotesPersistence'

const stored: Note[] = [
  {
    id: 'a' as NoteId,
    rect: { x: 0, y: 0, width: 200, height: 160 },
    text: '',
    color: 'yellow',
    zIndex: 1,
  },
]

const wrapper = ({ children }: { children: ReactNode }) => <NotesProvider>{children}</NotesProvider>

function setup(repository: NotesRepository) {
  return renderHook(
    () => ({ status: useNotesPersistence(repository), dispatch: useNotesDispatch() }),
    { wrapper },
  )
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useNotesPersistence', () => {
  it('loads notes without saving them back', async () => {
    const repository = {
      load: vi.fn(async () => stored),
      save: vi.fn<NotesRepository['save']>(async () => {}),
    }
    const { result } = setup(repository)
    expect(result.current.status).toBe('loading')

    await act(() => vi.runAllTimersAsync())
    expect(result.current.status).toBe('saved')
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('debounces saves of subsequent changes', async () => {
    const repository = {
      load: vi.fn(async () => stored),
      save: vi.fn<NotesRepository['save']>(async () => {}),
    }
    const { result } = setup(repository)
    await act(() => vi.runAllTimersAsync())

    act(() => {
      result.current.dispatch({ type: 'note/textChanged', id: 'a' as NoteId, text: 'h' })
      result.current.dispatch({ type: 'note/textChanged', id: 'a' as NoteId, text: 'hi' })
    })
    expect(result.current.status).toBe('saving')

    await act(() => vi.runAllTimersAsync())
    expect(repository.save).toHaveBeenCalledTimes(1)
    expect(repository.save.mock.calls[0]?.[0]).toMatchObject([{ text: 'hi' }])
    expect(result.current.status).toBe('saved')
  })

  it('never saves when loading failed', async () => {
    const repository = {
      load: vi.fn(async () => Promise.reject(new Error('offline'))),
      save: vi.fn<NotesRepository['save']>(async () => {}),
    }
    const { result } = setup(repository)
    await act(() => vi.runAllTimersAsync())
    expect(result.current.status).toBe('loadFailed')

    act(() => result.current.dispatch({ type: 'note/removed', id: 'a' as NoteId }))
    await act(() => vi.runAllTimersAsync())
    expect(repository.save).not.toHaveBeenCalled()
  })

  it('reports failed saves', async () => {
    const repository = {
      load: vi.fn(async () => stored),
      save: vi.fn<NotesRepository['save']>(async () => Promise.reject(new Error('offline'))),
    }
    const { result } = setup(repository)
    await act(() => vi.runAllTimersAsync())

    act(() => result.current.dispatch({ type: 'note/removed', id: 'a' as NoteId }))
    await act(() => vi.runAllTimersAsync())
    expect(result.current.status).toBe('saveFailed')
  })
})
