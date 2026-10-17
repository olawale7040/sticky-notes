import { memo } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import type { Note as NoteModel } from '../../domain/types'
import { cx } from '../../utils/cx'
import { rectStyle } from '../../utils/rectStyle'
import { ColorPicker } from './ColorPicker'
import styles from './Note.module.css'
import { useNoteGestures } from './useNoteGestures'

interface NoteProps {
  note: NoteModel
}

export const Note = memo(function Note({ note }: NoteProps) {
  const dispatch = useNotesDispatch()
  const { rect, isInteracting, isOverTrash, startMove, startResize, handleKeyDown } =
    useNoteGestures(note)
  const bringToFront = () => dispatch({ type: 'note/broughtToFront', id: note.id })

  return (
    <article
      className={cx(
        styles.note,
        isInteracting && styles.interacting,
        isOverTrash && styles.overTrash,
      )}
      data-color={note.color}
      style={{ ...rectStyle(rect), zIndex: note.zIndex }}
      onPointerDown={bringToFront}
      onFocus={bringToFront}
    >
      <header className={styles.header}>
        <div
          className={styles.grip}
          role="button"
          tabIndex={0}
          aria-label="Move note"
          title="Drag to move. Arrow keys move, Shift+arrows resize, Delete removes."
          onPointerDown={startMove}
          onKeyDown={handleKeyDown}
        />
        <ColorPicker
          className={styles.colors}
          value={note.color}
          onChange={(color) => dispatch({ type: 'note/colorChanged', id: note.id, color })}
        />
      </header>
      <textarea
        className={styles.text}
        value={note.text}
        placeholder="Write something…"
        aria-label="Note text"
        onChange={(e) => dispatch({ type: 'note/textChanged', id: note.id, text: e.target.value })}
      />
      <div className={styles.resizeHandle} onPointerDown={startResize} title="Drag to resize" />
    </article>
  )
})
