import { clamp, clampPosition, type Rect, type Size } from './geometry'

export type NoteId = string & { readonly __brand: 'NoteId' }

export const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export interface Note {
  readonly id: NoteId
  readonly rect: Rect
  readonly text: string
  readonly color: NoteColor
  readonly zIndex: number
}

export const MIN_NOTE_SIZE: Size = { width: 120, height: 90 }
export const DEFAULT_NOTE_SIZE: Size = { width: 200, height: 160 }

export function fitNoteRect(rect: Rect, bounds: Size): Rect {
  const fitAxis = (size: number, min: number, max: number) => clamp(size, min, Math.max(min, max))
  return clampPosition(
    {
      ...rect,
      width: fitAxis(rect.width, MIN_NOTE_SIZE.width, bounds.width),
      height: fitAxis(rect.height, MIN_NOTE_SIZE.height, bounds.height),
    },
    bounds,
  )
}

export const createNoteId = (): NoteId => crypto.randomUUID() as NoteId

export const isNoteColor = (value: unknown): value is NoteColor =>
  NOTE_COLORS.includes(value as NoteColor)
