import { useMemo, useRef, useState } from 'react'
import { containsPoint, rectCenter } from '../../domain/geometry'
import type { Point } from '../../domain/types'
import type { BoardApi } from './boardContext'

export function useBoardApi() {
  const boardRef = useRef<HTMLElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const [isTrashActive, setTrashActive] = useState(false)

  const boardApi = useMemo<BoardApi>(() => {
    const toBoardPoint = (client: Point): Point => {
      const origin = boardRef.current?.getBoundingClientRect()
      return { x: client.x - (origin?.left ?? 0), y: client.y - (origin?.top ?? 0) }
    }

    return {
      getBounds: () => ({
        width: boardRef.current?.clientWidth ?? 0,
        height: boardRef.current?.clientHeight ?? 0,
      }),
      toBoardPoint,
      isOverTrash: (pointer, noteRect) => {
        const trash = trashRef.current?.getBoundingClientRect()
        if (!trash) return false
        const isPointerOnTrash = containsPoint(trash, pointer)
        const isNoteOverTrash = containsPoint(noteRect, toBoardPoint(rectCenter(trash)))
        return isPointerOnTrash || isNoteOverTrash
      },
      setTrashActive,
    }
  }, [])

  return { boardRef, trashRef, isTrashActive, boardApi }
}
