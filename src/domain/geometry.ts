export interface Point {
  readonly x: number
  readonly y: number
}

export interface Size {
  readonly width: number
  readonly height: number
}

export interface Rect extends Point, Size {}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const isSameRect = (a: Rect, b: Rect): boolean =>
  a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

export const translateRect = (rect: Rect, delta: Point): Rect => ({
  ...rect,
  x: rect.x + delta.x,
  y: rect.y + delta.y,
})

export const resizeRect = (rect: Rect, delta: Point): Rect => ({
  ...rect,
  width: rect.width + delta.x,
  height: rect.height + delta.y,
})

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  }
}

export function containsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function clampPosition(rect: Rect, bounds: Size): Rect {
  return {
    ...rect,
    x: clamp(rect.x, 0, Math.max(0, bounds.width - rect.width)),
    y: clamp(rect.y, 0, Math.max(0, bounds.height - rect.height)),
  }
}

export function clampSize(rect: Rect, min: Size, bounds: Size): Rect {
  return {
    ...rect,
    width: clamp(rect.width, min.width, Math.max(min.width, bounds.width - rect.x)),
    height: clamp(rect.height, min.height, Math.max(min.height, bounds.height - rect.y)),
  }
}
