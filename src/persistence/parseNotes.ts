import { isNoteColor } from '../domain/note'
import type { Note, Rect } from '../domain/types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isRect = (value: unknown): value is Rect =>
  isRecord(value) &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height)

const isNote = (value: unknown): value is Note =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  isRect(value.rect) &&
  typeof value.text === 'string' &&
  isNoteColor(value.color) &&
  isFiniteNumber(value.zIndex)

export function parseNotes(data: unknown): Note[] {
  if (!Array.isArray(data)) return []
  return data.filter(isNote).map(({ id, rect, text, color, zIndex }) => ({
    id,
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    text,
    color,
    zIndex,
  }))
}
