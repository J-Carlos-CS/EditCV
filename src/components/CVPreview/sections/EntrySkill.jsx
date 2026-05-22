import MD from '../MD'

export default function EntrySkill({ entry }) {
  return (
    <div className="skillRow">
      <span className="skillLabel">{entry.label}:</span>
      <MD text={entry.details} className="skillDetails" />
    </div>
  )
}
