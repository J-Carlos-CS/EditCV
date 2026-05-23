import { formatDateRange } from '../../../utils/yamlParser'
import { useTemplate } from '../../../context/TemplateContext'
import { TEMPLATES } from '../../../templates/index'
import MD from '../MD'

export default function EntryEducation({ entry }) {
  const { template } = useTemplate()
  const { dateFormat } = TEMPLATES[template]
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date, dateFormat)
  return (
    <div className="entry">
      <div className="entryHeader">
        <div className="entryLeft">
          <div className="entryTitleRow">
            {entry.degree && <span className="entryDegree">{entry.degree}</span>}
            <span className="entryTitle">{entry.institution}</span>
            {entry.area && <span className="entryArea">{entry.area}</span>}
            {entry.location && <span className="entryLocationInline">{entry.location}</span>}
          </div>
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
