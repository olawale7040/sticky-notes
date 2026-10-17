import { useEffect, type RefObject } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import type { BoardApi } from './boardContext'

export function useFitNotesToBoard(boardRef: RefObject<HTMLElement | null>, board: BoardApi) {
  const dispatch = useNotesDispatch()

  useEffect(() => {
    const element = boardRef.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      const bounds = board.getBounds()
      if (bounds.width > 0 && bounds.height > 0) dispatch({ type: 'notes/boundsChanged', bounds })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [boardRef, board, dispatch])
}
