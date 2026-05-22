import { useState } from 'react'
import { createCV, saveCV, deleteCV } from '../../utils/storage'

export default function Sidebar({ cvs, activeCVId, onSelect, onCVsChange }) {
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
    </svg>
  )
  const IconEdit = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2l2 2-7 7H2v-2L9 2z"/>
    </svg>
  )
  const IconTrash = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,3 11,3"/><path d="M4 3V2h5v1"/><path d="M4.5 5l.5 5M8.5 5l-.5 5"/><rect x="3" y="3" width="7" height="8" rx="1"/>
    </svg>
  )

  function handleNew() {
    const cv = createCV('Nuevo CV')
    saveCV(cv)
    onCVsChange()
    onSelect(cv.id)
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    if (cvs.length === 1) return
    deleteCV(id)
    onCVsChange()
    if (activeCVId === id) {
      const remaining = cvs.filter(c => c.id !== id)
      if (remaining.length) onSelect(remaining[0].id)
    }
  }

  function handleRenameStart(e, cv) {
    e.stopPropagation()
    setEditingId(cv.id)
    setEditingName(cv.name)
  }

  function handleRenameCommit(cv) {
    const updated = { ...cv, name: editingName.trim() || cv.name }
    saveCV(updated)
    onCVsChange()
    setEditingId(null)
  }

  return (
    <aside className="sidebar">
      <button className="newBtn" onClick={handleNew}>
        <IconPlus /> Nuevo CV
      </button>
      <ul className="list">
        {cvs.map(cv => (
          <li
            key={cv.id}
            className={`item ${cv.id === activeCVId ? 'active' : ''}`}
            onClick={() => onSelect(cv.id)}
          >
            {editingId === cv.id ? (
              <input
                className="renameInput"
                value={editingName}
                autoFocus
                onChange={e => setEditingName(e.target.value)}
                onBlur={() => handleRenameCommit(cv)}
                onKeyDown={e => e.key === 'Enter' && handleRenameCommit(cv)}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="sidebarItemName">{cv.name}</span>
                <span className="actions">
                  <button
                    className="iconBtn"
                    title="Renombrar"
                    onClick={e => handleRenameStart(e, cv)}
                  ><IconEdit /></button>
                  <button
                    className="iconBtn"
                    title="Eliminar"
                    onClick={e => handleDelete(e, cv.id)}
                    disabled={cvs.length === 1}
                  ><IconTrash /></button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
