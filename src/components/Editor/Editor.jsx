import { useRef } from 'react'
import MonacoEditor from '@monaco-editor/react'
import { useTheme } from '../../context/ThemeContext'

export default function Editor({ value, onChange, error }) {
  const editorRef = useRef(null)
  const { theme } = useTheme()

  function handleMount(editor) {
    editorRef.current = editor
    editor.updateOptions({ tabSize: 2, insertSpaces: true })
  }

  return (
    <div className="editorWrapper">
      <div className="editorHeader">
        <span className="editorLabel">YAML Editor</span>
        {error && <span className="errorBadge">Error de sintaxis</span>}
      </div>
      <div className="monacoContainer">
        <MonacoEditor
          language="yaml"
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          value={value}
          onChange={val => onChange(val ?? '')}
          onMount={handleMount}
          options={{
            fontSize: 13,
            fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: true },
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            wordWrap: 'off',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
            renderWhitespace: 'selection',
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
      {error && <div className="errorMsg">{error}</div>}
    </div>
  )
}
