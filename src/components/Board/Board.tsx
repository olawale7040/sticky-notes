import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useNotesDispatch, useNotesState } from '../../app/notesContext'
import { containsPoint } from '../../domain/geometry'
import { createNoteId, DEFAULT_NOTE_SIZE, fitNoteRect } from '../../domain/note'
import type { Rect } from '../../domain/types'
import { rectStyle } from '../../utils/rectStyle'
import { Note } from '../Note/Note'
import { TrashZone } from '../TrashZone/TrashZone'
import { BoardContext, type BoardApi } from './boardContext'
import { useNoteDrawing } from './useNoteDrawing'
import styles from './Board.module.css'

export function Board() {
  const { notes } = useNotesState()
  const dispatch = useNotesDispatch()
  const boardRef = useRef<HTMLElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const [isTrashActive, setTrashActive] = useState(false)

  const boardApi = useMemo<BoardApi>(
    () => ({
      getBounds: () => ({
        width: boardRef.current?.clientWidth ?? 0,
        height: boardRef.current?.clientHeight ?? 0,
      }),
      toBoardPoint: (client) => {
        const origin = boardRef.current?.getBoundingClientRect()
        return { x: client.x - (origin?.left ?? 0), y: client.y - (origin?.top ?? 0) }
      },
      isOverTrash: (client) => {
        const trash = trashRef.current?.getBoundingClientRect()
        return trash !== undefined && containsPoint(trash, client)
      },
      setTrashActive,
    }),
    [],
  )

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const observer = new ResizeObserver(() => {
      const bounds = boardApi.getBounds()
      if (bounds.width > 0 && bounds.height > 0) dispatch({ type: 'notes/boundsChanged', bounds })
    })
    observer.observe(board)
    return () => observer.disconnect()
  }, [boardApi, dispatch])

  const createNote = (rect: Rect) => {
    dispatch({
      type: 'note/created',
      id: createNoteId(),
      rect: fitNoteRect(rect, boardApi.getBounds()),
      color: 'yellow',
    })
  }

  const { draft, startDrawing } = useNoteDrawing(boardApi, createNote)

  const noteElements = useMemo(
    () => notes.map((note) => <Note key={note.id} note={note} />),
    [notes],
  )

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    startDrawing(event)
  }

  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return
    const center = boardApi.toBoardPoint({ x: event.clientX, y: event.clientY })
    createNote({
      ...DEFAULT_NOTE_SIZE,
      x: center.x - DEFAULT_NOTE_SIZE.width / 2,
      y: center.y - DEFAULT_NOTE_SIZE.height / 2,
    })
  }

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
