import MD from '../MD'
import styles from '../CVPreview.module.css'

export default function EntrySkill({ entry }) {
  return (
    <div className={styles.skillRow}>
      <span className={styles.skillLabel}>{entry.label}:</span>
      <MD text={entry.details} className={styles.skillDetails} />
    </div>
  )
}
