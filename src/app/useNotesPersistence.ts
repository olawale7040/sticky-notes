import { useEffect, useRef, useState } from 'react'
import type { Note } from '../domain/types'
import type { NotesRepository } from '../persistence/types'
import { useNotesDispatch, useNotesState } from './notesContext'

export type SyncStatus = 'loading' | 'loadFailed' | 'saving' | 'saved' | 'saveFailed'

const SAVE_DEBOUNCE_MS = 500

export function useNotesPersistence(repository: NotesRepository): SyncStatus {
  const { notes } = useNotesState()
  const dispatch = useNotesDispatch()
  const [status, setStatus] = useState<SyncStatus>('loading')
  const persisted = useRef<readonly Note[] | null>(null)
  const latest = useRef(notes)
  const saveQueue = useRef(Promise.resolve())

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const loaded = await repository.load()
        if (cancelled) return
        persisted.current = loaded
        dispatch({ type: 'notes/loaded', notes: loaded })
        setStatus('saved')
      } catch {
        if (!cancelled) setStatus('loadFailed')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [repository, dispatch])

  useEffect(() => {
    latest.current = notes
    const hasLoaded = persisted.current !== null
    const hasUnsavedChanges = persisted.current !== notes
    if (!hasLoaded || !hasUnsavedChanges) return

    const save = async () => {
      try {
        await repository.save(notes)
        persisted.current = notes
        if (latest.current === notes) setStatus('saved')
      } catch {
        setStatus('saveFailed')
      }
    }

    const queueSave = () => {
      saveQueue.current = saveQueue.current.then(save)
    }

    setStatus('saving')
    const timer = setTimeout(queueSave, SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [notes, repository])

  return status
}
