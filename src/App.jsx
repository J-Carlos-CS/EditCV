import { useState, useEffect, useRef, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Editor from './components/Editor/Editor'
import CVPreview from './components/CVPreview/CVPreview'
import { parseCV } from './utils/yamlParser'
import { loadCVs, saveCV, createCV, getActiveId, setActiveId } from './utils/storage'
import { exportToPDF } from './utils/pdfExport'
import styles from './App.module.css'

function AppInner() {
  const [cvs, setCVs] = useState([])
  const [activeCVId, setActiveCVId] = useState(null)
  const [yamlText, setYamlText] = useState('')
  const [parsedCV, setParsedCV] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const previewRef = useRef(null)
  const saveTimerRef = useRef(null)

  // Load CVs from localStorage on mount
  useEffect(() => {
    let stored = loadCVs()
    if (stored.length === 0) {
      const first = createCV('Mi CV')
      saveCV(first)
      stored = [first]
    }
    setCVs(stored)

    const activeId = getActiveId()
    const active = stored.find(c => c.id === activeId) || stored[0]
    setActiveCVId(active.id)
    setActiveId(active.id)
    setYamlText(active.yaml)
  }, [])

  // Parse YAML on change
  useEffect(() => {
    const { data, error } = parseCV(yamlText)
    setParsedCV(data)
    setParseError(error)
  }, [yamlText])

  // Autosave with debounce
  useEffect(() => {
    if (!activeCVId || !yamlText) return
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      const cv = cvs.find(c => c.id === activeCVId)
      if (cv) {
        const updated = { ...cv, yaml: yamlText, updatedAt: new Date().toISOString() }
        saveCV(updated)
        setCVs(loadCVs())
      }
    }, 600)
    return () => clearTimeout(saveTimerRef.current)
  }, [yamlText, activeCVId])

  function handleSelectCV(id) {
    const cv = cvs.find(c => c.id === id)
    if (!cv) return
    setActiveCVId(id)
    setActiveId(id)
    setYamlText(cv.yaml)
  }

  function handleCVsChange() {
    setCVs(loadCVs())
  }

  const handleExport = useCallback(async () => {
    if (!previewRef.current || exporting) return
    setExporting(true)
    try {
      const name = parsedCV?.name || 'cv'
      await exportToPDF(previewRef.current, `${name}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [parsedCV, exporting])

  return (
    <div className={styles.app}>
      <Navbar />
      <div className={styles.body}>
        <Sidebar
          cvs={cvs}
          activeCVId={activeCVId}
          onSelect={handleSelectCV}
          onCVsChange={handleCVsChange}
        />
        <div className={styles.editorPane}>
          <Editor value={yamlText} onChange={setYamlText} error={parseError} />
        </div>
        <div className={styles.previewPane}>
          <div className={styles.previewToolbar}>
            <span className={styles.previewLabel}>Preview — US Letter</span>
            <button
              className={styles.exportBtn}
              onClick={handleExport}
              disabled={exporting || !!parseError || !parsedCV}
            >
              {exporting ? 'Exportando...' : '⬇ Descargar PDF'}
            </button>
          </div>
          <CVPreview ref={previewRef} cvData={parsedCV} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
