import { useReducer, type ReactNode } from 'react'
import { initialNotesState, notesReducer } from '../domain/notesReducer'
import { NotesDispatchContext, NotesStateContext } from './notesContext'

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialNotesState)

  return (
    <NotesDispatchContext value={dispatch}>
      <NotesStateContext value={state}>{children}</NotesStateContext>
    </NotesDispatchContext>
  )
}
