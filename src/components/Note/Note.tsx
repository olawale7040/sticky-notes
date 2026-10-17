import { memo } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import type { Note as NoteModel } from '../../domain/note'
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
  const { rect, isInteracting, isOverTrash, startMove, startResize } = useNoteGestures(note)

  return (
    <article
      className={cx(
        styles.note,
        isInteracting && styles.interacting,
        isOverTrash && styles.overTrash,
      )}
      data-color={note.color}
      style={{ ...rectStyle(rect), zIndex: note.zIndex }}
      onPointerDown={() => dispatch({ type: 'note/broughtToFront', id: note.id })}
    >
      <header
        className={styles.header}
        onPointerDown={(e) => e.target === e.currentTarget && startMove(e)}
        title="Drag to move"
      >
        <ColorPicker
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
