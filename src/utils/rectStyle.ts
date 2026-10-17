import type { CSSProperties } from 'react'
import type { Rect } from '../domain/geometry'

export const rectStyle = ({ x, y, width, height }: Rect): CSSProperties => ({
  transform: `translate(${x}px, ${y}px)`,
  width,
  height,
})
