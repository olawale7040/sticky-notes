import { useState } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import { clampPosition, clampSize, resizeRect, translateRect } from '../../domain/geometry'
import { MIN_NOTE_SIZE } from '../../domain/note'
import type { Note, Point, Rect } from '../../domain/types'
import { usePointerDrag } from '../../interaction/usePointerDrag'
import { useBoard } from '../Board/boardContext'

export function useNoteGestures(note: Note) {
  const dispatch = useNotesDispatch()
  const board = useBoard()
  const [preview, setPreview] = useState<Rect | null>(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const resized = (delta: Point) =>
    clampSize(resizeRect(note.rect, delta), MIN_NOTE_SIZE, board.getBounds())

  const reset = () => {
    setPreview(null)
    setIsOverTrash(false)
    board.setTrashActive(false)
  }

  const startMove = usePointerDrag({
    onMove: ({ delta, client }) => {
      const overTrash = board.isOverTrash(client)
      setPreview(translateRect(note.rect, delta))
      setIsOverTrash(overTrash)
      board.setTrashActive(overTrash)
    },
    onEnd: ({ delta, client }) => {
      reset()
      if (board.isOverTrash(client)) {
        dispatch({ type: 'note/removed', id: note.id })
      } else {
        const rect = clampPosition(translateRect(note.rect, delta), board.getBounds())
        dispatch({ type: 'note/rectChanged', id: note.id, rect })
      }
    },
    onCancel: reset,
  })

  const startResize = usePointerDrag({
    onMove: ({ delta }) => setPreview(resized(delta)),
    onEnd: ({ delta }) => {
      reset()
      dispatch({ type: 'note/rectChanged', id: note.id, rect: resized(delta) })
    },
    onCancel: reset,
  })

  return {
    rect: preview ?? note.rect,
    isInteracting: preview !== null,
    isOverTrash,
    startMove,
    startResize,
  }
}
