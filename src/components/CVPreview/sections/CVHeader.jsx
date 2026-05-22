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
    <header className="cvHeader">
      <h1 className="cvName">{cv.name}</h1>
      {cv.headline && <p className="cvHeadline">{cv.headline}</p>}
      {contactItems.length > 0 && (
        <p className="cvContact">
          {contactItems.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="contactSep"> • </span>}
              {item}
            </span>
          ))}
        </p>
      )}
    </header>
  )
}
