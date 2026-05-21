import { formatDateRange } from '../../../utils/yamlParser'
import MD from '../MD'
import styles from '../CVPreview.module.css'

function renderHighlight(h, i) {
  if (typeof h === 'string') return <li key={i}><MD text={h} /></li>
  if (typeof h === 'object' && h !== null) {
    const text = Object.values(h)[0]
    if (Array.isArray(text)) {
      return (
        <li key={i}>
          <ul className={styles.subBullets}>
            {text.map((sub, j) => <li key={j}><MD text={sub} /></li>)}
          </ul>
        </li>
      )
    }
    return <li key={i}><MD text={String(text)} /></li>
  }
  return null
}

export default function EntryExperience({ entry }) {
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date)
  return (
    <div className={styles.entry}>
      <div className={styles.entryHeader}>
        <div className={styles.entryLeft}>
          <span className={styles.entryTitle}>{entry.company}</span>
          {entry.position && <span className={styles.entrySubtitle}>{entry.position}</span>}
          {entry.summary && <MD text={entry.summary} className={styles.entrySummary} tag="p" />}
        </div>
        <div className={styles.entryRight}>
          {entry.location && <span className={styles.entryLocation}>{entry.location}</span>}
          {date && <span className={styles.entryDate}>{date}</span>}
        </div>
      </div>
      {entry.highlights && entry.highlights.length > 0 && (
        <ul className={styles.bullets}>
          {entry.highlights.map((h, i) => renderHighlight(h, i))}
        </ul>
      )}
    </div>
  )
}
