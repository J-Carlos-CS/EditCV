import { useRef, useState, useLayoutEffect } from 'react'
import CVHeader from './sections/CVHeader'
import CVSection from './CVSection'

// PDF page: 792pt × (96/72) = 1056px. Padding: 24pt × (96/72) = 32px.
const PAGE_HEIGHT = 1056
const PAGE_PADDING_V = 32

function usePagination(cvData) {
  const measureRef = useRef(null)
  const [pages, setPages] = useState(null)

  useLayoutEffect(() => {
    if (!measureRef.current || !cvData) { setPages(null); return }
    const children = Array.from(measureRef.current.children)
    if (!children.length) return

    const available = PAGE_HEIGHT - PAGE_PADDING_V * 2
    const groups = []
    let page = [], height = 0

    for (const child of children) {
      const h = child.getBoundingClientRect().height
      if (page.length > 0 && height + h > available) {
        groups.push(page)
        page = [Number(child.dataset.idx)]
        height = h
      } else {
        page.push(Number(child.dataset.idx))
        height += h
      }
    }
    if (page.length) groups.push(page)
    setPages(groups)
  }, [cvData])

  return { measureRef, pages }
}

export default function CVPreview({ cvData }) {
  const items = cvData
    ? [
        { type: 'header' },
        ...Object.entries(cvData.sections || {}).map(([title, entries]) => ({ type: 'section', title, entries })),
      ]
    : []

  const { measureRef, pages } = usePagination(cvData)

  if (!cvData) {
    return (
      <div className="previewWrapper">
        <div className="page">
          <div className="emptyState">Escribe tu YAML en el editor para ver el preview</div>
        </div>
      </div>
    )
  }

  function renderItem(idx) {
    const item = items[idx]
    if (!item) return null
    if (item.type === 'header') return <CVHeader key={idx} cv={cvData} />
    return <CVSection key={idx} title={item.title} entries={Array.isArray(item.entries) ? item.entries : []} />
  }

  const visiblePages = pages || [items.map((_, i) => i)]

  return (
    <div className="previewWrapper">
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed', top: 0, left: '-9999px', visibility: 'hidden',
          width: '816px', padding: `${PAGE_PADDING_V}px 58px 0`, boxSizing: 'border-box',
          fontFamily: "'Times New Roman', Times, serif", fontSize: '10pt',
          lineHeight: '1.35', pointerEvents: 'none',
        }}
      >
        {items.map((item, idx) => (
          <div key={idx} data-idx={idx}>
            {item.type === 'header'
              ? <CVHeader cv={cvData} />
              : <CVSection title={item.title} entries={Array.isArray(item.entries) ? item.entries : []} />
            }
          </div>
        ))}
      </div>

      {visiblePages.map((pageItems, pageIdx) => (
        <div key={pageIdx} style={{ display: 'contents' }}>
          {pageIdx > 0 && <div className="pageBreakShadow" />}
          <div className="page">{pageItems.map(renderItem)}</div>
        </div>
      ))}
    </div>
  )
}
