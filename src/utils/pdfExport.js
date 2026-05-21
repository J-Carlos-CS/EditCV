import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function exportToPDF(element, filename = 'cv.pdf') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'letter')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  let yOffset = 0
  let heightLeft = imgHeight

  pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    yOffset = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
