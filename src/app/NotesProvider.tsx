import { useReducer, type ReactNode } from 'react'
import { initialNotesState, notesReducer, type NotesState } from '../domain/notesReducer'
import { NotesDispatchContext, NotesStateContext } from './notesContext'

interface NotesProviderProps {
  children: ReactNode
  initialState?: NotesState
}

export function NotesProvider({ children, initialState = initialNotesState }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialState)

  return (
    <NotesDispatchContext value={dispatch}>
      <NotesStateContext value={state}>{children}</NotesStateContext>
    </NotesDispatchContext>
  )
}
