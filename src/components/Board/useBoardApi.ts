import { useMemo, useRef, useState } from 'react'
import { containsPoint } from '../../domain/geometry'
import type { BoardApi } from './boardContext'

export function useBoardApi() {
  const boardRef = useRef<HTMLElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const [isTrashActive, setTrashActive] = useState(false)

  const boardApi = useMemo<BoardApi>(
    () => ({
      getBounds: () => ({
        width: boardRef.current?.clientWidth ?? 0,
        height: boardRef.current?.clientHeight ?? 0,
      }),
      toBoardPoint: (client) => {
        const origin = boardRef.current?.getBoundingClientRect()
        return { x: client.x - (origin?.left ?? 0), y: client.y - (origin?.top ?? 0) }
      },
      isOverTrash: (client) => {
        const trash = trashRef.current?.getBoundingClientRect()
        return trash !== undefined && containsPoint(trash, client)
      },
      setTrashActive,
    }),
    [],
  )

  return { boardRef, trashRef, isTrashActive, boardApi }
}
