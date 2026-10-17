import { createContext, useContext } from 'react'
import type { Point, Rect, Size } from '../../domain/types'

export interface BoardApi {
  getBounds(): Size
  toBoardPoint(client: Point): Point
  isOverTrash(pointer: Point, noteRect: Rect): boolean
  setTrashActive(active: boolean): void
}

export const BoardContext = createContext<BoardApi | null>(null)

export function useBoard(): BoardApi {
  const board = useContext(BoardContext)
  if (!board) throw new Error('useBoard must be used within <Board>')
  return board
}
