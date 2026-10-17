import { NOTE_COLORS, type NoteColor } from '../../domain/types'
import { cx } from '../../utils/cx'
import styles from './ColorPicker.module.css'

interface ColorPickerProps {
  className?: string | undefined
  value: NoteColor
  onChange: (color: NoteColor) => void
}

export function ColorPicker({ className, value, onChange }: ColorPickerProps) {
  return (
    <div className={cx(styles.picker, className)} role="group" aria-label="Note color">
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
