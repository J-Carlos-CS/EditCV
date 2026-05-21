import { forwardRef } from 'react'
import CVHeader from './sections/CVHeader'
import CVSection from './CVSection'
import styles from './CVPreview.module.css'

const CVPreview = forwardRef(function CVPreview({ cvData }, ref) {
  if (!cvData) {
    return (
      <div className={styles.previewWrapper}>
        <div className={styles.page}>
          <div className={styles.emptyState}>
            Escribe tu YAML en el editor para ver el preview
          </div>
        </div>
      </div>
    )
  }

  const sections = cvData.sections || {}

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.page} ref={ref}>
        <CVHeader cv={cvData} />
        {Object.entries(sections).map(([title, entries]) => (
          <CVSection key={title} title={title} entries={Array.isArray(entries) ? entries : []} />
        ))}
      </div>
    </div>
  )
})

export default CVPreview
