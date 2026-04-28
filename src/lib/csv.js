// CSV utilities — used by the dashboard data export.

function escapeField(v) {
  if (v === null || v === undefined) return ''
  let s = typeof v === 'string' ? v : JSON.stringify(v)
  // Per RFC 4180: wrap in quotes and double inner quotes if the value
  // contains a comma, quote, or newline.
  if (/[",\r\n]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function rowsToCSV(headers, rows) {
  const lines = [headers.map(escapeField).join(',')]
  for (const r of rows) {
    lines.push(headers.map((h) => escapeField(r[h])).join(','))
  }
  return lines.join('\r\n')
}

export function downloadCSV(filename, csvText) {
  // Prepend a UTF-8 BOM so Excel opens it correctly.
  const blob = new Blob(['﻿' + csvText], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

export function todayStamp() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
