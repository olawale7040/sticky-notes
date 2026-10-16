import { useState } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import { clampPosition, type Point, type Rect } from '../../domain/geometry'
import type { Note } from '../../domain/note'
import { usePointerDrag } from '../../interaction/usePointerDrag'
import { useBoard } from '../Board/boardContext'

const translate = (rect: Rect, delta: Point): Rect => ({
  ...rect,
  x: rect.x + delta.x,
  y: rect.y + delta.y,
})

export function useNoteGestures(note: Note) {
  const dispatch = useNotesDispatch()
  const board = useBoard()
  const [preview, setPreview] = useState<Rect | null>(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const reset = () => {
    setPreview(null)
    setIsOverTrash(false)
    board.setTrashActive(false)
  }

  const startMove = usePointerDrag({
    onMove: ({ delta, client }) => {
      const overTrash = board.isOverTrash(client)
      setPreview(clampPosition(translate(note.rect, delta), board.getBounds()))
      setIsOverTrash(overTrash)
      board.setTrashActive(overTrash)
    },
    onEnd: ({ delta, client }) => {
      reset()
      if (board.isOverTrash(client)) {
        dispatch({ type: 'note/removed', id: note.id })
      } else {
        const rect = clampPosition(translate(note.rect, delta), board.getBounds())
        dispatch({ type: 'note/rectChanged', id: note.id, rect })
      }
    },
    onCancel: reset,
  })

  return {
    rect: preview ?? note.rect,
    isDragging: preview !== null,
    isOverTrash,
    startMove,
  }
}
