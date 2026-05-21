import { formatDateRange } from '../../../utils/yamlParser'
import MD from '../MD'
import styles from '../CVPreview.module.css'

export default function EntryProject({ entry }) {
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date)
  return (
    <div className={styles.entry}>
      <div className={styles.entryHeader}>
        <div className={styles.entryLeft}>
          <MD text={entry.name} className={styles.entryTitle} />
          {entry.summary && <MD text={entry.summary} className={styles.entrySubtitle} />}
        </div>
        <div className={styles.entryRight}>
          {entry.location && <span className={styles.entryLocation}>{entry.location}</span>}
          {date && <span className={styles.entryDate}>{date}</span>}
        </div>
      </div>
      {entry.highlights && entry.highlights.length > 0 && (
        <ul className={styles.bullets}>
          {entry.highlights.map((h, i) => <li key={i}><MD text={h} /></li>)}
        </ul>
      )}
    </div>
  )
}
