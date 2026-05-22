export default function EntryPublication({ entry }) {
  const authors = (entry.authors || [])
    .map(a => String(a).replace(/\*/g, ''))
    .join(', ')

  return (
    <div className="entry">
      <div className="publicationRow">
        <span className="pubTitle">
          {entry.url
            ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.title}</a>
            : entry.title}
        </span>
        {entry.date && <span className="entryDate">{String(entry.date).substring(0, 4)}</span>}
      </div>
      {authors && <p className="pubAuthors">{authors}</p>}
      <p className="pubJournal">
        {entry.journal}
        {entry.doi && <span className="pubDoi"> · DOI: {entry.doi}</span>}
      </p>
      {entry.summary && <p className="entrySummary">{entry.summary}</p>}
    </div>
  )
}
