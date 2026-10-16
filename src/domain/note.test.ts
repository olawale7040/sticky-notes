import { fitNoteRect, isNoteColor, MIN_NOTE_SIZE } from './note'

const bounds = { width: 1000, height: 800 }

describe('fitNoteRect', () => {
  it('grows a small rect to the minimum note size', () => {
    expect(fitNoteRect({ x: 10, y: 10, width: 5, height: 5 }, bounds)).toEqual({
      x: 10,
      y: 10,
      ...MIN_NOTE_SIZE,
    })
  })

  it('moves a minimum-size note back inside when created at the edge', () => {
    expect(fitNoteRect({ x: 990, y: 790, width: 5, height: 5 }, bounds)).toEqual({
      x: bounds.width - MIN_NOTE_SIZE.width,
      y: bounds.height - MIN_NOTE_SIZE.height,
      ...MIN_NOTE_SIZE,
    })
  })
})

describe('isNoteColor', () => {
  it('accepts known colors only', () => {
    expect(isNoteColor('pink')).toBe(true)
    expect(isNoteColor('orange')).toBe(false)
    expect(isNoteColor(42)).toBe(false)
  })
})
