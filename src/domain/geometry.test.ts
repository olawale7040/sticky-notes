import {
  clampPosition,
  clampSize,
  containsPoint,
  rectCenter,
  rectFromPoints,
  resizeRect,
  translateRect,
} from './geometry'

const bounds = { width: 1000, height: 800 }
const rect = { x: 10, y: 20, width: 100, height: 50 }

describe('translateRect', () => {
  it('moves a rect without changing its size', () => {
    expect(translateRect(rect, { x: 5, y: -5 })).toEqual({ ...rect, x: 15, y: 15 })
  })
})

describe('resizeRect', () => {
  it('resizes a rect without moving it', () => {
    expect(resizeRect(rect, { x: 5, y: -5 })).toEqual({ ...rect, width: 105, height: 45 })
  })
})

describe('rectFromPoints', () => {
  it('normalizes corners dragged in any direction', () => {
    expect(rectFromPoints({ x: 300, y: 200 }, { x: 100, y: 50 })).toEqual({
      x: 100,
      y: 50,
      width: 200,
      height: 150,
    })
  })
})

describe('rectCenter', () => {
  it('returns the middle of a rect', () => {
    expect(rectCenter(rect)).toEqual({ x: 60, y: 45 })
  })
})

describe('containsPoint', () => {
  it('includes points on the edges', () => {
    expect(containsPoint(rect, { x: rect.x, y: rect.y + rect.height })).toBe(true)
  })

  it('excludes points outside', () => {
    expect(containsPoint(rect, { x: rect.x + rect.width + 1, y: 30 })).toBe(false)
  })
})

describe('clampPosition', () => {
  it('keeps the rect fully inside the bounds', () => {
    const size = { width: 100, height: 100 }
    expect(clampPosition({ ...size, x: -20, y: 790 }, bounds)).toEqual({
      ...size,
      x: 0,
      y: bounds.height - size.height,
    })
  })

  it('pins a rect larger than the bounds to the top-left corner', () => {
    const oversized = { x: 50, y: 50, width: 1200, height: 900 }
    expect(clampPosition(oversized, bounds)).toEqual({ ...oversized, x: 0, y: 0 })
  })
})

describe('clampSize', () => {
  const min = { width: 120, height: 90 }

  it('enforces the minimum size', () => {
    expect(clampSize({ x: 0, y: 0, width: 10, height: 10 }, min, bounds)).toMatchObject(min)
  })

  it('stops growth at the bounds edge', () => {
    const x = 800
    expect(clampSize({ x, y: 0, width: 500, height: 100 }, min, bounds).width).toBe(
      bounds.width - x,
    )
  })

  it('keeps the minimum size when there is less room than that before the edge', () => {
    const nearEdge = { x: bounds.width - 50, y: bounds.height - 50, width: 500, height: 500 }
    expect(clampSize(nearEdge, min, bounds)).toMatchObject(min)
  })
})
