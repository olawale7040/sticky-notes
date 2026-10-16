import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useNotesDispatch, useNotesState } from '../../app/notesContext'
import { clampPosition, containsPoint, type Point } from '../../domain/geometry'
import { createNoteId, DEFAULT_NOTE_SIZE } from '../../domain/note'
import { Note } from '../Note/Note'
import { TrashZone } from '../TrashZone/TrashZone'
import { BoardContext, type BoardApi } from './boardContext'
import styles from './Board.module.css'

export function Board() {
  const { notes } = useNotesState()
  const dispatch = useNotesDispatch()
  const boardRef = useRef<HTMLDivElement>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const [isTrashActive, setTrashActive] = useState(false)

  const boardApi = useMemo<BoardApi>(
    () => ({
      getBounds: () => ({
        width: boardRef.current?.clientWidth ?? 0,
        height: boardRef.current?.clientHeight ?? 0,
      }),
      isOverTrash: (client) => {
        const trash = trashRef.current?.getBoundingClientRect()
        return trash !== undefined && containsPoint(trash, client)
      },
      setTrashActive,
    }),
    [],
  )

  const toBoardPoint = (client: Point): Point => {
    const origin = boardRef.current?.getBoundingClientRect()
    return { x: client.x - (origin?.left ?? 0), y: client.y - (origin?.top ?? 0) }
  }

  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    const center = toBoardPoint({ x: event.clientX, y: event.clientY })
    const rect = {
      ...DEFAULT_NOTE_SIZE,
      x: center.x - DEFAULT_NOTE_SIZE.width / 2,
      y: center.y - DEFAULT_NOTE_SIZE.height / 2,
    }
    dispatch({
      type: 'note/created',
      id: createNoteId(),
      rect: clampPosition(rect, boardApi.getBounds()),
      color: 'yellow',
    })
  }

  return (
    <BoardContext value={boardApi}>
      <div ref={boardRef} className={styles.board} onDoubleClick={handleDoubleClick}>
        {notes.map((note) => (
          <Note key={note.id} note={note} />
        ))}
        <TrashZone ref={trashRef} isActive={isTrashActive} />
      </div>
    </BoardContext>
  )
}
