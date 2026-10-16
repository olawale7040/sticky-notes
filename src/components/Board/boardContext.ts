import { createContext, useContext } from 'react'
import type { Point, Size } from '../../domain/geometry'

export interface BoardApi {
  getBounds(): Size
  toBoardPoint(client: Point): Point
  isOverTrash(client: Point): boolean
  setTrashActive(active: boolean): void
}

export const BoardContext = createContext<BoardApi | null>(null)

export function useBoard(): BoardApi {
  const board = useContext(BoardContext)
  if (!board) throw new Error('useBoard must be used within <Board>')
  return board
}
