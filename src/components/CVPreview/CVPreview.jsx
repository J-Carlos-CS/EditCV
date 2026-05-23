import { useRef, useState, useLayoutEffect } from 'react'
import CVHeader from './sections/CVHeader'
import CVSection from './CVSection'
import { useTemplate } from '../../context/TemplateContext'
import { TEMPLATES } from '../../templates/index'

const PAGE_HEIGHT = 1056

function usePagination(cvData, paddingV, template) {
  const measureRef = useRef(null)
  const [pages, setPages] = useState(null)

  useLayoutEffect(() => {
    if (!measureRef.current || !cvData) { setPages(null); return }
    let cancelled = false

    document.fonts.ready.then(() => {
      if (cancelled || !measureRef.current) return
      const children = Array.from(measureRef.current.children)
      if (!children.length) return

      // Use top-difference so collapsed margins between adjacent sections are
      // counted correctly (same logic as pdfExport.jsx)
      const rects    = children.map(c => c.getBoundingClientRect())
      const heights  = rects.map((r, i) =>
        i < rects.length - 1 ? rects[i + 1].top - r.top : r.height
      )

      const available = PAGE_HEIGHT - paddingV * 2
      const groups = []
      let page = [], height = 0

      for (let ci = 0; ci < children.length; ci++) {
        const child = children[ci]
        const h = heights[ci]
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
    })

    return () => { cancelled = true }
  }, [cvData, paddingV, template])

  return { measureRef, pages }
}

export default function CVPreview({ cvData, zoom = 100 }) {
  const { template } = useTemplate()
  const tpl = TEMPLATES[template]

  const items = cvData
    ? [
        { type: 'header' },
        ...Object.entries(cvData.sections || {}).map(([title, entries]) => ({ type: 'section', title, entries })),
      ]
    : []

  const { measureRef, pages } = usePagination(cvData, tpl.paddingV, template)

  if (!cvData) {
    return (
      <div className="previewWrapper">
        <div className="page" data-template={template}>
          <div className="emptyState">Write your YAML in the editor to see the preview</div>
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

  const pageStyle = {
    padding: `${tpl.paddingV}px ${tpl.paddingH}px`,
  }

  const measureStyle = {
    position: 'fixed', top: 0, left: '-9999px', visibility: 'hidden',
    width: '816px',
    padding: `${tpl.paddingV}px ${tpl.paddingH}px 0`,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div className="previewWrapper">
      <div ref={measureRef} aria-hidden="true" data-template={template} style={measureStyle}>
        {items.map((item, idx) => (
          <div key={idx} data-idx={idx}>
            {item.type === 'header'
              ? <CVHeader cv={cvData} />
              : <CVSection title={item.title} entries={Array.isArray(item.entries) ? item.entries : []} />
            }
          </div>
        ))}
      </div>

      <div style={{ zoom: `${zoom}%` }}>
        {visiblePages.map((pageItems, pageIdx) => (
          <div key={pageIdx}>
            {pageIdx > 0 && <div className="pageBreakShadow" />}
            <div className="page" data-template={template} style={pageStyle}>
              {pageItems.map(renderItem)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
