import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(wrapperElement, filename = 'cv.pdf') {
  const pageEls = Array.from(wrapperElement.querySelectorAll('.page'))
  if (pageEls.length === 0) return

  const pdf = new jsPDF('p', 'mm', 'letter')
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < pageEls.length; i++) {
    const canvas = await html2canvas(pageEls[i], {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    // JPEG at 0.85 quality — ~10x smaller than PNG, imperceptible for text
    const imgData = canvas.toDataURL('image/jpeg', 0.85)
    const imgW = pdfW
    const imgH = (canvas.height / canvas.width) * pdfW

    if (i > 0) pdf.addPage()
    const yOffset = imgH < pdfH ? (pdfH - imgH) / 2 : 0
    pdf.addImage(imgData, 'JPEG', 0, yOffset, imgW, imgH)
  }

  pdf.save(filename)
}
