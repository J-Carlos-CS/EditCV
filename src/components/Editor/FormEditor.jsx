import { useState, useEffect, useRef } from 'react'
import yaml from 'js-yaml'
import { formatSectionTitle } from '../../utils/yamlParser'
import './FormEditor.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Detects the entry type for a given section so the right form fields are shown.
 * Checks section name first (fast path), then inspects the first entry's fields.
 */
function detectSectionEntryType(sectionName, entries = []) {
  const knownTypes = {
    education:       'education',
    experience:      'experience',
    projects:        'project',
    publications:    'publication',
    skills:          'skill',
    selected_honors: 'honor',
    summary:         'summary',
  }
  if (knownTypes[sectionName]) return knownTypes[sectionName]

  const firstEntry = entries[0]
  if (!firstEntry) return 'honor'
  if (typeof firstEntry === 'string') return 'summary'
  if (firstEntry.institution) return 'education'
  if (firstEntry.company) return 'experience'
  if (firstEntry.title && firstEntry.authors) return 'publication'
  if (firstEntry.name) return 'project'
  if (firstEntry.label) return 'skill'
  if ('summary' in firstEntry && !('bullet' in firstEntry)) return 'summary'
  return 'honor'
}

/** Returns a blank entry object for the given type, used when the user adds a new row. */
function createBlankEntry(type) {
  switch (type) {
    case 'education':   return { institution: '', area: '', degree: 'BS', start_date: '', end_date: '', location: '', highlights: [] }
    case 'experience':  return { company: '', position: '', start_date: '', end_date: 'present', location: '', highlights: [] }
    case 'project':     return { name: '', start_date: '', end_date: '', summary: '', highlights: [] }
    case 'publication': return { title: '', authors: [], doi: '', journal: '', date: '' }
    case 'skill':       return { label: '', details: '' }
    case 'summary':     return { summary: '' }
    default:            return { bullet: '' }
  }
}

/** Serializes the CV data object to a YAML string. */
function serializeCvToYaml(cvData) {
  return yaml.dump({ cv: cvData }, { lineWidth: 120, noRefs: true })
}

// ── Reusable form primitives ──────────────────────────────────────────────────

function TextField({ label, value, onChange, placeholder, monospace }) {
  return (
    <div className="ff-field">
      <label className="ff-label">{label}</label>
      <input
        className={`ff-input${monospace ? ' ff-mono' : ''}`}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="ff-field">
      <label className="ff-label">{label}</label>
      <textarea
        className="ff-textarea"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  )
}

function DateRangeField({ startDate, endDate, onStartChange, onEndChange }) {
  const isPresent = endDate === 'present'
  return (
    <div className="ff-daterange">
      <div className="ff-field">
        <label className="ff-label">Start</label>
        <input
          className="ff-input ff-mono"
          value={startDate ?? ''}
          onChange={e => onStartChange(e.target.value)}
          placeholder="YYYY-MM"
        />
      </div>
      <div className="ff-field">
        <label className="ff-label">End</label>
        <div className="ff-end-row">
          <input
            className="ff-input ff-mono"
            value={isPresent ? '' : (endDate ?? '')}
            onChange={e => onEndChange(e.target.value)}
            placeholder="YYYY-MM"
            disabled={isPresent}
          />
          <label className="ff-present-label">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={e => onEndChange(e.target.checked ? 'present' : '')}
            />
            <span>Present</span>
          </label>
        </div>
      </div>
    </div>
  )
}

