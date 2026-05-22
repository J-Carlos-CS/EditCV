import MD from '../MD'

export default function EntryGeneric({ entry }) {
  if (typeof entry === 'string') {
    return <MD text={entry} className="genericText" tag="p" />
  }
  if (entry.bullet) {
    return <li className="genericBullet"><MD text={entry.bullet} /></li>
  }
  if (entry.reversed_number) {
    return <li className="genericBullet"><MD text={entry.reversed_number} /></li>
  }
  if (entry.number) {
    return <li className="genericBullet"><MD text={entry.number} /></li>
  }
  return null
}
