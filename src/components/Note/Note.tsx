import { memo } from 'react'
import { useNotesDispatch } from '../../app/notesContext'
import type { Note as NoteModel } from '../../domain/note'
import { cx } from '../../utils/cx'
import styles from './Note.module.css'
import { useNoteGestures } from './useNoteGestures'

interface NoteProps {
  note: NoteModel
}

export const Note = memo(function Note({ note }: NoteProps) {
  const dispatch = useNotesDispatch()
  const { rect, isDragging, isOverTrash, startMove, startResize } = useNoteGestures(note)

  return (
    <article
      className={cx(styles.note, isDragging && styles.dragging, isOverTrash && styles.overTrash)}
      data-color={note.color}
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.width,
        height: rect.height,
        zIndex: note.zIndex,
      }}
      onPointerDown={() => dispatch({ type: 'note/broughtToFront', id: note.id })}
    >
      <header className={styles.header} onPointerDown={startMove} title="Drag to move" />
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
