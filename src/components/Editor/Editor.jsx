import { useEffect, useRef } from 'react'
import styles from './Editor.module.css'

export default function Editor({ value, onChange, error }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value])

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)
      requestAnimationFrame(() => {
        ta.selectionStart = start + 2
        ta.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.header}>
        <span className={styles.label}>YAML Editor</span>
        {error && <span className={styles.errorBadge}>Error de sintaxis</span>}
      </div>
      <textarea
        ref={textareaRef}
        className={`${styles.textarea} ${error ? styles.hasError : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      {error && <div className={styles.errorMsg}>{error}</div>}
    </div>
  )
}
