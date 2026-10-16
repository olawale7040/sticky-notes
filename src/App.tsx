import { NotesProvider } from './app/NotesProvider'
import { Board } from './components/Board/Board'
import styles from './App.module.css'

export function App() {
  return (
    <NotesProvider>
      <div className={styles.app}>
        <Board />
      </div>
    </NotesProvider>
  )
}
