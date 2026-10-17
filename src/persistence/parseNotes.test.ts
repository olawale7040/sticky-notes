import { parseNotes } from './parseNotes'

const valid = {
  id: 'a',
  rect: { x: 1, y: 2, width: 200, height: 150 },
  text: 'hello',
  color: 'pink',
  zIndex: 3,
}

describe('parseNotes', () => {
  it('keeps valid notes', () => {
    expect(parseNotes([valid])).toEqual([valid])
  })

  it('drops invalid entries instead of failing', () => {
    const invalid = [
      null,
      { ...valid, color: 'orange' },
      { ...valid, rect: { x: 1, y: 2, width: 'wide', height: 1 } },
      { ...valid, zIndex: Number.NaN },
    ]
    expect(parseNotes([...invalid, valid])).toEqual([valid])
  })

  it('strips unknown fields', () => {
    expect(parseNotes([{ ...valid, extra: true, rect: { ...valid.rect, z: 1 } }])).toEqual([valid])
  })

  it('returns an empty list for non-array input', () => {
    expect(parseNotes({ notes: [valid] })).toEqual([])
  })
})
