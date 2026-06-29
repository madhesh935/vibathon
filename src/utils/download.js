export const downloadData = (data, filename, mimeType = 'text/plain') => {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const downloadCSV = (headers, rows, filename) => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  downloadData(csvContent, filename, 'text/csv;charset=utf-8;')
}

export const downloadPDF = async (text, filename) => {
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  
  const { jsPDF } = window.jspdf
  const doc = new jsPDF()
  
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(text, 190)
  
  let y = 10
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage()
      y = 10
    }
    doc.text(line, 10, y)
    y += 5
  })
  
  doc.save(filename)
}
