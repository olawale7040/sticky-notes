import { useState, type MouseEvent, type PointerEvent } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import { clamp, rectFromPoints } from '../../domain/geometry'
import { createNoteId, DEFAULT_NOTE_COLOR, DEFAULT_NOTE_SIZE, fitNoteRect } from '../../domain/note'
import type { Rect } from '../../domain/types'
import { usePointerDrag, type DragUpdate } from '../../interaction/usePointerDrag'
import type { BoardApi } from './boardContext'

const CLICK_TOLERANCE = 4

export function useNoteCreation(board: BoardApi) {
  const dispatch = useNotesDispatch()
  const [draft, setDraft] = useState<Rect | null>(null)

  const createNote = (rect: Rect) => {
    dispatch({
      type: 'note/created',
      id: createNoteId(),
      rect: fitNoteRect(rect, board.getBounds()),
      color: DEFAULT_NOTE_COLOR,
    })
  }

  const toDraft = ({ client, delta }: DragUpdate): Rect | null => {
    const bounds = board.getBounds()
    const start = board.toBoardPoint({ x: client.x - delta.x, y: client.y - delta.y })
    const current = board.toBoardPoint(client)
    const end = { x: clamp(current.x, 0, bounds.width), y: clamp(current.y, 0, bounds.height) }
    const rect = rectFromPoints(start, end)
    if (rect.width < CLICK_TOLERANCE && rect.height < CLICK_TOLERANCE) return null
    return fitNoteRect(rect, bounds)
  }

  const startDrawing = usePointerDrag({
    onMove: (update) => setDraft(toDraft(update)),
    onEnd: (update) => {
      setDraft(null)
      const rect = toDraft(update)
      if (rect) createNote(rect)
    },
    onCancel: () => setDraft(null),
  })

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    startDrawing(event)
  }

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    const center = board.toBoardPoint({ x: event.clientX, y: event.clientY })
    createNote({
      ...DEFAULT_NOTE_SIZE,
      x: center.x - DEFAULT_NOTE_SIZE.width / 2,
      y: center.y - DEFAULT_NOTE_SIZE.height / 2,
    })
  }

  return { draft, handlePointerDown, handleDoubleClick }
}
