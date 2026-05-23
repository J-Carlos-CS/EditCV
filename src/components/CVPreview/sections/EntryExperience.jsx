import { formatDateRange } from '../../../utils/yamlParser'
import { useTemplate } from '../../../context/TemplateContext'
import { TEMPLATES } from '../../../templates/index'
import MD from '../MD'

function renderHighlight(h, i) {
  if (typeof h === 'string') return <li key={i}><MD text={h} /></li>
  if (typeof h === 'object' && h !== null) {
    const text = Object.values(h)[0]
    if (Array.isArray(text)) {
      return (
        <li key={i}>
          <ul className="subBullets">
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
  const { template } = useTemplate()
  const { dateFormat } = TEMPLATES[template]
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date, dateFormat)
  return (
    <div className="entry">
      <div className="entryHeader">
        <div className="entryLeft">
          <span className="entryTitle">{entry.company}</span>
          {entry.position && <span className="entrySubtitle">{entry.position}</span>}
          {entry.location && <span className="entryLocationInline">{entry.location}</span>}
          {entry.summary && <MD text={entry.summary} className="entrySummary" tag="p" />}
        </div>
        <div className="entryRight">
          {entry.location && <span className="entryLocation">{entry.location}</span>}
          {date && <span className="entryDate">{date}</span>}
        </div>
      </div>
      {entry.highlights && entry.highlights.length > 0 && (
        <ul className="bullets">
          {entry.highlights.map((h, i) => renderHighlight(h, i))}
        </ul>
      )}
    </div>
  )
}
