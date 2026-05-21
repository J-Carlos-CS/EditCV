import { useState } from 'react'
import { createCV, saveCV, deleteCV } from '../../utils/storage'
import styles from './Sidebar.module.css'

export default function Sidebar({ cvs, activeCVId, onSelect, onCVsChange }) {
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

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
    <aside className={styles.sidebar}>
      <button className={styles.newBtn} onClick={handleNew}>
        + Nuevo CV
      </button>
      <ul className={styles.list}>
        {cvs.map(cv => (
          <li
            key={cv.id}
            className={`${styles.item} ${cv.id === activeCVId ? styles.active : ''}`}
            onClick={() => onSelect(cv.id)}
          >
            {editingId === cv.id ? (
              <input
                className={styles.renameInput}
                value={editingName}
                autoFocus
                onChange={e => setEditingName(e.target.value)}
                onBlur={() => handleRenameCommit(cv)}
                onKeyDown={e => e.key === 'Enter' && handleRenameCommit(cv)}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className={styles.cvName}>{cv.name}</span>
                <span className={styles.actions}>
                  <button
                    className={styles.iconBtn}
                    title="Renombrar"
                    onClick={e => handleRenameStart(e, cv)}
                  >✏️</button>
                  <button
                    className={styles.iconBtn}
                    title="Eliminar"
                    onClick={e => handleDelete(e, cv.id)}
                    disabled={cvs.length === 1}
                  >🗑️</button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}
