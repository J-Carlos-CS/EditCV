import styles from '../CVPreview.module.css'

export default function EntryPublication({ entry }) {
  const authors = (entry.authors || [])
    .map(a => String(a).replace(/\*/g, ''))
    .join(', ')

  return (
    <div className={styles.entry}>
      <div className={styles.publicationRow}>
        <span className={styles.pubTitle}>
          {entry.url
            ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.title}</a>
            : entry.title}
        </span>
        {entry.date && <span className={styles.entryDate}>{String(entry.date).substring(0, 4)}</span>}
      </div>
      {authors && <p className={styles.pubAuthors}>{authors}</p>}
      <p className={styles.pubJournal}>
        {entry.journal}
        {entry.doi && <span className={styles.pubDoi}> · DOI: {entry.doi}</span>}
      </p>
      {entry.summary && <p className={styles.entrySummary}>{entry.summary}</p>}
    </div>
  )
}