/** An editable list of plain strings (used for highlights, authors, etc.). */
function StringListField({ label, items = [], onChange, placeholder }) {
  const list = Array.isArray(items) ? items : []

  const updateItem  = (index, value) => { const next = [...list]; next[index] = value; onChange(next) }
  const addItem     = ()             => onChange([...list, ''])
  const removeItem  = (index)        => onChange(list.filter((_, i) => i !== index))

  return (
    <div className="ff-field">
      <div className="ff-list-header">
        <label className="ff-label">{label}</label>
        <button className="ff-add-sm" onClick={addItem}>+ Add</button>
      </div>
      <div className="ff-list-items">
        {list.map((item, i) => (
          <div key={i} className="ff-list-row">
            <input
              className="ff-input"
              value={typeof item === 'string' ? item : ''}
              onChange={e => updateItem(i, e.target.value)}
              placeholder={placeholder}
            />
            <button className="ff-del-btn" onClick={() => removeItem(i)} title="Remove">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Entry form components (one per CV entry type) ─────────────────────────────

function EducationEntryForm({ entry, onChange }) {
  // Helper: returns a function that updates a single field on the entry object
  const updateField = field => value => onChange({ ...entry, [field]: value })
  return (
    <div className="ff-entry-fields">
      <TextField label="Institution"    value={entry.institution} onChange={updateField('institution')} placeholder="University Name" />
      <div className="ff-row2">
        <TextField label="Field of Study" value={entry.area}   onChange={updateField('area')}   placeholder="Computer Science" />
        <TextField label="Degree"         value={entry.degree} onChange={updateField('degree')} placeholder="BS / MS / PhD" />
      </div>
      <DateRangeField
        startDate={entry.start_date} endDate={entry.end_date}
        onStartChange={updateField('start_date')} onEndChange={updateField('end_date')}
      />
      <TextField label="Location" value={entry.location} onChange={updateField('location')} placeholder="City, Country" />
      <StringListField label="Highlights" items={entry.highlights} onChange={updateField('highlights')} placeholder="Achievement, award, GPA…" />
    </div>
  )
}

function ExperienceEntryForm({ entry, onChange }) {
  const updateField = field => value => onChange({ ...entry, [field]: value })
  return (
    <div className="ff-entry-fields">
      <div className="ff-row2">
        <TextField label="Company"  value={entry.company}  onChange={updateField('company')}  placeholder="Company Name" />
        <TextField label="Position" value={entry.position} onChange={updateField('position')} placeholder="Job Title" />
      </div>
      <DateRangeField
        startDate={entry.start_date} endDate={entry.end_date}
        onStartChange={updateField('start_date')} onEndChange={updateField('end_date')}
      />
      <TextField      label="Location" value={entry.location} onChange={updateField('location')} placeholder="City, Country (Remote)" />
      <TextAreaField  label="Summary"  value={entry.summary}  onChange={updateField('summary')}  placeholder="Brief description of role…" />
      <StringListField label="Highlights" items={entry.highlights} onChange={updateField('highlights')} placeholder="Key achievement or responsibility…" />
    </div>
  )
}

function ProjectEntryForm({ entry, onChange }) {
  const updateField = field => value => onChange({ ...entry, [field]: value })
  return (
    <div className="ff-entry-fields">
      <TextField
        label="Name (markdown supported)"
        value={entry.name}
        onChange={updateField('name')}
        placeholder="[Project Name](https://github.com/…)"
      />
      {/* Use a single date field when the entry only has a point-in-time date */}
      {entry.date && !entry.start_date ? (
        <TextField label="Date" value={entry.date} onChange={updateField('date')} placeholder="2023" monospace />
      ) : (
        <DateRangeField
          startDate={entry.start_date} endDate={entry.end_date}
          onStartChange={updateField('start_date')} onEndChange={updateField('end_date')}
        />
      )}
      <TextAreaField   label="Summary"    value={entry.summary}     onChange={updateField('summary')}     placeholder="Brief project description…" />
      <StringListField label="Highlights" items={entry.highlights}  onChange={updateField('highlights')}  placeholder="Key feature or achievement…" />
    </div>
  )
}

function PublicationEntryForm({ entry, onChange }) {
  const updateField = field => value => onChange({ ...entry, [field]: value })
  return (
    <div className="ff-entry-fields">
      <TextField label="Title" value={entry.title} onChange={updateField('title')} placeholder="Paper or article title" />
      <StringListField
        label="Authors"
        items={entry.authors}
        onChange={updateField('authors')}
        placeholder="*Your Name* or Co-author Name"
      />
      <div className="ff-row2">
        <TextField label="Journal / Conference" value={entry.journal} onChange={updateField('journal')} placeholder="ICML 2024" />
        <TextField label="Date"                 value={entry.date}    onChange={updateField('date')}    placeholder="YYYY-MM" monospace />
      </div>
      <div className="ff-row2">
        <TextField label="DOI" value={entry.doi} onChange={updateField('doi')} placeholder="10.xxxx/…" monospace />
        <TextField label="URL" value={entry.url} onChange={updateField('url')} placeholder="https://…" />
      </div>
    </div>
  )
}

function SkillEntryForm({ entry, onChange }) {
  const updateField = field => value => onChange({ ...entry, [field]: value })
  return (
    <div className="ff-entry-fields">
      <div className="ff-row2">
        <TextField label="Label"   value={entry.label}   onChange={updateField('label')}   placeholder="Languages" />
        <TextField label="Details" value={entry.details} onChange={updateField('details')} placeholder="Python, TypeScript, Go" />
      </div>
    </div>
  )
}

function HonorEntryForm({ entry, onChange }) {
  return (
    <div className="ff-entry-fields">
      <TextField
        label="Honor / Bullet"
        value={entry.bullet}
        onChange={value => onChange({ ...entry, bullet: value })}
        placeholder="Award name — Institution (Year)"
      />
    </div>
  )
}

function SummaryEntryForm({ entry, onChange }) {
  const isPlainString = typeof entry === 'string'
  const currentValue  = isPlainString ? entry : (entry.summary ?? entry.bullet ?? '')

  function handleChange(newValue) {
    if (isPlainString) { onChange(newValue); return }
    const updated = { ...entry, summary: newValue }
    delete updated.bullet
    onChange(updated)
  }

  return (
    <div className="ff-entry-fields">
      <TextAreaField
        label="Summary"
        value={currentValue}
        onChange={handleChange}
        placeholder="Write a summary or description…"
      />
    </div>
  )
}

// Maps entry type string → the matching form component
const ENTRY_FORM_BY_TYPE = {
  education:   EducationEntryForm,
  experience:  ExperienceEntryForm,
  project:     ProjectEntryForm,
  publication: PublicationEntryForm,
  skill:       SkillEntryForm,
  honor:       HonorEntryForm,
  summary:     SummaryEntryForm,
}

const SECTION_TYPE_OPTIONS = [
  { value: 'summary',     label: 'Summary / Text' },
  { value: 'education',   label: 'Education' },
  { value: 'experience',  label: 'Experience' },
  { value: 'project',     label: 'Projects' },
  { value: 'publication', label: 'Publications' },
  { value: 'skill',       label: 'Skills' },
  { value: 'honor',       label: 'Bullets / Honors' },
]

// ── Section Panel ─────────────────────────────────────────────────────────────

function SectionPanel({ name, entries = [], onChange, onDelete, onRename, onMoveUp, onMoveDown }) {
  const [isOpen, setIsOpen]         = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(name)
  const renameInputRef = useRef(null)

  const entryType     = detectSectionEntryType(name, entries)
  const EntryFormComp = ENTRY_FORM_BY_TYPE[entryType] || HonorEntryForm
  const displayTitle  = formatSectionTitle(name)
  // Used in the "+ Add X" button (strips trailing "s" from "Education" → "Educatio" is avoided by using the key)
  const singularTitle = displayTitle.replace(/s$/i, '')

  function updateEntryAt(index, newValue) {
    const updated = [...entries]
    updated[index] = newValue
    onChange(updated)
  }

  function addNewEntry()  { onChange([...entries, createBlankEntry(entryType)]) }
  function removeEntryAt(index) { onChange(entries.filter((_, i) => i !== index)) }

  function moveEntryUp(index) {
    if (index === 0) return
    const updated = [...entries]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  function moveEntryDown(index) {
    if (index === entries.length - 1) return
    const updated = [...entries]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  function startRenaming(e) {
    e.stopPropagation()
    setRenameValue(name)
    setIsRenaming(true)
    // Focus the input after React renders it
    setTimeout(() => renameInputRef.current?.select(), 0)
  }

  function commitRename() {
    const newKey = renameValue.trim().replace(/\s+/g, '_').toLowerCase()
    if (newKey && newKey !== name) onRename(newKey)
    setIsRenaming(false)
  }

  return (
    <div className="ff-section">
      <div className="ff-section-header-row">
        <button className="ff-section-header" onClick={() => !isRenaming && setIsOpen(open => !open)}>
          <span className="ff-chevron">{isOpen ? '▾' : '▸'}</span>
          {isRenaming ? (
            <input
              ref={renameInputRef}
              className="ff-rename-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter')  commitRename()
                if (e.key === 'Escape') setIsRenaming(false)
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="ff-section-name">{displayTitle}</span>
          )}
          <span className="ff-badge">{entries.length}</span>
        </button>
        <div className="ff-section-meta-actions">
          <button className="ff-act" onClick={e => { e.stopPropagation(); onMoveUp() }}   disabled={!onMoveUp}   title="Move up">↑</button>
          <button className="ff-act" onClick={e => { e.stopPropagation(); onMoveDown() }} disabled={!onMoveDown} title="Move down">↓</button>
          <button className="ff-act" onClick={startRenaming} title="Rename section">✎</button>
          <button className="ff-act ff-act-del" onClick={onDelete} title="Delete section">×</button>
        </div>
      </div>

      {isOpen && (
        <div className="ff-section-body">
          {entries.map((entry, i) => (
            <div key={i} className="ff-entry-card">
              <div className="ff-entry-toolbar">
                <span className="ff-entry-idx">#{i + 1}</span>
                <div className="ff-entry-actions">
                  <button className="ff-act" onClick={() => moveEntryUp(i)}   disabled={i === 0}                  title="Move up">↑</button>
                  <button className="ff-act" onClick={() => moveEntryDown(i)} disabled={i === entries.length - 1} title="Move down">↓</button>
                  <button className="ff-act ff-act-del" onClick={() => removeEntryAt(i)} title="Remove">×</button>
                </div>
              </div>
              <EntryFormComp entry={entry} onChange={val => updateEntryAt(i, val)} />
            </div>
          ))}
          <button className="ff-add-entry" onClick={addNewEntry}>
            + Add {singularTitle}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Add Section Modal ─────────────────────────────────────────────────────────

function AddSectionModal({ onAdd, onClose }) {
  const [sectionName, setSectionName] = useState('')
  const [entryType, setEntryType]     = useState('summary')
  const nameInputRef = useRef(null)

  useEffect(() => { nameInputRef.current?.focus() }, [])

  function handleConfirm() {
    const key = sectionName.trim().replace(/\s+/g, '_').toLowerCase()
    if (!key) return
    onAdd(key, entryType)
  }

  return (
    <div className="ff-modal-backdrop" onClick={onClose}>
      <div className="ff-modal" onClick={e => e.stopPropagation()}>
        <div className="ff-modal-header">
          <span className="ff-modal-title">New Section</span>
          <button className="ff-del-btn" onClick={onClose}>×</button>
        </div>
        <div className="ff-modal-body">
          <div className="ff-field">
            <label className="ff-label">Section Name</label>
            <input
              ref={nameInputRef}
              className="ff-input"
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder="e.g. Awards, Certifications, Volunteering"
              onKeyDown={e => {
                if (e.key === 'Enter')  handleConfirm()
                if (e.key === 'Escape') onClose()
              }}
            />
          </div>
          <div className="ff-field">
            <label className="ff-label">Entry Type</label>
            <div className="ff-type-grid">
              {SECTION_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={`ff-type-btn${entryType === option.value ? ' active' : ''}`}
                  onClick={() => setEntryType(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ff-modal-footer">
          <button className="ff-modal-cancel"  onClick={onClose}>Cancel</button>
          <button
            className="ff-modal-confirm"
            onClick={handleConfirm}
            disabled={!sectionName.trim()}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main FormEditor component ─────────────────────────────────────────────────

export default function FormEditor({ cvData, onYamlChange }) {
  const [formData, setFormData]         = useState(cvData || {})
  const [showAddSection, setShowAddSection] = useState(false)

  // skipSync prevents the external cvData prop from overwriting local changes
  // that were just triggered by this component itself (avoid loop: form → yaml → form)
  const skipNextSyncRef = useRef(false)

  useEffect(() => {
    if (skipNextSyncRef.current) { skipNextSyncRef.current = false; return }
    if (cvData) setFormData(cvData)
  }, [cvData])

  /** Applies a change to the CV data, regenerates YAML, and notifies the parent. */
  function applyUpdate(newData) {
    setFormData(newData)
    skipNextSyncRef.current = true
    try { onYamlChange(serializeCvToYaml(newData)) } catch { /* ignore serialization errors */ }
  }

  const setTopLevelField = (field, value) => applyUpdate({ ...formData, [field]: value })

  const setSectionEntries = (sectionName, entries) =>
    applyUpdate({ ...formData, sections: { ...(formData.sections || {}), [sectionName]: entries } })

  function deleteSection(sectionName) {
    const updatedSections = { ...(formData.sections || {}) }
    delete updatedSections[sectionName]
    applyUpdate({ ...formData, sections: updatedSections })
  }

  function renameSection(oldName, newName) {
    const sectionEntries = Object.entries(formData.sections || {})
    const renamedEntries = sectionEntries.map(([key, value]) => [key === oldName ? newName : key, value])
    applyUpdate({ ...formData, sections: Object.fromEntries(renamedEntries) })
  }

  function addSection(name, entryType) {
    const updatedSections = { ...(formData.sections || {}), [name]: [createBlankEntry(entryType)] }
    applyUpdate({ ...formData, sections: updatedSections })
    setShowAddSection(false)
  }

  function moveSectionByOffset(sectionName, offset) {
    const sectionEntries = Object.entries(formData.sections || {})
    const currentIndex   = sectionEntries.findIndex(([key]) => key === sectionName)
    const targetIndex    = currentIndex + offset
    if (targetIndex < 0 || targetIndex >= sectionEntries.length) return
    ;[sectionEntries[currentIndex], sectionEntries[targetIndex]] = [sectionEntries[targetIndex], sectionEntries[currentIndex]]
    applyUpdate({ ...formData, sections: Object.fromEntries(sectionEntries) })
  }

  const sections = formData.sections || {}

  return (
    <div className="ff-root">

      {/* ── Personal Info ────────────────────────────────────────────────── */}
      <div className="ff-group">
        <div className="ff-group-title">Personal Info</div>
        <TextField label="Full Name" value={formData.name}     onChange={v => setTopLevelField('name', v)}     placeholder="Your Name" />
        <TextField label="Headline"  value={formData.headline} onChange={v => setTopLevelField('headline', v)} placeholder="Software Engineer & Researcher" />
        <div className="ff-row2">
          <TextField label="Location" value={formData.location} onChange={v => setTopLevelField('location', v)} placeholder="City, Country" />
          <TextField label="Email"    value={formData.email}    onChange={v => setTopLevelField('email', v)}    placeholder="you@email.com" />
        </div>
        <div className="ff-row2">
          <TextField label="Phone"   value={formData.phone}   onChange={v => setTopLevelField('phone', v)}   placeholder="+1 555 000 0000" />
          <TextField label="Website" value={formData.website} onChange={v => setTopLevelField('website', v)} placeholder="https://yoursite.com" />
        </div>
      </div>

      {/* ── Social Networks ──────────────────────────────────────────────── */}
      <div className="ff-group">
        <div className="ff-group-title">Social Networks</div>
        {(formData.social_networks || []).map((network, i) => (
          <div key={i} className="ff-sn-row">
            <input
              className="ff-input ff-sn-network"
              value={network.network || ''}
              onChange={e => {
                const updated = [...(formData.social_networks || [])]
                updated[i] = { ...network, network: e.target.value }
                setTopLevelField('social_networks', updated)
              }}
              placeholder="LinkedIn"
            />
            <input
              className="ff-input"
              value={network.username || ''}
              onChange={e => {
                const updated = [...(formData.social_networks || [])]
                updated[i] = { ...network, username: e.target.value }
                setTopLevelField('social_networks', updated)
              }}
              placeholder="username"
            />
            <button
              className="ff-del-btn"
              onClick={() => setTopLevelField('social_networks', (formData.social_networks || []).filter((_, j) => j !== i))}
            >×</button>
          </div>
        ))}
        <button
          className="ff-add-entry"
          onClick={() => setTopLevelField('social_networks', [...(formData.social_networks || []), { network: '', username: '' }])}
        >
          + Add Network
        </button>
      </div>

      {/* ── CV Sections ──────────────────────────────────────────────────── */}
      <div className="ff-group">
        <div className="ff-group-title">Sections</div>
        {Object.entries(sections).map(([name, entries], i, allSections) => (
          <SectionPanel
            key={name}
            name={name}
            entries={entries || []}
            onChange={updatedEntries => setSectionEntries(name, updatedEntries)}
            onDelete={() => deleteSection(name)}
            onRename={newName => renameSection(name, newName)}
            onMoveUp={i > 0                       ? () => moveSectionByOffset(name, -1) : null}
            onMoveDown={i < allSections.length - 1 ? () => moveSectionByOffset(name, 1)  : null}
          />
        ))}
        <button className="ff-add-section-btn" onClick={() => setShowAddSection(true)}>
          + New Section
        </button>
      </div>

      {showAddSection && (
        <AddSectionModal onAdd={addSection} onClose={() => setShowAddSection(false)} />
      )}
    </div>
  )
}
