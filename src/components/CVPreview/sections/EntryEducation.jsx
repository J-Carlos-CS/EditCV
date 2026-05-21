import { formatDateRange } from '../../../utils/yamlParser'
import MD from '../MD'
import styles from '../CVPreview.module.css'

export default function EntryEducation({ entry }) {
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date)
  return (
    <div className={styles.entry}>
      <div className={styles.entryHeader}>
        <div className={styles.entryLeft}>
          <span className={styles.entryTitle}>{entry.institution}</span>
          {entry.area && (
            <span className={styles.entrySubtitle}>
              {entry.degree ? `${entry.degree} in ${entry.area}` : entry.area}
            </span>
          )}
          {entry.summary && <MD text={entry.summary} className={styles.entrySummary} tag="p" />}
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
