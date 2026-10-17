import { createContext, useContext, type Dispatch } from 'react'
import type { NotesAction, NotesState } from '../domain/types'

export const NotesStateContext = createContext<NotesState | null>(null)
export const NotesDispatchContext = createContext<Dispatch<NotesAction> | null>(null)

export function useNotesState(): NotesState {
  const state = useContext(NotesStateContext)
  if (!state) throw new Error('useNotesState must be used within <NotesProvider>')
  return state
}

export function useNotesDispatch(): Dispatch<NotesAction> {
  const dispatch = useContext(NotesDispatchContext)
  if (!dispatch) throw new Error('useNotesDispatch must be used within <NotesProvider>')
  return dispatch
}
