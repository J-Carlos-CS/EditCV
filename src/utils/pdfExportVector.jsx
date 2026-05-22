import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { detectEntryType, formatDateRange } from './yamlParser'

// 1pt CSS ≈ 1pt PDF. Page padding matches global.css: 38px top/bottom, 58px sides
const S = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    lineHeight: 1.35,
    paddingVertical: 38,
    paddingHorizontal: 58,
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // ── Header ──────────────────────────────────────────────────
  header: { textAlign: 'center', marginBottom: 4 },
  name: { fontFamily: 'Times-Bold', fontSize: 18, marginBottom: 2 },
  headline: { fontSize: 9.5, marginBottom: 2 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', fontSize: 9, color: '#111' },
  contactSep: { color: '#555' },

  // ── Section ─────────────────────────────────────────────────
  section: { marginTop: 5 },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#000' },
  sectionTitle: { fontFamily: 'Times-Bold', fontSize: 10, marginHorizontal: 6 },

  // ── Entry ───────────────────────────────────────────────────
  entry: { marginBottom: 3 },
  entryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  entryLeft: { flex: 1, flexDirection: 'column' },
  entryRight: { flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 },
  entryTitle: { fontFamily: 'Times-Bold', fontSize: 10 },
  entrySubtitle: { fontFamily: 'Times-Italic', fontSize: 9.5, color: '#111' },
  entryLocation: { fontSize: 9.5, color: '#111' },
  entryDate: { fontSize: 9.5, color: '#111' },
  entrySummary: { fontSize: 9.5, color: '#111', marginTop: 1 },

  // ── Bullets ─────────────────────────────────────────────────
  bulletItem: { flexDirection: 'row', marginTop: 1 },
  bulletDot: { width: 13, fontSize: 9.5 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.3 },

  // ── Skills ──────────────────────────────────────────────────
  skillRow: { flexDirection: 'row', fontSize: 9.5, marginBottom: 1 },
  skillLabel: { fontFamily: 'Times-Bold', marginRight: 3 },
  skillValue: { flex: 1, color: '#111' },

  // ── Publications ────────────────────────────────────────────
  pubEntry: { marginBottom: 3 },
  pubTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pubTitle: { fontFamily: 'Times-Bold', fontSize: 9.5, flex: 1 },
  pubYear: { fontSize: 9.5, color: '#111', flexShrink: 0 },
  pubAuthors: { fontFamily: 'Times-Italic', fontSize: 9, color: '#111', marginTop: 1 },
  pubJournal: { fontSize: 9, color: '#333', marginTop: 1, marginBottom: 2 },
})

// ── Markdown-aware text ───────────────────────────────────────
// Parses **bold**, *italic*, plain text into inline PDF Text nodes
function MDText({ text, style }) {
  if (!text) return null
  const str = String(text)

  // Split into segments: bold, italic, or plain
  const segments = []
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\([^)]+\))/g
  let last = 0
  let m

  while ((m = re.exec(str)) !== null) {
    if (m.index > last) segments.push({ text: str.slice(last, m.index), bold: false, italic: false })
    if (m[0].startsWith('**')) segments.push({ text: m[2], bold: true, italic: false })
    else if (m[0].startsWith('*')) segments.push({ text: m[3], bold: false, italic: true })
    else segments.push({ text: m[4], bold: false, italic: false }) // link → just text
    last = m.index + m[0].length
  }
  if (last < str.length) segments.push({ text: str.slice(last), bold: false, italic: false })

  if (segments.length === 1 && !segments[0].bold && !segments[0].italic) {
    return <Text style={style}>{segments[0].text}</Text>
  }

  return (
    <Text style={style}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            fontFamily: seg.bold ? 'Times-Bold' : seg.italic ? 'Times-Italic' : 'Times-Roman',
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  )
}

// ── Shared sub-components ─────────────────────────────────────

function SectionTitle({ title }) {
  return (
    <View style={S.sectionTitleWrap}>
      <View style={S.sectionLine} />
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionLine} />
    </View>
  )
}

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <View>
      {items.map((h, i) => {
        const text = typeof h === 'string' ? h : (h && typeof h === 'object' ? Object.values(h)[0] : '')
        return (
          <View key={i} style={S.bulletItem}>
            <Text style={S.bulletDot}>•</Text>
            <MDText style={S.bulletText} text={String(text)} />
          </View>
        )
      })}
    </View>
  )
}

function EntryMeta({ left, right }) {
  return (
    <View style={S.entryRow}>
      <View style={S.entryLeft}>{left}</View>
      <View style={S.entryRight}>{right}</View>
    </View>
  )
}

// ── Entry types ───────────────────────────────────────────────

