import { useState, useEffect, useRef } from 'react'
import yaml from 'js-yaml'
import './FormEditor.css'

function toDisplayName(snakeKey) {
  return snakeKey.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ── Helpers ───────────────────────────────────────────────────
function getSectionType(name, entries = []) {
  const map = {
    education: 'education', experience: 'experience', projects: 'project',
    publications: 'publication', skills: 'skill', selected_honors: 'honor',
  }
  if (map[name]) return map[name]
  const first = entries[0]
  if (!first || typeof first !== 'object') return 'honor'
  if (first.institution) return 'education'
  if (first.company) return 'experience'
  if (first.title && first.authors) return 'publication'
  if (first.name) return 'project'
  if (first.label) return 'skill'
  return 'honor'
}

function newEntry(type) {
  switch (type) {
    case 'education':   return { institution: '', area: '', degree: 'BS', start_date: '', end_date: '', location: '', highlights: [] }
    case 'experience':  return { company: '', position: '', start_date: '', end_date: 'present', location: '', highlights: [] }
    case 'project':     return { name: '', start_date: '', end_date: '', summary: '', highlights: [] }
    case 'publication': return { title: '', authors: [], doi: '', journal: '', date: '' }
    case 'skill':       return { label: '', details: '' }
    default:            return { bullet: '' }
  }
}

function toYaml(data) {
  return yaml.dump({ cv: data }, { lineWidth: 120, noRefs: true })
}

// ── Reusable fields ───────────────────────────────────────────
function Field({ label, value, onChange, placeholder, monospace }) {
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

function TA({ label, value, onChange, placeholder }) {
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

function DateRange({ startDate, endDate, onStartChange, onEndChange }) {
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

function StringList({ label, items = [], onChange, placeholder }) {
  const list = Array.isArray(items) ? items : []
  const update = (i, v) => { const n = [...list]; n[i] = v; onChange(n) }
  const add    = ()    => onChange([...list, ''])
  const remove = (i)   => onChange(list.filter((_, j) => j !== i))
  return (
    <div className="ff-field">
      <div className="ff-list-header">
        <label className="ff-label">{label}</label>
        <button className="ff-add-sm" onClick={add}>+ Add</button>
      </div>
      <div className="ff-list-items">
        {list.map((item, i) => (
          <div key={i} className="ff-list-row">
            <input
              className="ff-input"
              value={typeof item === 'string' ? item : ''}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button className="ff-del-btn" onClick={() => remove(i)} title="Remove">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Entry components ──────────────────────────────────────────
function EducationEntry({ entry, onChange }) {
  const u = f => v => onChange({ ...entry, [f]: v })
  return (
    <div className="ff-entry-fields">
      <Field label="Institution" value={entry.institution} onChange={u('institution')} placeholder="University Name" />
      <div className="ff-row2">
        <Field label="Field of Study" value={entry.area} onChange={u('area')} placeholder="Computer Science" />
        <Field label="Degree" value={entry.degree} onChange={u('degree')} placeholder="BS / MS / PhD" />
      </div>
      <DateRange
        startDate={entry.start_date} endDate={entry.end_date}
        onStartChange={u('start_date')} onEndChange={u('end_date')}
      />
      <Field label="Location" value={entry.location} onChange={u('location')} placeholder="City, Country" />
      <StringList label="Highlights" items={entry.highlights} onChange={u('highlights')} placeholder="Achievement, award, GPA…" />
    </div>
  )
}

function ExperienceEntry({ entry, onChange }) {
  const u = f => v => onChange({ ...entry, [f]: v })
  return (
    <div className="ff-entry-fields">
      <div className="ff-row2">
        <Field label="Company" value={entry.company} onChange={u('company')} placeholder="Company Name" />
        <Field label="Position" value={entry.position} onChange={u('position')} placeholder="Job Title" />
      </div>
      <DateRange
        startDate={entry.start_date} endDate={entry.end_date}
        onStartChange={u('start_date')} onEndChange={u('end_date')}
      />
      <Field label="Location" value={entry.location} onChange={u('location')} placeholder="City, Country (Remote)" />
      <TA label="Summary" value={entry.summary} onChange={u('summary')} placeholder="Brief description of role…" />
      <StringList label="Highlights" items={entry.highlights} onChange={u('highlights')} placeholder="Key achievement or responsibility…" />
    </div>
  )
}

function ProjectEntry({ entry, onChange }) {
  const u = f => v => onChange({ ...entry, [f]: v })
  return (
    <div className="ff-entry-fields">
      <Field
        label="Name (markdown supported)"
        value={entry.name}
        onChange={u('name')}
        placeholder="[Project Name](https://github.com/…)"
      />
      {entry.date && !entry.start_date ? (
        <Field label="Date" value={entry.date} onChange={u('date')} placeholder="2023" monospace />
      ) : (
        <DateRange
          startDate={entry.start_date} endDate={entry.end_date}
          onStartChange={u('start_date')} onEndChange={u('end_date')}
        />
      )}
      <TA label="Summary" value={entry.summary} onChange={u('summary')} placeholder="Brief project description…" />
      <StringList label="Highlights" items={entry.highlights} onChange={u('highlights')} placeholder="Key feature or achievement…" />
    </div>
  )
}

function PublicationEntry({ entry, onChange }) {
  const u = f => v => onChange({ ...entry, [f]: v })
  return (
    <div className="ff-entry-fields">
      <Field label="Title" value={entry.title} onChange={u('title')} placeholder="Paper or article title" />
      <StringList
        label="Authors"
        items={entry.authors}
        onChange={u('authors')}
        placeholder="*Your Name* or Co-author Name"
      />
      <div className="ff-row2">
        <Field label="Journal / Conference" value={entry.journal} onChange={u('journal')} placeholder="ICML 2024" />
        <Field label="Date" value={entry.date} onChange={u('date')} placeholder="YYYY-MM" monospace />
      </div>
      <div className="ff-row2">
        <Field label="DOI" value={entry.doi} onChange={u('doi')} placeholder="10.xxxx/…" monospace />
        <Field label="URL" value={entry.url} onChange={u('url')} placeholder="https://…" />
      </div>
    </div>
  )
}

function SkillEntry({ entry, onChange }) {
  const u = f => v => onChange({ ...entry, [f]: v })
  return (
    <div className="ff-entry-fields">
      <div className="ff-row2">
        <Field label="Label" value={entry.label} onChange={u('label')} placeholder="Languages" />
        <Field label="Details" value={entry.details} onChange={u('details')} placeholder="Python, TypeScript, Go" />
      </div>
    </div>
  )
}

function HonorEntry({ entry, onChange }) {
  return (
    <div className="ff-entry-fields">
      <Field
        label="Honor / Bullet"
        value={entry.bullet}
        onChange={v => onChange({ ...entry, bullet: v })}
        placeholder="Award name — Institution (Year)"
      />
    </div>
  )
}

const ENTRY_COMPONENTS = {
  education: EducationEntry,
  experience: ExperienceEntry,
  project: ProjectEntry,
  publication: PublicationEntry,
  skill: SkillEntry,
  honor: HonorEntry,
}

const SECTION_TYPE_OPTIONS = [
  { value: 'education',   label: 'Education' },
  { value: 'experience',  label: 'Experience' },
  { value: 'project',     label: 'Projects' },
  { value: 'publication', label: 'Publications' },
  { value: 'skill',       label: 'Skills' },
  { value: 'honor',       label: 'Bullets / Honors' },
]

// ── Section Panel ─────────────────────────────────────────────
function SectionPanel({ name, entries = [], onChange, onDelete, onRename, onMoveUp, onMoveDown }) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameVal, setRenameVal] = useState(name)
  const type = getSectionType(name, entries)
  const EntryComp = ENTRY_COMPONENTS[type] || HonorEntry
  const displayName = toDisplayName(name)
  const singular = displayName.replace(/s$/i, '')
  const renameRef = useRef(null)

  function updateEntry(i, val) { const n = [...entries]; n[i] = val; onChange(n) }
  function addEntry()          { onChange([...entries, newEntry(type)]) }
  function removeEntry(i)      { onChange(entries.filter((_, j) => j !== i)) }
  function moveUp(i)   { if (i === 0) return; const n = [...entries]; [n[i-1], n[i]] = [n[i], n[i-1]]; onChange(n) }
  function moveDown(i) { if (i === entries.length - 1) return; const n = [...entries]; [n[i], n[i+1]] = [n[i+1], n[i]]; onChange(n) }

  function startRename(e) {
    e.stopPropagation()
    setRenameVal(name)
    setRenaming(true)
    setTimeout(() => renameRef.current?.select(), 0)
  }

  function commitRename() {
    const key = renameVal.trim().replace(/\s+/g, '_').toLowerCase()
    if (key && key !== name) onRename(key)
    setRenaming(false)
  }

  return (
    <div className="ff-section">
      <div className="ff-section-header-row">
        <button className="ff-section-header" onClick={() => !renaming && setOpen(o => !o)}>
          <span className="ff-chevron">{open ? '▾' : '▸'}</span>
          {renaming ? (
            <input
              ref={renameRef}
              className="ff-rename-input"
              value={renameVal}
              onChange={e => setRenameVal(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false) }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className="ff-section-name">{displayName}</span>
          )}
          <span className="ff-badge">{entries.length}</span>
        </button>
        <div className="ff-section-meta-actions">
          <button className="ff-act" onClick={e => { e.stopPropagation(); onMoveUp() }}   disabled={!onMoveUp}   title="Move up">↑</button>
          <button className="ff-act" onClick={e => { e.stopPropagation(); onMoveDown() }} disabled={!onMoveDown} title="Move down">↓</button>
          <button className="ff-act" onClick={startRename} title="Rename section">✎</button>
          <button className="ff-act ff-act-del" onClick={onDelete} title="Delete section">×</button>
        </div>
      </div>
      {open && (
        <div className="ff-section-body">
          {entries.map((entry, i) => (
            <div key={i} className="ff-entry-card">
              <div className="ff-entry-toolbar">
                <span className="ff-entry-idx">#{i + 1}</span>
                <div className="ff-entry-actions">
                  <button className="ff-act" onClick={() => moveUp(i)}   disabled={i === 0}                  title="Move up">↑</button>
                  <button className="ff-act" onClick={() => moveDown(i)} disabled={i === entries.length - 1} title="Move down">↓</button>
                  <button className="ff-act ff-act-del" onClick={() => removeEntry(i)} title="Remove">×</button>
                </div>
              </div>
              <EntryComp entry={entry} onChange={val => updateEntry(i, val)} />
            </div>
          ))}
          <button className="ff-add-entry" onClick={addEntry}>
            + Add {singular}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Add Section Modal ─────────────────────────────────────────
function AddSectionModal({ onAdd, onClose }) {
  const [sectionName, setSectionName] = useState('')
  const [entryType, setEntryType] = useState('honor')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleAdd() {
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
              ref={inputRef}
              className="ff-input"
              value={sectionName}
              onChange={e => setSectionName(e.target.value)}
              placeholder="e.g. Awards, Certifications, Volunteering"
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onClose() }}
            />
          </div>
          <div className="ff-field">
            <label className="ff-label">Entry Type</label>
            <div className="ff-type-grid">
              {SECTION_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`ff-type-btn${entryType === opt.value ? ' active' : ''}`}
                  onClick={() => setEntryType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ff-modal-footer">
          <button className="ff-modal-cancel" onClick={onClose}>Cancel</button>
          <button
            className="ff-modal-confirm"
            onClick={handleAdd}
            disabled={!sectionName.trim()}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main FormEditor ───────────────────────────────────────────
export default function FormEditor({ cvData, onYamlChange }) {
  const [data, setData] = useState(cvData || {})
  const [showAddSection, setShowAddSection] = useState(false)
  const skipSync = useRef(false)

  useEffect(() => {
    if (skipSync.current) { skipSync.current = false; return }
    if (cvData) setData(cvData)
  }, [cvData])

  function update(newData) {
    setData(newData)
    skipSync.current = true
    try { onYamlChange(toYaml(newData)) } catch {}
  }

  const set = (field, value) => update({ ...data, [field]: value })

  const setSection = (name, entries) =>
    update({ ...data, sections: { ...(data.sections || {}), [name]: entries } })

  function deleteSection(name) {
    const next = { ...(data.sections || {}) }
    delete next[name]
    update({ ...data, sections: next })
  }

  function renameSection(oldName, newName) {
    const old = data.sections || {}
    const entries = Object.entries(old)
    const next = Object.fromEntries(
      entries.map(([k, v]) => [k === oldName ? newName : k, v])
    )
    update({ ...data, sections: next })
  }

  function addSection(name, entryType) {
    const next = { ...(data.sections || {}), [name]: [newEntry(entryType)] }
    update({ ...data, sections: next })
    setShowAddSection(false)
  }

  function moveSection(name, dir) {
    const entries = Object.entries(data.sections || {})
    const i = entries.findIndex(([k]) => k === name)
    const j = i + dir
    if (j < 0 || j >= entries.length) return
    ;[entries[i], entries[j]] = [entries[j], entries[i]]
    update({ ...data, sections: Object.fromEntries(entries) })
  }

  const sections = data.sections || {}

  return (
    <div className="ff-root">

      {/* ── Personal Info ── */}
      <div className="ff-group">
        <div className="ff-group-title">Personal Info</div>
        <Field label="Full Name"  value={data.name}     onChange={v => set('name', v)}     placeholder="Your Name" />
        <Field label="Headline"   value={data.headline} onChange={v => set('headline', v)} placeholder="Software Engineer & Researcher" />
        <div className="ff-row2">
          <Field label="Location" value={data.location} onChange={v => set('location', v)} placeholder="City, Country" />
          <Field label="Email"    value={data.email}    onChange={v => set('email', v)}    placeholder="you@email.com" />
        </div>
        <div className="ff-row2">
          <Field label="Phone"   value={data.phone}   onChange={v => set('phone', v)}   placeholder="+1 555 000 0000" />
          <Field label="Website" value={data.website} onChange={v => set('website', v)} placeholder="https://yoursite.com" />
        </div>
      </div>

      {/* ── Social Networks ── */}
      <div className="ff-group">
        <div className="ff-group-title">Social Networks</div>
        {(data.social_networks || []).map((sn, i) => (
          <div key={i} className="ff-sn-row">
            <input
              className="ff-input ff-sn-network"
              value={sn.network || ''}
              onChange={e => {
                const n = [...(data.social_networks || [])]; n[i] = { ...sn, network: e.target.value }
                set('social_networks', n)
              }}
              placeholder="LinkedIn"
            />
            <input
              className="ff-input"
              value={sn.username || ''}
              onChange={e => {
                const n = [...(data.social_networks || [])]; n[i] = { ...sn, username: e.target.value }
                set('social_networks', n)
              }}
              placeholder="username"
            />
            <button className="ff-del-btn" onClick={() => set('social_networks', (data.social_networks || []).filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button className="ff-add-entry" onClick={() => set('social_networks', [...(data.social_networks || []), { network: '', username: '' }])}>
          + Add Network
        </button>
      </div>

      {/* ── CV Sections ── */}
      <div className="ff-group">
        <div className="ff-group-title">Sections</div>
        {Object.entries(sections).map(([name, entries], i, arr) => (
          <SectionPanel
            key={name}
            name={name}
            entries={entries || []}
            onChange={ents => setSection(name, ents)}
            onDelete={() => deleteSection(name)}
            onRename={newName => renameSection(name, newName)}
            onMoveUp={i > 0 ? () => moveSection(name, -1) : null}
            onMoveDown={i < arr.length - 1 ? () => moveSection(name, 1) : null}
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
