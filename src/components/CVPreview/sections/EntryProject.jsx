import { formatDateRange } from '../../../utils/yamlParser'
import { useTemplate } from '../../../context/TemplateContext'
import { TEMPLATES } from '../../../templates/index'
import MD from '../MD'

export default function EntryProject({ entry }) {
  const { template } = useTemplate()
  const { dateFormat } = TEMPLATES[template]
  const date = formatDateRange(entry.start_date, entry.end_date, entry.date, dateFormat)

  return (
    <div className="entry">
      <div className="entryHeader">
        <div className="entryLeft">
          {/*
           * The project name can contain a markdown link, e.g. [BoliviaNLP](https://…)
           * MD handles the rendering; the fallback entry.url field is also supported.
           */}
          <span className="entryTitle">
            {entry.url && !entry.name?.includes('](')
              ? <a href={entry.url} target="_blank" rel="noreferrer">{entry.name}</a>
              : <MD text={entry.name} />
            }
          </span>
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
