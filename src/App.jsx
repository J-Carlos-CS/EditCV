import { useState, useEffect, useRef, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import Editor from './components/Editor/Editor'
import CVPreview from './components/CVPreview/CVPreview'
import { parseCV } from './utils/yamlParser'
import { loadCVs, saveCV, createCV, getActiveId, setActiveId } from './utils/storage'
import { exportToPDF } from './utils/pdfExport'

function AppInner() {
  const [cvs, setCVs] = useState([])
  const [activeCVId, setActiveCVId] = useState(null)
  const [yamlText, setYamlText] = useState('')
  const [parsedCV, setParsedCV] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const [zoom, setZoom] = useState(150)
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
    if (!parsedCV || exporting) return
    setExporting(true)
    try {
      const name = parsedCV?.name || 'cv'
      await exportToPDF(parsedCV, `${name}.pdf`)
    } finally {
      setExporting(false)
    }
  }, [parsedCV, exporting])

  return (
    <div className="app">
      <Navbar />
      <div className="body">
        <Sidebar
          cvs={cvs}
          activeCVId={activeCVId}
          onSelect={handleSelectCV}
          onCVsChange={handleCVsChange}
        />
        <div className="mainCard">
          <div className="editorPane">
            <Editor value={yamlText} onChange={setYamlText} error={parseError} parsedCV={parsedCV} />
          </div>
          <div className="previewPane">
            <div className="previewToolbar">
              <span className="previewLabel">Preview — US Letter</span>
              <div className="zoomControls">
                <button className="zoomBtn" onClick={() => setZoom(z => Math.max(25, z - 10))} title="Zoom out">−</button>
                <span className="zoomLabel">{zoom}%</span>
                <button className="zoomBtn" onClick={() => setZoom(z => Math.min(200, z + 10))} title="Zoom in">+</button>
                <button className="zoomBtn zoomReset" onClick={() => setZoom(100)} title="Reset zoom">⊙</button>
              </div>
              <button
                className="exportBtn"
                onClick={handleExport}
                disabled={exporting || !!parseError || !parsedCV}
              >
                {exporting ? 'Exportando...' : '⬇ Descargar PDF'}
              </button>
            </div>
            <CVPreview cvData={parsedCV} zoom={zoom} />
          </div>
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