function Education({ e }) {
  const date = formatDateRange(e.start_date, e.end_date, e.date)
  return (
    <View style={S.entry}>
      <EntryMeta
        left={<>
          <Text style={S.entryTitle}>{e.institution}</Text>
          {e.area && <Text style={S.entrySubtitle}>{e.degree ? `${e.degree} in ${e.area}` : e.area}</Text>}
          {e.summary && <MDText style={S.entrySummary} text={e.summary} />}
        </>}
        right={<>
          {e.location && <Text style={S.entryLocation}>{e.location}</Text>}
          {date && <Text style={S.entryDate}>{date}</Text>}
        </>}
      />
      <BulletList items={e.highlights} />
    </View>
  )
}

function Experience({ e }) {
  const date = formatDateRange(e.start_date, e.end_date, e.date)
  return (
    <View style={S.entry}>
      <EntryMeta
        left={<>
          <Text style={S.entryTitle}>{e.company}</Text>
          {e.position && <Text style={S.entrySubtitle}>{e.position}</Text>}
          {e.summary && <MDText style={S.entrySummary} text={e.summary} />}
        </>}
        right={<>
          {e.location && <Text style={S.entryLocation}>{e.location}</Text>}
          {date && <Text style={S.entryDate}>{date}</Text>}
        </>}
      />
      <BulletList items={e.highlights} />
    </View>
  )
}

function Project({ e }) {
  const date = formatDateRange(e.start_date, e.end_date, e.date)
  return (
    <View style={S.entry}>
      <EntryMeta
        left={<>
          <MDText style={S.entryTitle} text={e.name} />
          {e.summary && <MDText style={S.entrySubtitle} text={e.summary} />}
        </>}
        right={<>
          {e.location && <Text style={S.entryLocation}>{e.location}</Text>}
          {date && <Text style={S.entryDate}>{date}</Text>}
        </>}
      />
      <BulletList items={e.highlights} />
    </View>
  )
}

function Publication({ e }) {
  const authors = (e.authors || []).map(a => String(a).replace(/\*/g, '')).join(', ')
  const year = e.date ? String(e.date).substring(0, 4) : ''
  return (
    <View style={S.pubEntry}>
      <View style={S.pubTopRow}>
        <Text style={S.pubTitle}>{e.title}</Text>
        {year && <Text style={S.pubYear}>{year}</Text>}
      </View>
      {authors ? <Text style={S.pubAuthors}>{authors}</Text> : null}
      <Text style={S.pubJournal}>{e.journal}{e.doi ? ` · DOI: ${e.doi}` : ''}</Text>
    </View>
  )
}

function Skill({ e }) {
  return (
    <View style={S.skillRow}>
      <Text style={S.skillLabel}>{e.label}: </Text>
      <MDText style={S.skillValue} text={e.details} />
    </View>
  )
}

function Generic({ e }) {
  const text = typeof e === 'string' ? e : (e.bullet || e.reversed_number || e.number || null)
  if (!text) return null
  if (typeof e === 'string') return <MDText style={{ fontSize: 9.5, color: '#111', marginBottom: 3 }} text={e} />
  return (
    <View style={S.bulletItem}>
      <Text style={S.bulletDot}>•</Text>
      <MDText style={S.bulletText} text={text} />
    </View>
  )
}

function Entry({ entry }) {
  const type = detectEntryType(entry)
  switch (type) {
    case 'education':    return <Education e={entry} />
    case 'experience':   return <Experience e={entry} />
    case 'project':      return <Project e={entry} />
    case 'publication':  return <Publication e={entry} />
    case 'skill':        return <Skill e={entry} />
    default:             return <Generic e={entry} />
  }
}

function CVSection({ title, entries }) {
  if (!entries?.length) return null
  return (
    <View style={S.section}>
      <SectionTitle title={title} />
      {entries.map((e, i) => <Entry key={i} entry={e} />)}
    </View>
  )
}

function CVHeader({ cv }) {
  const socials = cv.social_networks || []
  const customs = cv.custom_connections || []
  const items = [
    cv.location, cv.email, cv.phone, cv.website,
    ...socials.map(s => s.username || null),
    ...customs.filter(Boolean),
  ].filter(Boolean)

  return (
    <View style={S.header}>
      <Text style={S.name}>{cv.name}</Text>
      {cv.headline ? <Text style={S.headline}>{cv.headline}</Text> : null}
      {items.length > 0 && (
        <View style={S.contactRow}>
          {items.map((item, i) => (
            <Text key={i}>
              {i > 0 ? <Text style={S.contactSep}> • </Text> : null}
              {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

function CVDoc({ cv }) {
  const sections = cv.sections || {}
  return (
    <Document>
      <Page size="LETTER" style={S.page} wrap>
        <CVHeader cv={cv} />
        {Object.entries(sections).map(([title, entries]) => (
          <CVSection key={title} title={title} entries={Array.isArray(entries) ? entries : []} />
        ))}
      </Page>
    </Document>
  )
}

export async function exportToPDF(cvData, filename = 'cv.pdf') {
  const blob = await pdf(<CVDoc cv={cvData} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
