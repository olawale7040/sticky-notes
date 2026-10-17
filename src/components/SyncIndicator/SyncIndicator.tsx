import type { SyncStatus } from '../../app/useNotesPersistence'
import { cx } from '../../utils/cx'
import styles from './SyncIndicator.module.css'

const LABELS: Record<Exclude<SyncStatus, 'loading' | 'loadFailed'>, string> = {
  saving: 'Saving…',
  saved: 'All changes saved',
  saveFailed: "Couldn't save changes",
}

interface SyncIndicatorProps {
  status: keyof typeof LABELS
}

export function SyncIndicator({ status }: SyncIndicatorProps) {
  return (
    <p className={cx(styles.indicator, status === 'saveFailed' && styles.error)} role="status">
      {LABELS[status]}
    </p>
  )
}
