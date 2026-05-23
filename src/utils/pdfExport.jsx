import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import CVHeader from '../components/CVPreview/sections/CVHeader'
import CVSection from '../components/CVPreview/CVSection'
import { TEMPLATES } from '../templates/index'
import { TemplateStaticProvider } from '../context/TemplateContext'

/**
 * US Letter page dimensions.
 * 816×1056 px matches a 96dpi screen render of an 8.5×11 inch page.
 * 612×792 pt is the same page in PDF points (72pt = 1 inch).
 */
const PAGE_WIDTH_PX  = 816
const PAGE_HEIGHT_PX = 1056
const PDF_WIDTH_PT   = 612
const PDF_HEIGHT_PT  = 792

/**
 * Render scale for html2canvas. 3× gives a crisp image at normal zoom levels
 * without making the PDF file too large.
 */
const CANVAS_SCALE = 3

/** Returns the JSX for a single CV item (header or section). */
function renderCvItem(item, cvData) {
  if (item.type === 'header') return <CVHeader cv={cvData} />
  return <CVSection title={item.title} entries={Array.isArray(item.entries) ? item.entries : []} />
}

/**
 * Mounts a React element into a detached DOM container, waits for fonts and
 * layout to settle, then returns the root so the caller can unmount it later.
 *
 * The 150 ms delay is intentional: fonts load asynchronously and html2canvas
 * captures whatever is visible at call time, so we give them a moment to render.
 */
async function mountReactAndWaitForLayout(container, element) {
  const root = createRoot(container)
  flushSync(() => root.render(element))
  await new Promise(resolve => setTimeout(resolve, 150))
  return root
}

/**
 * Exports the CV to a multi-page PDF file and triggers a browser download.
 *
 * How it works:
 *   1. Render all CV items off-screen to measure their exact pixel heights.
 *   2. Use those heights to split items into pages (greedy bin-packing).
 *   3. Render each page off-screen, capture it with html2canvas, and embed
 *      the resulting image as a JPEG page in jsPDF.
 */
export async function exportToPDF(cvData, filename = 'cv.pdf', templateId = 'harvard') {
  const template = TEMPLATES[templateId] ?? TEMPLATES.harvard

  // CSS applied to every off-screen measurement/rendering container
  const offScreenContainerStyle = [
    'position:fixed', 'top:0', 'left:-9999px', 'z-index:-1',
    `width:${PAGE_WIDTH_PX}px`,
    `padding:0 ${template.paddingH}px`,
    'background:#fff',
    'box-sizing:border-box',
  ].join(';')

  // Build a flat list: header first, then one entry per section
  const cvSections = cvData?.sections || {}
  const allItems = [
    { type: 'header' },
    ...Object.entries(cvSections).map(([title, entries]) => ({ type: 'section', title, entries })),
  ]

  // ── Step 1: Measure each item's rendered height ───────────────────────────
  const measureContainer = document.createElement('div')
  measureContainer.setAttribute('data-template', templateId)
  measureContainer.style.cssText = offScreenContainerStyle
  document.body.appendChild(measureContainer)

  const measureRoot = await mountReactAndWaitForLayout(
    measureContainer,
    <TemplateStaticProvider templateId={templateId}>
      <div>
        {allItems.map((item, i) => (
          <div key={i} data-idx={i}>{renderCvItem(item, cvData)}</div>
        ))}
      </div>
    </TemplateStaticProvider>
  )

  const itemHeights = Array.from(measureContainer.firstChild.children)
    .map(child => child.getBoundingClientRect().height)

  measureRoot.unmount()
  document.body.removeChild(measureContainer)

  // ── Step 2: Paginate – greedy bin-packing by height ───────────────────────
  const availableHeight = PAGE_HEIGHT_PX - template.paddingV * 2
  const pages           = []
  let currentPageItems  = []
  let currentPageHeight = 0

  for (let i = 0; i < allItems.length; i++) {
    const itemHeight = itemHeights[i]
    const wouldOverflow = currentPageItems.length > 0 && currentPageHeight + itemHeight > availableHeight

    if (wouldOverflow) {
      pages.push(currentPageItems)
      currentPageItems  = [i]
      currentPageHeight = itemHeight
    } else {
      currentPageItems.push(i)
      currentPageHeight += itemHeight
    }
  }
  if (currentPageItems.length) pages.push(currentPageItems)

  // ── Step 3: Render, capture, and write each page ──────────────────────────
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageContainer = document.createElement('div')
    pageContainer.setAttribute('data-template', templateId)
    pageContainer.style.cssText = [
      'position:fixed', 'top:0', 'left:-9999px', 'z-index:-1',
      `width:${PAGE_WIDTH_PX}px`, `height:${PAGE_HEIGHT_PX}px`,
      `padding:${template.paddingV}px ${template.paddingH}px`,
      'background:#fff',
      'box-sizing:border-box', 'overflow:hidden',
    ].join(';')
    document.body.appendChild(pageContainer)

    const pageRoot = await mountReactAndWaitForLayout(
      pageContainer,
      <TemplateStaticProvider templateId={templateId}>
        <>
          {pages[pageIndex].map(itemIndex => (
            <div key={itemIndex}>{renderCvItem(allItems[itemIndex], cvData)}</div>
          ))}
        </>
      </TemplateStaticProvider>
    )

    const canvas = await html2canvas(pageContainer, {
      scale: CANVAS_SCALE,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: PAGE_WIDTH_PX,
      height: PAGE_HEIGHT_PX,
      windowWidth: PAGE_WIDTH_PX,
    })

    if (pageIndex > 0) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, PDF_WIDTH_PT, PDF_HEIGHT_PT)

    pageRoot.unmount()
    document.body.removeChild(pageContainer)
  }

  pdf.save(filename)
}
