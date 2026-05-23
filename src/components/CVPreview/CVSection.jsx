import { detectEntryType, formatSectionTitle } from '../../utils/yamlParser'
import EntryEducation from './sections/EntryEducation'
import EntryExperience from './sections/EntryExperience'
import EntryProject from './sections/EntryProject'
import EntryPublication from './sections/EntryPublication'
import EntrySkill from './sections/EntrySkill'
import EntryGeneric from './sections/EntryGeneric'

/** Renders a single CV entry by delegating to the correct entry component. */
function renderEntry(entry, index) {
  const type = detectEntryType(entry)
  switch (type) {
    case 'education':   return <EntryEducation   key={index} entry={entry} />
    case 'experience':  return <EntryExperience  key={index} entry={entry} />
    case 'project':     return <EntryProject     key={index} entry={entry} />
    case 'publication': return <EntryPublication key={index} entry={entry} />
    case 'skill':       return <EntrySkill       key={index} entry={entry} />
    default:            return <EntryGeneric      key={index} entry={entry} />
  }
}

/**
 * Returns true when every entry in the list is a plain bullet or numbered item.
 * These need to be wrapped in a <ul> container by the parent section.
 */
function allEntriesAreBulletType(entries) {
  return entries.every(entry => {
    const type = detectEntryType(entry)
    return type === 'bullet' || type === 'numbered'
  })
}

export default function CVSection({ title, entries }) {
  if (!entries || entries.length === 0) return null

  const sectionTitle = formatSectionTitle(title)
  const wrapInList = allEntriesAreBulletType(entries)

  return (
    <section className="section">
      <h2 className="sectionTitle">{sectionTitle}</h2>
      {wrapInList ? (
        <ul className="genericList">
          {entries.map((entry, i) => renderEntry(entry, i))}
        </ul>
      ) : (
        entries.map((entry, i) => renderEntry(entry, i))
      )}
    </section>
  )
}
