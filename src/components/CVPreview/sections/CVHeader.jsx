import styles from '../CVPreview.module.css'

export default function CVHeader({ cv }) {
  const socials = cv.social_networks || []
  const customs = cv.custom_connections || []

  const contactItems = [
    cv.location,
    cv.email,
    cv.phone,
    cv.website,
    ...socials.map(s => s.username ? `${s.username}` : null),
    ...customs.filter(Boolean),
  ].filter(Boolean)

  return (
    <header className={styles.cvHeader}>
      <h1 className={styles.cvName}>{cv.name}</h1>
      {cv.headline && <p className={styles.cvHeadline}>{cv.headline}</p>}
      {contactItems.length > 0 && (
        <p className={styles.cvContact}>
          {contactItems.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className={styles.contactSep}> • </span>}
              {item}
            </span>
          ))}
        </p>
      )}
    </header>
  )
}
