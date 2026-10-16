import { clampPosition, clampSize, containsPoint, rectFromPoints } from './geometry'

const bounds = { width: 1000, height: 800 }

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

describe('containsPoint', () => {
  const rect = { x: 10, y: 10, width: 100, height: 50 }

  it('includes points on the edges', () => {
    expect(containsPoint(rect, { x: 10, y: 60 })).toBe(true)
  })

  it('excludes points outside', () => {
    expect(containsPoint(rect, { x: 111, y: 30 })).toBe(false)
  })
})

describe('clampPosition', () => {
  it('keeps the rect fully inside the bounds', () => {
    expect(clampPosition({ x: -20, y: 790, width: 100, height: 100 }, bounds)).toEqual({
      x: 0,
      y: 700,
      width: 100,
      height: 100,
    })
  })
})

describe('clampSize', () => {
  const min = { width: 120, height: 90 }

  it('enforces the minimum size', () => {
    expect(clampSize({ x: 0, y: 0, width: 10, height: 10 }, min, bounds)).toMatchObject(min)
  })

  it('stops growth at the bounds edge', () => {
    expect(clampSize({ x: 800, y: 0, width: 500, height: 100 }, min, bounds).width).toBe(200)
  })
})
