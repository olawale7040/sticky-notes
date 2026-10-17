import { useState } from 'react'
import { clamp, rectFromPoints } from '../../domain/geometry'
import { fitNoteRect } from '../../domain/note'
import type { Point, Rect } from '../../domain/types'
import { usePointerDrag, type DragUpdate } from '../../interaction/usePointerDrag'
import type { BoardApi } from './boardContext'

const CLICK_TOLERANCE = 4

export function useNoteDrawing(board: BoardApi, onDraw: (rect: Rect) => void) {
  const [draft, setDraft] = useState<Rect | null>(null)

  const toDraft = ({ client, delta }: DragUpdate): Rect | null => {
    const bounds = board.getBounds()
    const start = board.toBoardPoint({ x: client.x - delta.x, y: client.y - delta.y })
    const current = board.toBoardPoint(client)
    const end: Point = {
      x: clamp(current.x, 0, bounds.width),
      y: clamp(current.y, 0, bounds.height),
    }
    const rect = rectFromPoints(start, end)
    if (rect.width < CLICK_TOLERANCE && rect.height < CLICK_TOLERANCE) return null
    return fitNoteRect(rect, bounds)
  }

  const startDrawing = usePointerDrag({
    onMove: (update) => setDraft(toDraft(update)),
    onEnd: (update) => {
      setDraft(null)
      const rect = toDraft(update)
      if (rect) onDraw(rect)
    },
    onCancel: () => setDraft(null),
  })

  return { draft, startDrawing }
}
