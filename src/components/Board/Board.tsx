import { useMemo } from 'react'
import { useNotesState } from '../../app/notesContext'
import { rectStyle } from '../../utils/rectStyle'
import { Note } from '../Note/Note'
import { TrashZone } from '../TrashZone/TrashZone'
import { BoardContext } from './boardContext'
import { useBoardApi } from './useBoardApi'
import { useFitNotesToBoard } from './useFitNotesToBoard'
import { useNoteCreation } from './useNoteCreation'
import styles from './Board.module.css'

export function Board() {
  const { notes } = useNotesState()
  const { boardRef, trashRef, isTrashActive, boardApi } = useBoardApi()
  const { draft, handlePointerDown, handleDoubleClick } = useNoteCreation(boardApi)
  useFitNotesToBoard(boardRef, boardApi)

  const noteElements = useMemo(
    () => notes.map((note) => <Note key={note.id} note={note} />),
    [notes],
  )

  return (
    <BoardContext value={boardApi}>
      <main
        ref={boardRef}
        className={styles.board}
        aria-label="Notes board"
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
      >
        <p className={styles.hint}>
          Drag on the board to create a note, or double-click for a default one
        </p>
        {noteElements}
        {draft && <div className={styles.draft} style={rectStyle(draft)} />}
        <TrashZone ref={trashRef} isActive={isTrashActive} />
      </main>
    </BoardContext>
  )
}
