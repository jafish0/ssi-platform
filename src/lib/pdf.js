// PDF download helper — wraps jsPDF for the Builder/Delivery use case
// of "save my plan as a PDF". Same blob/anchor download pattern as
// src/lib/csv.js downloadCSV.
import { jsPDF } from 'jspdf'

// US Letter dimensions (in mm): 215.9 x 279.4
// Margins are intentionally generous so the PDF reads as a document,
// not a page of text.
const PAGE_W = 215.9
const PAGE_H = 279.4
const MARGIN = 18 // mm
const TITLE_SIZE = 18
const BODY_SIZE = 11
const TITLE_LINE = 8 // mm advance after each title line
const BODY_LINE = 5.6 // mm advance per body line

export function downloadPdf({ title, body, filename }) {
  const doc = new jsPDF({ unit: 'mm', format: 'letter', compress: true })
  doc.setFont('helvetica', 'normal')

  let cursorY = MARGIN
  const innerWidth = PAGE_W - MARGIN * 2

  function newPageIfNeeded(advance) {
    if (cursorY + advance > PAGE_H - MARGIN) {
      doc.addPage()
      cursorY = MARGIN
    }
  }

  // Title
  if (title) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(TITLE_SIZE)
    const titleLines = doc.splitTextToSize(title, innerWidth)
    for (const line of titleLines) {
      newPageIfNeeded(TITLE_LINE)
      doc.text(line, MARGIN, cursorY)
      cursorY += TITLE_LINE
    }
    cursorY += 4 // a bit of breathing room after the title
  }

  // Body — preserve the author's paragraph breaks; jsPDF wraps inside
  // each paragraph at innerWidth.
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(BODY_SIZE)

  const paragraphs = (body || '').split(/\n/)
  for (const para of paragraphs) {
    if (para.trim() === '') {
      newPageIfNeeded(BODY_LINE)
      cursorY += BODY_LINE * 0.6
      continue
    }
    const lines = doc.splitTextToSize(para, innerWidth)
    for (const line of lines) {
      newPageIfNeeded(BODY_LINE)
      doc.text(line, MARGIN, cursorY)
      cursorY += BODY_LINE
    }
  }

  doc.save(filename || 'plan.pdf')
}
