import { useRef, useState } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { useTheme } from '../../context/ThemeContext'
import FormEditor from './FormEditor'
import './FormEditor.css'

/**
 * Monaco editor configuration that stays constant across renders.
 * Defined outside the component so the object reference is stable and
 * Monaco doesn't unnecessarily re-apply options on every re-render.
 */
const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },
  folding: true,
  foldingHighlight: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'always',
  wordWrap: 'off',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  scrollbar: {
    vertical: 'visible',
    horizontal: 'visible',
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
    useShadows: false,
  },
  overviewRulerLanes: 0,
  overviewRulerBorder: false,
  hideCursorInOverviewRuler: true,
  tabSize: 2,
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  renderWhitespace: 'selection',
  padding: { top: 8, bottom: 8 },
}

export default function Editor({ value, onChange, error, parsedCV }) {
  const editorRef = useRef(null)
  const { theme } = useTheme()
  const [mode, setMode] = useState('form')

  function handleEditorMount(editor) {
    editorRef.current = editor
    editor.updateOptions({ tabSize: 2, insertSpaces: true })
  }

  return (
    <div className="editorWrapper">
      <div className="editorHeader">
        <span className="editorLabel">
          {mode === 'yaml' ? 'YAML Editor' : 'Form Editor'}
        </span>
        <div className="editor-mode-switch">
          {error && mode === 'yaml' && <span className="errorBadge">Syntax Error</span>}
          <div className="mode-toggle">
            <button
              className={`mode-tab${mode === 'form' ? ' active' : ''}`}
              onClick={() => setMode('form')}
            >
              Form
            </button>
            <button
              className={`mode-tab${mode === 'yaml' ? ' active' : ''}`}
              onClick={() => setMode('yaml')}
            >
              YAML
            </button>
          </div>
        </div>
      </div>

      {mode === 'yaml' ? (
        <>
          <div className="monacoContainer">
            <MonacoEditor
              language="yaml"
              theme={theme === 'light' ? 'vs' : 'vs-dark'}
              value={value}
              onChange={val => onChange(val ?? '')}
              onMount={handleEditorMount}
              options={MONACO_OPTIONS}
            />
          </div>
          {error && <div className="errorMsg">{error}</div>}
        </>
      ) : (
        <FormEditor cvData={parsedCV} onYamlChange={onChange} />
      )}
    </div>
  )
}
