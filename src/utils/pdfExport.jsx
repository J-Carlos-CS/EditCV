import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import CVHeader from '../components/CVPreview/sections/CVHeader'
import CVSection from '../components/CVPreview/CVSection'
import { TEMPLATES } from '../templates/index'
import { TemplateStaticProvider } from '../context/TemplateContext'

const PAGE_W_PX = 816
const PAGE_H_PX = 1056
const PDF_W_PT = 612
const PDF_H_PT = 792
const SCALE = 3

function renderItem(item, cvData) {
  if (item.type === 'header') return <CVHeader cv={cvData} />
  return <CVSection title={item.title} entries={Array.isArray(item.entries) ? item.entries : []} />
}

async function mountAndWait(container, element) {
  const root = createRoot(container)
  flushSync(() => root.render(element))
  await new Promise(r => setTimeout(r, 150))
  return root
}

export async function exportToPDF(cvData, filename = 'cv.pdf', templateId = 'harvard') {
  const tpl = TEMPLATES[templateId] ?? TEMPLATES.harvard

  const baseStyle = [
    'position:fixed', 'top:0', 'left:-9999px', 'z-index:-1',
    `width:${PAGE_W_PX}px`,
    `padding:0 ${tpl.paddingH}px`,
    'background:#fff',
    'box-sizing:border-box',
  ].join(';')

  const sections = cvData?.sections || {}
  const items = [
    { type: 'header' },
    ...Object.entries(sections).map(([title, entries]) => ({ type: 'section', title, entries })),
  ]

  // ── Step 1: measure each item's height ──────────────────────
  const measureDiv = document.createElement('div')
  measureDiv.setAttribute('data-template', templateId)
  measureDiv.style.cssText = baseStyle
  document.body.appendChild(measureDiv)

  const measureRoot = await mountAndWait(measureDiv,
    <TemplateStaticProvider templateId={templateId}>
      <div>
        {items.map((item, i) => (
          <div key={i} data-idx={i}>{renderItem(item, cvData)}</div>
        ))}
      </div>
    </TemplateStaticProvider>
  )

  const heights = Array.from(measureDiv.firstChild.children)
    .map(child => child.getBoundingClientRect().height)

  measureRoot.unmount()
  document.body.removeChild(measureDiv)

  // ── Step 2: paginate ─────────────────────────────────────────
  const available = PAGE_H_PX - tpl.paddingV * 2
  const pages = []
  let page = [], used = 0

  for (let i = 0; i < items.length; i++) {
    const h = heights[i]
    if (page.length > 0 && used + h > available) {
      pages.push(page)
      page = [i]
      used = h
    } else {
      page.push(i)
      used += h
    }
  }
  if (page.length) pages.push(page)

  // ── Step 3: render + capture each page ──────────────────────
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })

  for (let pi = 0; pi < pages.length; pi++) {
    const pageDiv = document.createElement('div')
    pageDiv.setAttribute('data-template', templateId)
    pageDiv.style.cssText = [
      'position:fixed', 'top:0', 'left:-9999px', 'z-index:-1',
      `width:${PAGE_W_PX}px`, `height:${PAGE_H_PX}px`,
      `padding:${tpl.paddingV}px ${tpl.paddingH}px`,
      'background:#fff',
      'box-sizing:border-box', 'overflow:hidden',
    ].join(';')
    document.body.appendChild(pageDiv)

    const pageRoot = await mountAndWait(pageDiv,
      <TemplateStaticProvider templateId={templateId}>
        <>{pages[pi].map(idx => <div key={idx}>{renderItem(items[idx], cvData)}</div>)}</>
      </TemplateStaticProvider>
    )

    const canvas = await html2canvas(pageDiv, {
      scale: SCALE,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: PAGE_W_PX,
      height: PAGE_H_PX,
      windowWidth: PAGE_W_PX,
    })

    if (pi > 0) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PDF_W_PT, PDF_H_PT)

    pageRoot.unmount()
    document.body.removeChild(pageDiv)
  }

  pdf.save(filename)
}
