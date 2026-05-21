import MD from '../MD'
import styles from '../CVPreview.module.css'

export default function EntryGeneric({ entry }) {
  if (typeof entry === 'string') {
    return <MD text={entry} className={styles.genericText} tag="p" />
  }
  if (entry.bullet) {
    return <li className={styles.genericBullet}><MD text={entry.bullet} /></li>
  }
  if (entry.reversed_number) {
    return <li className={styles.genericBullet}><MD text={entry.reversed_number} /></li>
  }
  if (entry.number) {
    return <li className={styles.genericBullet}><MD text={entry.number} /></li>
  }
  return null
}
