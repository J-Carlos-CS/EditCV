import { detectEntryType } from '../../utils/yamlParser'
import EntryEducation from './sections/EntryEducation'
import EntryExperience from './sections/EntryExperience'
import EntryProject from './sections/EntryProject'
import EntryPublication from './sections/EntryPublication'
import EntrySkill from './sections/EntrySkill'
import EntryGeneric from './sections/EntryGeneric'

function renderEntry(entry, index) {
  const type = detectEntryType(entry)
  switch (type) {
    case 'education': return <EntryEducation key={index} entry={entry} />
    case 'experience': return <EntryExperience key={index} entry={entry} />
    case 'project': return <EntryProject key={index} entry={entry} />
    case 'publication': return <EntryPublication key={index} entry={entry} />
    case 'skill': return <EntrySkill key={index} entry={entry} />
    default: return <EntryGeneric key={index} entry={entry} />
  }
}

function hasBulletType(entries) {
  return entries.every(e => {
    const t = detectEntryType(e)
    return t === 'bullet' || t === 'numbered' || t === 'text'
  })
}

export default function CVSection({ title, entries }) {
  if (!entries || entries.length === 0) return null

  const wrapInList = hasBulletType(entries)

  return (
    <section className="section">
      <h2 className="sectionTitle">{title}</h2>
      {wrapInList ? (
        <ul className="genericList">
          {entries.map((e, i) => renderEntry(e, i))}
        </ul>
      ) : (
        entries.map((e, i) => renderEntry(e, i))
      )}
    </section>
  )
}
