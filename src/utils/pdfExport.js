import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(wrapperElement, filename = 'cv.pdf') {
  const pageEls = Array.from(wrapperElement.querySelectorAll('.page'))
  if (pageEls.length === 0) return

  // compress: true enables zlib deflate on the PDF stream — cuts 40-60% of file size
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'letter', compress: true })
  const pdfW = pdf.internal.pageSize.getWidth()
  const pdfH = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < pageEls.length; i++) {
    const canvas = await html2canvas(pageEls[i], {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // PNG is lossless and smaller than JPEG for black text on white background
    const imgData = canvas.toDataURL('image/png')
    const imgH = (canvas.height / canvas.width) * pdfW

    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH, undefined, 'FAST')
  }

  pdf.save(filename)
}
