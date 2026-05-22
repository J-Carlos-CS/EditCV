import { forwardRef, useRef, useState, useLayoutEffect } from 'react'
import CVHeader from './sections/CVHeader'
import CVSection from './CVSection'

const PAGE_HEIGHT = 1056
const PAGE_PADDING_V = 38

function usePagination(cvData) {
  const measureRef = useRef(null)
  const [pages, setPages] = useState(null)

  useLayoutEffect(() => {
    if (!measureRef.current || !cvData) {
      setPages(null)
      return
    }

    const container = measureRef.current
    const children = Array.from(container.children)
    if (children.length === 0) return

    const availableHeight = PAGE_HEIGHT - PAGE_PADDING_V * 2
    const groups = []
    let currentPage = []
    let currentHeight = 0

    for (const child of children) {
      const h = child.getBoundingClientRect().height
      if (currentPage.length > 0 && currentHeight + h > availableHeight) {
        groups.push(currentPage)
        currentPage = [Number(child.dataset.idx)]
        currentHeight = h
      } else {
        currentPage.push(Number(child.dataset.idx))
        currentHeight += h
      }
    }
    if (currentPage.length > 0) groups.push(currentPage)

    setPages(groups)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvData])

  return { measureRef, pages }
}

const CVPreview = forwardRef(function CVPreview({ cvData }, ref) {
  const sections = cvData?.sections || {}
  const sectionEntries = Object.entries(sections)

  const items = cvData
    ? [
        { type: 'header' },
        ...sectionEntries.map(([title, entries]) => ({ type: 'section', title, entries })),
      ]
    : []

  const { measureRef, pages } = usePagination(cvData)

  if (!cvData) {
    return (
      <div className="previewWrapper">
        <div className="page">
          <div className="emptyState">
            Escribe tu YAML en el editor para ver el preview
          </div>
        </div>
      </div>
    )
  }

  const visiblePages = pages || [items.map((_, i) => i)]

  function renderItem(idx) {
    const item = items[idx]
    if (!item) return null
    if (item.type === 'header') return <CVHeader key={idx} cv={cvData} />
    return (
      <CVSection
        key={idx}
        title={item.title}
        entries={Array.isArray(item.entries) ? item.entries : []}
      />
    )
  }

  return (
    <div className="previewWrapper" ref={ref}>
      {/* Hidden off-screen layer for measurement */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: '-9999px',
          visibility: 'hidden',
          width: '816px',
          padding: `${PAGE_PADDING_V}px 58px`,
          boxSizing: 'border-box',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '10pt',
          lineHeight: '1.35',
          pointerEvents: 'none',
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

      {/* Visible pages stacked vertically */}
      {visiblePages.map((pageItems, pageIdx) => (
        <div key={pageIdx} style={{ display: 'contents' }}>
          {pageIdx > 0 && <div className="pageBreakShadow" />}
          <div className="page">
            {pageItems.map(renderItem)}
          </div>
        </div>
      ))}
    </div>
  )
})

export default CVPreview
