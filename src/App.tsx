import { NotesProvider } from './app/NotesProvider'
import { useNotesPersistence } from './app/useNotesPersistence'
import { Board } from './components/Board/Board'
import { SyncIndicator } from './components/SyncIndicator/SyncIndicator'
import { createMockFetch } from './persistence/mockFetch'
import { createRestRepository } from './persistence/restRepository'
import styles from './App.module.css'

const repository = createRestRepository('/api', createMockFetch())

function Workspace() {
  const status = useNotesPersistence(repository)

  if (status === 'loading') return <p className={styles.message}>Loading notes…</p>
  if (status === 'loadFailed') {
    return <p className={styles.message}>Couldn't load your notes. Refresh to try again.</p>
  }

  return (
    <>
      <Board />
      <SyncIndicator status={status} />
    </>
  )
}

export function App() {
  return (
    <NotesProvider>
      <div className={styles.app}>
        <Workspace />
      </div>
    </NotesProvider>
  )
}
