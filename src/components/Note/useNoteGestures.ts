import { useState, type KeyboardEvent } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import { clampPosition, clampSize, resizeRect, translateRect } from '../../domain/geometry'
import { MIN_NOTE_SIZE } from '../../domain/note'
import type { Note, Point, Rect } from '../../domain/types'
import { usePointerDrag } from '../../interaction/usePointerDrag'
import { useBoard } from '../Board/boardContext'

const KEYBOARD_STEP = 10

const ARROW_DIRECTIONS: Record<string, Point> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

export function useNoteGestures(note: Note) {
  const dispatch = useNotesDispatch()
  const board = useBoard()
  const [preview, setPreview] = useState<Rect | null>(null)
  const [isOverTrash, setIsOverTrash] = useState(false)

  const moved = (delta: Point) => clampPosition(translateRect(note.rect, delta), board.getBounds())
  const resized = (delta: Point) =>
    clampSize(resizeRect(note.rect, delta), MIN_NOTE_SIZE, board.getBounds())

  const reset = () => {
    setPreview(null)
    setIsOverTrash(false)
    board.setTrashActive(false)
  }

  const startMove = usePointerDrag({
    onMove: ({ delta, client }) => {
      const rect = translateRect(note.rect, delta)
      const overTrash = board.isOverTrash(client, rect)
      setPreview(rect)
      setIsOverTrash(overTrash)
      board.setTrashActive(overTrash)
    },
    onEnd: ({ delta, client }) => {
      reset()
      if (board.isOverTrash(client, translateRect(note.rect, delta))) {
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

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      dispatch({ type: 'note/removed', id: note.id })
      return
    }
    const direction = ARROW_DIRECTIONS[event.key]
    if (!direction) return
    event.preventDefault()
    const delta = { x: direction.x * KEYBOARD_STEP, y: direction.y * KEYBOARD_STEP }
    const rect = event.shiftKey ? resized(delta) : moved(delta)
    dispatch({ type: 'note/rectChanged', id: note.id, rect })
  }

  return {
    rect: preview ?? note.rect,
    isInteracting: preview !== null,
    isOverTrash,
    startMove,
    startResize,
    handleKeyDown,
  }
}
