import MD from '../MD'

export default function EntryPublication({ entry }) {
  const authors = (entry.authors || []).map(a => String(a)).join(', ')
  const year = entry.date ? String(entry.date).substring(0, 7).replace('-', ' ') : null

  return (
    <div className="entry">
      <div className="publicationRow">
        <span className="pubTitle">
          {entry.url
            ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.title}</a>
            : entry.title}
        </span>
        {year && <span className="entryDate pubDate">{year}</span>}
      </div>
      {authors && <MD text={authors} className="pubAuthors" tag="p" />}
      {(entry.doi || entry.journal) && (
        <p className="pubJournal">
          {entry.doi && (
            <a className="pubDoi" href={`https://doi.org/${entry.doi}`} target="_blank" rel="noreferrer">
              {entry.doi}
            </a>
          )}
          {entry.doi && entry.journal && <span className="pubDoiSep"> </span>}
          {entry.journal && <span className="pubVenue">({entry.journal})</span>}
        </p>
      )}
      {entry.summary && <p className="entrySummary">{entry.summary}</p>}
    </div>
  )
}
