import type { Ref } from 'react'
import { cx } from '../../utils/cx'
import styles from './TrashZone.module.css'

interface TrashZoneProps {
  ref: Ref<HTMLDivElement>
  isActive: boolean
}

export function TrashZone({ ref, isActive }: TrashZoneProps) {
  return (
    <div ref={ref} className={cx(styles.trash, isActive && styles.active)} aria-hidden="true">
      <svg className={styles.icon} viewBox="0 0 24 24" width="28" height="28">
        <path
          d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{isActive ? 'Release to delete' : 'Drop here to delete'}</span>
    </div>
  )
}
