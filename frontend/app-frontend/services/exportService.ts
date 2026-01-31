import { formatCurrency, getTotalIncome, getTotalExpenses, getNetProfit, mockTransactions } from '@/data/transactions-data'
import { getCategoryName } from '@/data/categories-data'

// Export Analytics Data
export const exportAnalyticsData = async (format: 'csv' | 'pdf') => {
  const stats = {
    totalIncome: getTotalIncome(),
    totalExpenses: getTotalExpenses(),
    netProfit: getNetProfit(),
    totalTransactions: mockTransactions.length,
    pendingCount: mockTransactions.filter(t => t.status === 'pending').length,
    completedCount: mockTransactions.filter(t => t.status === 'completed').length
  }

  const profitMargin = stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100) : 0

  if (format === 'csv') {
    const csvData = [
      ['CHILL NUMBERS - ANÁLISIS FINANCIERO'],
      ['Generado el:', new Date().toLocaleDateString('es-ES')],
      [''],
      ['RESUMEN EJECUTIVO'],
      ['Métrica', 'Valor'],
      ['Ingresos Totales', formatCurrency(stats.totalIncome)],
      ['Gastos Totales', formatCurrency(stats.totalExpenses)],
      ['Beneficio Neto', formatCurrency(stats.netProfit)],
      ['Margen de Beneficio', `${profitMargin.toFixed(1)}%`],
      ['Total Transacciones', stats.totalTransactions.toString()],
      ['Transacciones Completadas', stats.completedCount.toString()],
      ['Transacciones Pendientes', stats.pendingCount.toString()],
      [''],
      ['DETALLE DE TRANSACCIONES'],
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Estado'],
      ...mockTransactions.map(t => [
        new Date(t.date).toLocaleDateString('es-ES'),
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        t.description,
        getCategoryName(t.category),
        formatCurrency(t.amount),
        t.status === 'completed' ? 'Completada' : 'Pendiente'
      ]),
      [''],
      ['ANÁLISIS POR CATEGORÍAS'],
      ['Categoría', 'Tipo', 'Cantidad Transacciones', 'Monto Total'],
      ...getAnalyticsByCategory()
    ]
    
    downloadCSV(csvData, `analisis-financiero-${new Date().toISOString().split('T')[0]}.csv`)
  } else {
    // For PDF, we'll create a comprehensive HTML structure
    generateAnalyticsPDF(stats, profitMargin)
  }
}

// Export Report Data
export const exportReportData = async (reportType: string, format: 'csv' | 'pdf') => {
  const timestamp = new Date().toISOString().split('T')[0]
  
  if (format === 'csv') {
    let csvData: string[][] = []
    
    switch (reportType) {
      case 'profit-loss-detailed':
        csvData = generateProfitLossCSV()
        break
      case 'transaction-detail':
        csvData = generateTransactionDetailCSV()
        break
      case 'transaction-summary':
        csvData = generateTransactionSummaryCSV()
        break
      case 'category-breakdown':
        csvData = generateCategoryBreakdownCSV()
        break
      case 'week-close':
        csvData = generateWeekCloseCSV()
        break
      default:
        csvData = generateFinancialSummaryCSV()
    }
    
    downloadCSV(csvData, `reporte-${reportType}-${timestamp}.csv`)
  } else {
    generateReportPDF(reportType)
  }
}

// Helper function to get analytics by category
const getAnalyticsByCategory = () => {
  const categoryStats = new Map()
  
  mockTransactions.forEach(transaction => {
    const categoryName = getCategoryName(transaction.category)
    const key = `${categoryName}-${transaction.type}`
    
    if (!categoryStats.has(key)) {
      categoryStats.set(key, {
        category: categoryName,
        type: transaction.type === 'income' ? 'Ingreso' : 'Gasto',
        count: 0,
        total: 0
      })
    }
    
    const stats = categoryStats.get(key)
    stats.count++
    stats.total += transaction.amount
  })
  
  return Array.from(categoryStats.values()).map(stat => [
    stat.category,
    stat.type,
    stat.count.toString(),
    formatCurrency(stat.total)
  ])
}

