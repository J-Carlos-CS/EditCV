export default function CVHeader({ cv }) {
  const socials = cv.social_networks || []
  const customs = cv.custom_connections || []

  // Each item carries a `type` hint so CSS-only templates (like modern) can
  // prepend the right icon via ::before without needing extra markup.
  const contactItems = [
    cv.location && { text: cv.location,    type: 'location' },
    cv.email    && { text: cv.email,        type: 'email'    },
    cv.phone    && { text: cv.phone,        type: 'phone'    },
    cv.website  && { text: cv.website,      type: 'website'  },
    ...socials.map(s => s.username ? { text: s.username, type: 'social' } : null),
    ...customs.filter(Boolean).map(c => ({ text: c, type: 'custom' })),
  ].filter(Boolean)

  return (
    <header className="cvHeader">
      <h1 className="cvName">{cv.name}</h1>
      {cv.headline && <p className="cvHeadline">{cv.headline}</p>}
      {contactItems.length > 0 && (
        <p className="cvContact">
          {contactItems.map((item, i) => (
            // The separator must be a sibling BEFORE the icon span,
            // not a child inside it — otherwise ::before on the parent
            // renders the icon before the separator.
            <span key={i} className="cvContactItem">
              {i > 0 && <span className="contactSep" aria-hidden="true" />}
              <span data-contact-type={item.type}>{item.text}</span>
            </span>
          ))}
        </p>
      )}
    </header>
  )
}
