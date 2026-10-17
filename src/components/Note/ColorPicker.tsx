import { NOTE_COLORS, type NoteColor } from '../../domain/types'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="Note color">
      {NOTE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={styles.swatch}
          style={{ background: `var(--note-${color})` }}
          aria-label={color}
          aria-pressed={color === value}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
