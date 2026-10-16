import { useState } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import { clampPosition, clampSize, type Point, type Rect } from '../../domain/geometry'
import { MIN_NOTE_SIZE, type Note } from '../../domain/note'
import { usePointerDrag } from '../../interaction/usePointerDrag'
import { useBoard } from '../Board/boardContext'

const translate = (rect: Rect, delta: Point): Rect => ({
  ...rect,
  x: rect.x + delta.x,
  y: rect.y + delta.y,
})

const grow = (rect: Rect, delta: Point): Rect => ({
  ...rect,
  width: rect.width + delta.x,
  height: rect.height + delta.y,
})

export function useNoteGestures(note: Note) {
  const dispatch = useNotesDispatch()
  const board = useBoard()
  const [preview, setPreview] = useState<Rect | null>(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const moved = (delta: Point) => clampPosition(translate(note.rect, delta), board.getBounds())
  const resized = (delta: Point) =>
    clampSize(grow(note.rect, delta), MIN_NOTE_SIZE, board.getBounds())

  const reset = () => {
    setPreview(null)
    setIsOverTrash(false)
    board.setTrashActive(false)
  }

  const startMove = usePointerDrag({
    onMove: ({ delta, client }) => {
      const overTrash = board.isOverTrash(client)
      setPreview(moved(delta))
      setIsOverTrash(overTrash)
      board.setTrashActive(overTrash)
    },
    onEnd: ({ delta, client }) => {
      reset()
      if (board.isOverTrash(client)) {
        dispatch({ type: 'note/removed', id: note.id })
      } else {
        dispatch({ type: 'note/rectChanged', id: note.id, rect: moved(delta) })
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
    isDragging: preview !== null,
    isOverTrash,
    startMove,
    startResize,
  }
}