// Generate Profit Loss CSV
const generateProfitLossCSV = () => {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0

  return [
    ['CHILL NUMBERS - INFORME DE PÉRDIDAS Y BENEFICIOS'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['RESUMEN FINANCIERO'],
    ['Concepto', 'Monto'],
    ['Ingresos Totales', formatCurrency(totalIncome)],
    ['Gastos Totales', formatCurrency(totalExpenses)],
    ['Beneficio Neto', formatCurrency(netProfit)],
    ['Margen de Beneficio', `${profitMargin.toFixed(1)}%`],
    [''],
    ['DESGLOSE MENSUAL'],
    ['Mes', 'Ingresos', 'Gastos', 'Beneficio', 'Margen'],
    ...generateMonthlyBreakdown()
  ]
}

// Generate Transaction Detail CSV
const generateTransactionDetailCSV = () => {
  return [
    ['CHILL NUMBERS - DETALLE DE TRANSACCIONES'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['RESUMEN'],
    ['Total Transacciones:', mockTransactions.length.toString()],
    ['Transacciones Completadas:', mockTransactions.filter(t => t.status === 'completed').length.toString()],
    ['Transacciones Pendientes:', mockTransactions.filter(t => t.status === 'pending').length.toString()],
    [''],
    ['DETALLE COMPLETO'],
    ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Estado', 'Notas'],
    ...mockTransactions.map(t => [
      new Date(t.date).toLocaleDateString('es-ES'),
      t.type === 'income' ? 'Ingreso' : 'Gasto',
      t.description,
      getCategoryName(t.category),
      formatCurrency(t.amount),
      t.status === 'completed' ? 'Completada' : 'Pendiente',
      t.notes || ''
    ])
  ]
}

// Generate Transaction Summary CSV
const generateTransactionSummaryCSV = () => {
  const incomeTransactions = mockTransactions.filter(t => t.type === 'income')
  const expenseTransactions = mockTransactions.filter(t => t.type === 'expense')
  
  return [
    ['CHILL NUMBERS - RESUMEN DE TRANSACCIONES'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['RESUMEN POR TIPO'],
    ['Tipo', 'Cantidad', 'Monto Total', 'Promedio'],
    ['Ingresos', incomeTransactions.length.toString(), 
     formatCurrency(incomeTransactions.reduce((sum, t) => sum + t.amount, 0)),
     formatCurrency(incomeTransactions.length > 0 ? incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length : 0)],
    ['Gastos', expenseTransactions.length.toString(), 
     formatCurrency(expenseTransactions.reduce((sum, t) => sum + t.amount, 0)),
     formatCurrency(expenseTransactions.length > 0 ? expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length : 0)],
    [''],
    ['RESUMEN POR ESTADO'],
    ['Estado', 'Cantidad', 'Porcentaje'],
    ['Completadas', mockTransactions.filter(t => t.status === 'completed').length.toString(),
     `${((mockTransactions.filter(t => t.status === 'completed').length / mockTransactions.length) * 100).toFixed(1)}%`],
    ['Pendientes', mockTransactions.filter(t => t.status === 'pending').length.toString(),
     `${((mockTransactions.filter(t => t.status === 'pending').length / mockTransactions.length) * 100).toFixed(1)}%`]
  ]
}

// Generate Category Breakdown CSV
const generateCategoryBreakdownCSV = () => {
  const categoryData = getAnalyticsByCategory()
  
  return [
    ['CHILL NUMBERS - ANÁLISIS POR CATEGORÍAS'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['DESGLOSE POR CATEGORÍAS'],
    ['Categoría', 'Tipo', 'Transacciones', 'Monto Total'],
    ...categoryData
  ]
}

// Generate Week Close CSV
const generateWeekCloseCSV = () => {
  return [
    ['CHILL NUMBERS - CIERRE SEMANAL'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['RESUMEN DE CIERRES SEMANALES'],
    ['Semana', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Transacciones', 'Ingresos', 'Gastos', 'Beneficio'],
    // This would be populated with actual week data in a real implementation
    ['Semana 1', '01/01/2024', '07/01/2024', 'Cerrada', '15', formatCurrency(5000), formatCurrency(2000), formatCurrency(3000)],
    ['Semana 2', '08/01/2024', '14/01/2024', 'Cerrada', '12', formatCurrency(4500), formatCurrency(1800), formatCurrency(2700)],
    ['Semana 3', '15/01/2024', '21/01/2024', 'Pendiente', '8', formatCurrency(3200), formatCurrency(1500), formatCurrency(1700)],
    ['Semana 4', '22/01/2024', '28/01/2024', 'Abierta', '10', formatCurrency(4000), formatCurrency(2200), formatCurrency(1800)],
    [''],
    ['RESUMEN MENSUAL'],
    ['Total Transacciones:', '45'],
    ['Total Ingresos:', formatCurrency(16700)],
    ['Total Gastos:', formatCurrency(7500)],
    ['Beneficio Neto:', formatCurrency(9200)],
    ['Semanas Cerradas:', '2 de 4']
  ]
}

// Generate Financial Summary CSV
const generateFinancialSummaryCSV = () => {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  
  return [
    ['CHILL NUMBERS - RESUMEN FINANCIERO'],
    ['Generado el:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['MÉTRICAS PRINCIPALES'],
    ['Métrica', 'Valor'],
    ['Ingresos Totales', formatCurrency(totalIncome)],
    ['Gastos Totales', formatCurrency(totalExpenses)],
    ['Beneficio Neto', formatCurrency(netProfit)],
    ['Margen de Beneficio', `${totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%`],
    ['Total Transacciones', mockTransactions.length.toString()]
  ]
}

// Generate monthly breakdown for profit loss
const generateMonthlyBreakdown = () => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  return months.map((month, index) => {
    // Simulate monthly data distribution
    const monthTransactions = mockTransactions.filter((_, i) => Math.floor(i / 2) === index)
    const monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const monthlyExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const monthlyProfit = monthlyIncome - monthlyExpenses
    const monthlyMargin = monthlyIncome > 0 ? ((monthlyProfit / monthlyIncome) * 100) : 0
    
    return [
      month,
      formatCurrency(monthlyIncome),
      formatCurrency(monthlyExpenses),
      formatCurrency(monthlyProfit),
      `${monthlyMargin.toFixed(1)}%`
    ]
  })
}

// Download CSV function
const downloadCSV = (data: string[][], filename: string) => {
  const csvContent = data.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Generate Analytics PDF (simplified - would need a proper PDF library in production)
const generateAnalyticsPDF = (stats: any, profitMargin: number) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Análisis Financiero - Chill Numbers</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #20B2AA; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #20B2AA; font-size: 24px; font-weight: bold; }
        .date { color: #666; font-size: 14px; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #20B2AA; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .metric-value { font-weight: bold; color: #20B2AA; }
        .positive { color: #10B981; }
        .negative { color: #EF4444; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CHILL NUMBERS</div>
        <h1>Análisis Financiero Completo</h1>
        <div class="date">Generado el ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
      
      <div class="section">
        <div class="section-title">Resumen Ejecutivo</div>
        <table>
          <tr><td>Ingresos Totales</td><td class="metric-value positive">${formatCurrency(stats.totalIncome)}</td></tr>
          <tr><td>Gastos Totales</td><td class="metric-value negative">${formatCurrency(stats.totalExpenses)}</td></tr>
          <tr><td>Beneficio Neto</td><td class="metric-value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(stats.netProfit)}</td></tr>
          <tr><td>Margen de Beneficio</td><td class="metric-value">${profitMargin.toFixed(1)}%</td></tr>
          <tr><td>Total Transacciones</td><td class="metric-value">${stats.totalTransactions}</td></tr>
          <tr><td>Transacciones Completadas</td><td class="metric-value">${stats.completedCount}</td></tr>
          <tr><td>Transacciones Pendientes</td><td class="metric-value">${stats.pendingCount}</td></tr>
        </table>
      </div>
      
      <div class="footer">
        <p>Este reporte ha sido generado automáticamente por Chill Numbers</p>
        <p>Para más información, visite nuestro panel de control</p>
      </div>
    </body>
    </html>
  `
  
  // Open in new window for printing/saving as PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

// Generate Report PDF
const generateReportPDF = (reportType: string) => {
  let title = ''
  let content = ''
  
  switch (reportType) {
    case 'profit-loss-detailed':
      title = 'Informe de Pérdidas y Beneficios'
      content = generateProfitLossPDFContent()
      break
    case 'transaction-detail':
      title = 'Detalle de Transacciones'
      content = generateTransactionDetailPDFContent()
      break
    default:
      title = 'Resumen Financiero'
      content = generateFinancialSummaryPDFContent()
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - Chill Numbers</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #20B2AA; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #20B2AA; font-size: 24px; font-weight: bold; }
        .date { color: #666; font-size: 14px; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { color: #20B2AA; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .positive { color: #10B981; font-weight: bold; }
        .negative { color: #EF4444; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">CHILL NUMBERS</div>
        <h1>${title}</h1>
        <div class="date">Generado el ${new Date().toLocaleDateString('es-ES')}</div>
      </div>
      ${content}
      <div class="footer">
        <p>Este reporte ha sido generado automáticamente por Chill Numbers</p>
      </div>
    </body>
    </html>
  `
  
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

const generateProfitLossPDFContent = () => {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  
  return `
    <div class="section">
      <div class="section-title">Resumen Financiero</div>
      <table>
        <tr><td>Ingresos Totales</td><td class="positive">${formatCurrency(totalIncome)}</td></tr>
        <tr><td>Gastos Totales</td><td class="negative">${formatCurrency(totalExpenses)}</td></tr>
        <tr><td>Beneficio Neto</td><td class="${netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(netProfit)}</td></tr>
      </table>
    </div>
  `
}

const generateTransactionDetailPDFContent = () => {
  return `
    <div class="section">
      <div class="section-title">Detalle de Transacciones</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${mockTransactions.slice(0, 20).map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('es-ES')}</td>
              <td>${t.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
              <td>${t.description}</td>
              <td>${getCategoryName(t.category)}</td>
              <td class="${t.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(t.amount)}</td>
              <td>${t.status === 'completed' ? 'Completada' : 'Pendiente'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

const generateFinancialSummaryPDFContent = () => {
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const netProfit = getNetProfit()
  
  return `
    <div class="section">
      <div class="section-title">Resumen Financiero</div>
      <table>
        <tr><td>Ingresos Totales</td><td class="positive">${formatCurrency(totalIncome)}</td></tr>
        <tr><td>Gastos Totales</td><td class="negative">${formatCurrency(totalExpenses)}</td></tr>
        <tr><td>Beneficio Neto</td><td class="${netProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(netProfit)}</td></tr>
        <tr><td>Total Transacciones</td><td>${mockTransactions.length}</td></tr>
      </table>
    </div>
  `
}

// Export format selection modal
export const showExportModal = (onExport: (format: 'csv' | 'pdf') => void) => {
  const modal = document.createElement('div')
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  modal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Seleccionar Formato de Exportación</h3>
      <p class="text-sm text-gray-600 mb-6">¿En qué formato deseas exportar los datos?</p>
      <div class="flex space-x-3">
        <button id="export-csv" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200">
          CSV (Excel)
        </button>
        <button id="export-pdf" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200">
          PDF
        </button>
        <button id="export-cancel" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200">
          Cancelar
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(modal)
  
  const csvBtn = modal.querySelector('#export-csv')
  const pdfBtn = modal.querySelector('#export-pdf')
  const cancelBtn = modal.querySelector('#export-cancel')
  
  csvBtn?.addEventListener('click', () => {
    onExport('csv')
    document.body.removeChild(modal)
  })
  
  pdfBtn?.addEventListener('click', () => {
    onExport('pdf')
    document.body.removeChild(modal)
  })
  
  cancelBtn?.addEventListener('click', () => {
    document.body.removeChild(modal)
  })
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal)
    }
  })
}