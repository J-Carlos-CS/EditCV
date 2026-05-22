import { formatDateRange } from '../../../utils/yamlParser'
import MD from '../MD'

export default function EntryEducation({ entry }) {
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date)
  return (
    <div className="entry">
      <div className="entryHeader">
        <div className="entryLeft">
          <span className="entryTitle">{entry.institution}</span>
          {entry.area && (
            <span className="entrySubtitle">
              {entry.degree ? `${entry.degree} in ${entry.area}` : entry.area}
            </span>
          )}
          {entry.summary && <MD text={entry.summary} className="entrySummary" tag="p" />}
        </div>
        <div className="entryRight">
          {entry.location && <span className="entryLocation">{entry.location}</span>}
          {date && <span className="entryDate">{date}</span>}
        </div>
      </div>
      {entry.highlights && entry.highlights.length > 0 && (
        <ul className="bullets">
          {entry.highlights.map((h, i) => <li key={i}><MD text={h} /></li>)}
        </ul>
      )}
    </div>
  )
}
