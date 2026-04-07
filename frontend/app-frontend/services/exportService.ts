import * as XLSX from 'xlsx'
import {
  getFinancialSummary, getProfitLoss, getTransactionSummary,
  getCategoryBreakdown, getEmployeeSummary, formatCurrency, type ReportParams
} from '@/services/reportService'
import * as transactionService from '@/services/transactionService'

// ─── Locale detection (no React needed) ──────────────────────────────────────
function getLocale(): 'en' | 'es' {
  if (typeof window === 'undefined') return 'es'
  return window.location.pathname.startsWith('/en') ? 'en' : 'es'
}

// ─── Labels dictionary ────────────────────────────────────────────────────────
interface L {
  // common
  generatedOn: string; period: string; year: string; transactions: string
  income: string; expenses: string; netProfit: string; netLoss: string
  profitMargin: string; margin: string; total: string; detail: string
  completed: string; pending: string; open: string; closed: string
  positive: string; negative: string; average: string; showing: string
  // period labels
  currentWeek: string; yearLabel: (y: number) => string
  monthLabel: (y: number, m: number) => string
  weekRange: (start: string, end: string) => string
  // financial summary
  financialSummary: string; executiveSummary: string
  totalIncome: string; totalExpenses: string
  incomeByCategory: string; expensesByCategory: string
  category: string; amount: string; pctTotal: string
  noIncomeInPeriod: string; noExpensesInPeriod: string
  reportNote: string; distributionByCategory: string
  // profit & loss
  profitLoss: string; annualSummary: string; monthlyBreakdown: string
  month: string; result: string
  // transaction summary
  txSummary: string; generalSummary: string; txStatus: string
  txCompleted: string; txPending: string; completedIncome: string
  completedExpenses: string; pendingIncome: string; pendingExpenses: string
  recentTransactions: string; date: string; type: string
  description: string; categoryCol: string; status: string
  noTxInPeriod: string; showingOf: (shown: number, total: number) => string
  // category breakdown
  categoryBreakdown: string; incomeCategories: string; expenseCategories: string
  // employee summary
  employeeSummary: string; generalSummaryEmp: string
  activeEmployees: string; inactiveEmployees: string
  annualPayroll: string; avgSalary: string; byPayrollType: string
  payrollType: string; employeesCount: string; totalSalary: string
  // transactions list
  txList: string; account: string
  // analytics
  analyticsReport: string; executiveSummaryAnalytics: string
  indicator: string; value: string; detailCol: string
  txCompleted2: string; txPending2: string
  employees: string; activeEmp: string; annualPayrollTotal: string
  avgSalaryLabel: string; txDetail: string; categoryAnalysis: string
  top5Income: string; top5Expenses: string; weeklyClosures: string
  staffSummary: string; monthlyPerformance: string; noData: string
  // week close
  weekClose: string; monthSummary: string; monthIncome: string
  monthExpenses: string; netProfit2: string; totalWeeks: string
  closedWeeks: string; pendingWeeks: string; openWeeks: string
  weekDetail: string; weekLabel: (n: number) => string
  periodCol: string; incomesCol: string; expensesCol: string
  profitCol: string; txCount: string; statusCol: string; closedOn: string
  totals: string; weeklyCloseInfo: string; weeklyCloseInfoBody: string
  allUpToDate: string; pendingCount: (n: number) => string
  // chart legend
  legendIncome: string; legendExpenses: string; legendProfit: string
  // modal
  exportTitle: string; exportSubtitle: string; excelBtn: string; cancelBtn: string
  // openPDF footer
  footerBrand: string; footerReport: string
}

const LABELS: Record<'en' | 'es', L> = {
  en: {
    generatedOn: 'Generated on', period: 'Period', year: 'Year',
    transactions: 'transactions', income: 'Income', expenses: 'Expenses',
    netProfit: 'Net Profit', netLoss: 'Net Loss', profitMargin: 'Profit Margin',
    margin: 'Margin', total: 'Total', detail: 'Detail',
    completed: 'Completed', pending: 'Pending', open: 'Open', closed: 'Closed',
    positive: 'Positive result', negative: 'Negative result',
    average: 'Average', showing: 'Showing',
    currentWeek: 'Current week',
    yearLabel: (y) => `Year ${y}`,
    monthLabel: (y, m) => new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    weekRange: (s, e) => `Week — ${s} to ${e}`,
    financialSummary: 'INCOME STATEMENT', executiveSummary: 'EXECUTIVE SUMMARY',
    totalIncome: 'Total Income', totalExpenses: 'Total Expenses',
    incomeByCategory: 'INCOME BY CATEGORY', expensesByCategory: 'EXPENSES BY CATEGORY',
    category: 'Category', amount: 'Amount', pctTotal: '% of Total',
    noIncomeInPeriod: 'No income in this period',
    noExpensesInPeriod: 'No expenses in this period',
    reportNote: 'This report includes all transactions recorded in the selected period. Percentages are calculated over total income or expenses as applicable.',
    distributionByCategory: 'Distribution by Category',
    profitLoss: 'PROFIT & LOSS', annualSummary: 'ANNUAL SUMMARY',
    monthlyBreakdown: 'MONTHLY BREAKDOWN', month: 'Month', result: 'Result',
    txSummary: 'TRANSACTION SUMMARY', generalSummary: 'GENERAL SUMMARY',
    txStatus: 'TRANSACTION STATUS', txCompleted: 'Completed', txPending: 'Pending',
    completedIncome: 'Completed income', completedExpenses: 'Completed expenses',
    pendingIncome: 'Pending income', pendingExpenses: 'Pending expenses',
    recentTransactions: 'Recent Transactions', date: 'Date', type: 'Type',
    description: 'Description', categoryCol: 'Category', status: 'Status',
    noTxInPeriod: 'No transactions in this period',
    showingOf: (s, t) => `Showing ${s} of ${t}`,
    categoryBreakdown: 'CATEGORY BREAKDOWN',
    incomeCategories: 'Income Categories', expenseCategories: 'Expense Categories',
    employeeSummary: 'EMPLOYEE SUMMARY', generalSummaryEmp: 'GENERAL SUMMARY',
    activeEmployees: 'Active Employees', inactiveEmployees: 'Inactive Employees',
    annualPayroll: 'Total Annual Payroll', avgSalary: 'Average Salary',
    byPayrollType: 'BY PAYROLL TYPE', payrollType: 'Payroll Type',
    employeesCount: 'Employees', totalSalary: 'Total Salary',
    txList: 'TRANSACTION LIST', account: 'Account',
    analyticsReport: 'COMPLETE FINANCIAL ANALYSIS',
    executiveSummaryAnalytics: 'EXECUTIVE SUMMARY',
    indicator: 'Indicator', value: 'Value', detailCol: 'Detail',
    txCompleted2: 'Completed Transactions', txPending2: 'Pending Transactions',
    employees: 'EMPLOYEES', activeEmp: 'Active Employees',
    annualPayrollTotal: 'Total Annual Payroll', avgSalaryLabel: 'Average Salary',
    txDetail: 'TRANSACTION DETAIL', categoryAnalysis: 'CATEGORY ANALYSIS',
    top5Income: 'Top 5 Income', top5Expenses: 'Top 5 Expenses',
    weeklyClosures: 'Weekly Closures', staffSummary: 'Staff Summary',
    monthlyPerformance: 'Monthly Performance', noData: 'No data',
    weekClose: 'WEEKLY CLOSE', monthSummary: 'MONTH SUMMARY',
    monthIncome: 'Month Income', monthExpenses: 'Month Expenses',
    netProfit2: 'Net Profit', totalWeeks: 'Total Weeks',
    closedWeeks: 'Closed Weeks', pendingWeeks: 'Pending Weeks', openWeeks: 'Open Weeks',
    weekDetail: 'WEEK DETAIL',
    weekLabel: (n) => `Week ${n}`, periodCol: 'Period',
    incomesCol: 'Income', expensesCol: 'Expenses', profitCol: 'Profit',
    txCount: 'Transactions', statusCol: 'Status', closedOn: 'Closed on',
    totals: 'TOTALS', weeklyCloseInfo: 'What is the Weekly Close?',
    weeklyCloseInfoBody: 'The weekly close locks transactions for a specific week, preventing accidental modifications and maintaining the integrity of financial records. Closed weeks appear in green, pending in yellow, and open in blue.',
    allUpToDate: '✅ All up to date',
    pendingCount: (n) => `⚠️ ${n} week(s) pending`,
    legendIncome: 'Income', legendExpenses: 'Expenses', legendProfit: 'Profit',
    exportTitle: 'Export Report', exportSubtitle: 'Select export format',
    excelBtn: 'Excel (.xlsx)', cancelBtn: 'Cancel',
    footerBrand: 'Chill Numbers • Financial Report', footerReport: 'Generated on',
  },
  es: {
    generatedOn: 'Generado el', period: 'Período', year: 'Año',
    transactions: 'transacciones', income: 'Ingresos', expenses: 'Gastos',
    netProfit: 'Beneficio Neto', netLoss: 'Pérdida Neta', profitMargin: 'Margen de Beneficio',
    margin: 'Margen', total: 'Total', detail: 'Detalle',
    completed: 'Completada', pending: 'Pendiente', open: 'Abierta', closed: 'Cerrada',
    positive: 'Resultado positivo', negative: 'Resultado negativo',
    average: 'Promedio', showing: 'Mostrando',
    currentWeek: 'Semana actual',
    yearLabel: (y) => `Año ${y}`,
    monthLabel: (y, m) => { const s = new Date(y, m - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); return s.charAt(0).toUpperCase() + s.slice(1) },
    weekRange: (s, e) => `Semana — ${s} al ${e}`,
    financialSummary: 'ESTADO DE RESULTADOS', executiveSummary: 'RESUMEN EJECUTIVO',
    totalIncome: 'Ingresos Totales', totalExpenses: 'Gastos Totales',
    incomeByCategory: 'INGRESOS POR CATEGORÍA', expensesByCategory: 'GASTOS POR CATEGORÍA',
    category: 'Categoría', amount: 'Monto', pctTotal: '% del Total',
    noIncomeInPeriod: 'Sin ingresos en este período',
    noExpensesInPeriod: 'Sin gastos en este período',
    reportNote: 'Este reporte incluye todas las transacciones registradas en el período seleccionado. Los porcentajes se calculan sobre el total de ingresos o gastos según corresponda.',
    distributionByCategory: 'Distribución por Categorías',
    profitLoss: 'PÉRDIDAS Y GANANCIAS', annualSummary: 'RESUMEN ANUAL',
    monthlyBreakdown: 'DESGLOSE MENSUAL', month: 'Mes', result: 'Resultado',
    txSummary: 'RESUMEN DE TRANSACCIONES', generalSummary: 'RESUMEN GENERAL',
    txStatus: 'ESTADO DE TRANSACCIONES', txCompleted: 'Completadas', txPending: 'Pendientes',
    completedIncome: 'Ingresos completados', completedExpenses: 'Gastos completados',
    pendingIncome: 'Ingresos pendientes', pendingExpenses: 'Gastos pendientes',
    recentTransactions: 'Transacciones Recientes', date: 'Fecha', type: 'Tipo',
    description: 'Descripción', categoryCol: 'Categoría', status: 'Estado',
    noTxInPeriod: 'Sin transacciones en este período',
    showingOf: (s, t) => `Mostrando ${s} de ${t}`,
    categoryBreakdown: 'DESGLOSE POR CATEGORÍAS',
    incomeCategories: 'Categorías de Ingresos', expenseCategories: 'Categorías de Gastos',
    employeeSummary: 'RESUMEN DE EMPLEADOS', generalSummaryEmp: 'RESUMEN GENERAL',
    activeEmployees: 'Empleados Activos', inactiveEmployees: 'Empleados Inactivos',
    annualPayroll: 'Nómina Anual Total', avgSalary: 'Salario Promedio',
    byPayrollType: 'POR TIPO DE NÓMINA', payrollType: 'Tipo de Nómina',
    employeesCount: 'Empleados', totalSalary: 'Salario Total',
    txList: 'LISTADO DE TRANSACCIONES', account: 'Cuenta',
    analyticsReport: 'ANÁLISIS FINANCIERO COMPLETO',
    executiveSummaryAnalytics: 'RESUMEN EJECUTIVO',
    indicator: 'Indicador', value: 'Valor', detailCol: 'Detalle',
    txCompleted2: 'Transacciones Completadas', txPending2: 'Transacciones Pendientes',
    employees: 'EMPLEADOS', activeEmp: 'Empleados Activos',
    annualPayrollTotal: 'Nómina Total Anual', avgSalaryLabel: 'Salario Promedio',
    txDetail: 'DETALLE DE TRANSACCIONES', categoryAnalysis: 'ANÁLISIS POR CATEGORÍAS',
    top5Income: 'Top 5 Ingresos', top5Expenses: 'Top 5 Gastos',
    weeklyClosures: 'Cierres Semanales', staffSummary: 'Resumen de Personal',
    monthlyPerformance: 'Rendimiento Mensual', noData: 'Sin datos',
    weekClose: 'CIERRE SEMANAL', monthSummary: 'RESUMEN DEL MES',
    monthIncome: 'Ingresos del Mes', monthExpenses: 'Gastos del Mes',
    netProfit2: 'Beneficio Neto', totalWeeks: 'Total Semanas',
    closedWeeks: 'Semanas Cerradas', pendingWeeks: 'Semanas Pendientes', openWeeks: 'Semanas Abiertas',
    weekDetail: 'DETALLE POR SEMANA',
    weekLabel: (n) => `Semana ${n}`, periodCol: 'Período',
    incomesCol: 'Ingresos', expensesCol: 'Gastos', profitCol: 'Beneficio',
    txCount: 'Transacciones', statusCol: 'Estado', closedOn: 'Cerrada el',
    totals: 'TOTALES', weeklyCloseInfo: '¿Qué es el Cierre Semanal?',
    weeklyCloseInfoBody: 'El cierre semanal bloquea las transacciones de una semana específica, evitando modificaciones accidentales y manteniendo la integridad de los registros financieros. Las semanas cerradas aparecen en verde, las pendientes en amarillo y las abiertas en azul.',
    allUpToDate: '✅ Todo al día',
    pendingCount: (n) => `⚠️ ${n} semana(s) pendiente(s)`,
    legendIncome: 'Ingresos', legendExpenses: 'Gastos', legendProfit: 'Beneficio',
    exportTitle: 'Exportar Reporte', exportSubtitle: 'Selecciona el formato de exportación',
    excelBtn: 'Excel (.xlsx)', cancelBtn: 'Cancelar',
    footerBrand: 'Chill Numbers • Reporte Financiero', footerReport: 'Generado el',
  },
}

function getL(): L { return LABELS[getLocale()] }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toLocaleDateString()
const filename = (name: string, ext: string) => `${name}-${new Date().toISOString().split('T')[0]}.${ext}`

const BRAND_COLOR = '1A9E96', HEADER_COLOR = '2D3748'

function applyHeaderStyle(ws: XLSX.WorkSheet, range: string, bgColor = HEADER_COLOR) {
  const ref = XLSX.utils.decode_range(range)
  for (let C = ref.s.c; C <= ref.e.c; C++) {
    const cell = XLSX.utils.encode_cell({ r: ref.s.r, c: C })
    if (!ws[cell]) ws[cell] = { v: '', t: 's' }
    ws[cell].s = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: bgColor } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } }
  }
}

function titleRow(ws: XLSX.WorkSheet, row: number, cols: number, text: string) {
  const cell = XLSX.utils.encode_cell({ r: row, c: 0 })
  ws[cell] = { v: text, t: 's', s: { font: { bold: true, sz: 14, color: { rgb: BRAND_COLOR } } } }
  ws['!merges'] = ws['!merges'] || []
  ws['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: cols - 1 } })
}

function getPeriodLabel(l: L, period: string | undefined, year: number, month: number, start?: string, end?: string): string {
  if (period === 'week' && start && end) return l.weekRange(start, end)
  if (period === 'week') return l.currentWeek
  if (period === 'month') return l.monthLabel(year, month)
  return l.yearLabel(year)
}

const PDF_STYLES = `
  @page { margin: 15mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; color: #1a202c; font-size: 11px; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #1a9e96; margin-bottom: 22px; }
  .brand-block .brand { font-size: 20px; font-weight: 900; color: #1a9e96; letter-spacing: -0.5px; }
  .brand-block .report-name { font-size: 14px; font-weight: 700; color: #2d3748; margin-top: 2px; }
  .brand-block .period-tag { display: inline-block; margin-top: 5px; background: #e6fffa; color: #1a9e96; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; border: 1px solid #81e6d9; }
  .meta { text-align: right; font-size: 10px; color: #718096; }
  .meta strong { display: block; font-size: 12px; color: #2d3748; margin-top: 2px; }
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .section-dot { width: 4px; height: 18px; background: #1a9e96; border-radius: 2px; flex-shrink: 0; }
  .section-title { font-size: 12px; font-weight: 700; color: #2d3748; }
  .section-sub { font-size: 10px; color: #718096; margin-left: auto; }
  .kpi-grid { display: grid; gap: 10px; margin-bottom: 18px; }
  .kpi-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .kpi-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; position: relative; overflow: hidden; }
  .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #e2e8f0; }
  .kpi.green::before { background: #38a169; } .kpi.red::before { background: #e53e3e; }
  .kpi.blue::before { background: #3182ce; } .kpi.teal::before { background: #1a9e96; }
  .kpi.purple::before { background: #805ad5; } .kpi.orange::before { background: #dd6b20; }
  .kpi-label { font-size: 9px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-value { font-size: 17px; font-weight: 800; margin-top: 4px; line-height: 1; }
  .kpi-sub { font-size: 9px; color: #a0aec0; margin-top: 3px; }
  .green .kpi-value { color: #276749; } .red .kpi-value { color: #9b2c2c; }
  .blue .kpi-value { color: #2b6cb0; } .teal .kpi-value { color: #1a9e96; }
  .purple .kpi-value { color: #553c9a; } .orange .kpi-value { color: #c05621; }
  .chart-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; }
  .chart-box-title { font-size: 11px; font-weight: 700; color: #2d3748; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead tr { background: #2d3748; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 600; color: #fff; font-size: 10px; }
  thead th.r { text-align: right; }
  tbody tr:nth-child(even) { background: #f7fafc; }
  td { padding: 7px 10px; border-bottom: 1px solid #edf2f7; color: #2d3748; }
  td.r { text-align: right; } td.c { text-align: center; }
  .pos { color: #276749; font-weight: 600; } .neg { color: #9b2c2c; font-weight: 600; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .badge-green { background: #c6f6d5; color: #276749; } .badge-blue { background: #bee3f8; color: #2b6cb0; }
  .badge-yellow { background: #fefcbf; color: #744210; } .badge-red { background: #fed7d7; color: #9b2c2c; }
  .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #a0aec0; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .section { page-break-inside: avoid; } }
`

function openPDF(title: string, body: string, subtitle = '') {
  const l = getL()
  const w = window.open('', '_blank')
  if (!w) return
  const header = `
    <div class="header">
      <div class="brand-block">
        <div class="brand">CHILL NUMBERS</div>
        <div class="report-name">${title}</div>
        ${subtitle ? `<span class="period-tag">${subtitle}</span>` : ''}
      </div>
      <div class="meta">${l.generatedOn}<strong>${today()}</strong></div>
    </div>`
  const footer = `<div class="footer"><span>${l.footerBrand}</span><span>${today()}</span></div>`
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - Chill Numbers</title><style>${PDF_STYLES}</style></head><body>${header}${body}${footer}</body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 500)
}

// ─── FINANCIAL SUMMARY ───────────────────────────────────────────────────────
export async function exportFinancialSummary(params: ReportParams, format: 'excel' | 'pdf') {
  const l = getL()
  const data = await getFinancialSummary(params)
  const income: number   = data.totalIncome ?? 0
  const expenses: number = data.totalExpenses ?? 0
  const net              = income - expenses
  const margin           = income > 0 ? ((net / income) * 100).toFixed(1) : '0.0'
  const incomeBreakdown: any[]  = data.incomeBreakdown  ?? []
  const expenseBreakdown: any[] = data.expenseBreakdown ?? []
  const txCount: number  = data.transactionCount ?? 0
  const incomeCount: number  = data.incomeCount  ?? 0
  const expenseCount: number = data.expenseCount ?? 0
  const periodLabel = getPeriodLabel(l, params.period, params.year ?? new Date().getFullYear(), params.month ?? 1)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const s1: any[][] = [
      [`CHILL NUMBERS — ${l.financialSummary}`],
      [`${l.period}: ${periodLabel}  |  ${l.generatedOn}: ${today()}`],
      [],
      [l.executiveSummary],
      [l.indicator, l.value, l.transactions],
      [l.totalIncome, income, incomeCount],
      [l.totalExpenses, expenses, expenseCount],
      [l.netProfit, net, txCount],
      [`${l.profitMargin} (%)`, parseFloat(margin), ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:30},{wch:18},{wch:16}]
    titleRow(ws1, 0, 3, `CHILL NUMBERS — ${l.financialSummary}`)
    applyHeaderStyle(ws1, 'A5:C5')
    XLSX.utils.book_append_sheet(wb, ws1, l.executiveSummary.substring(0, 31))

    const s2: any[][] = [
      [l.incomeByCategory],
      [`${l.period}: ${periodLabel}`],
      [],
      [l.incomeByCategory],
      [l.category, l.amount, l.pctTotal, l.transactions],
    ]
    incomeBreakdown.forEach((c: any) => s2.push([c.categoryName, c.amount, c.percentage, c.transactionCount]))
    s2.push([], [l.expensesByCategory], [l.category, l.amount, l.pctTotal, l.transactions])
    expenseBreakdown.forEach((c: any) => s2.push([c.categoryName, c.amount, c.percentage, c.transactionCount]))
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:28},{wch:16},{wch:14},{wch:14}]
    titleRow(ws2, 0, 4, l.incomeByCategory)
    applyHeaderStyle(ws2, 'A5:D5')
    applyHeaderStyle(ws2, `A${7 + incomeBreakdown.length}:D${7 + incomeBreakdown.length}`, BRAND_COLOR)
    XLSX.utils.book_append_sheet(wb, ws2, l.category.substring(0, 31))
    XLSX.writeFile(wb, filename('financial-summary', 'xlsx'))

  } else {
    const chartData = [...incomeBreakdown.slice(0, 6).map((c: any) => ({ label: c.categoryName.substring(0, 8), income: c.amount, expense: 0 })),
      ...expenseBreakdown.slice(0, 6).map((c: any) => ({ label: c.categoryName.substring(0, 8), income: 0, expense: c.amount }))]
    const chart = chartData.length > 0 ? svgBarChart(chartData, l.distributionByCategory, false) : ''

    const incomeRows = incomeBreakdown.slice(0, 10).map((c: any) =>
      `<tr><td>${c.categoryName}</td><td class="c">${c.transactionCount}</td><td class="r pos">+${formatCurrency(c.amount)}</td><td class="r">${c.percentage}%</td></tr>`
    ).join('') || `<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">${l.noIncomeInPeriod}</td></tr>`

    const expenseRows = expenseBreakdown.slice(0, 10).map((c: any) =>
      `<tr><td>${c.categoryName}</td><td class="c">${c.transactionCount}</td><td class="r neg">-${formatCurrency(c.amount)}</td><td class="r">${c.percentage}%</td></tr>`
    ).join('') || `<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">${l.noExpensesInPeriod}</td></tr>`

    const netClass = net >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">${l.totalIncome}</div><div class="kpi-value">${formatCurrency(income)}</div><div class="kpi-sub">${incomeCount} ${l.transactions}</div></div>
        <div class="kpi red"><div class="kpi-label">${l.totalExpenses}</div><div class="kpi-value">${formatCurrency(expenses)}</div><div class="kpi-sub">${expenseCount} ${l.transactions}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${net >= 0 ? l.netProfit : l.netLoss}</div><div class="kpi-value">${formatCurrency(Math.abs(net))}</div><div class="kpi-sub">${net >= 0 ? l.positive : l.negative}</div></div>
        <div class="kpi teal"><div class="kpi-label">${l.margin}</div><div class="kpi-value">${margin}%</div><div class="kpi-sub">${txCount} ${l.transactions}</div></div>
      </div>
      ${chart}
      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.incomeByCategory}</div><div class="section-sub">${formatCurrency(income)}</div></div>
          <table><thead><tr><th>${l.category}</th><th class="c">Txs</th><th class="r">${l.amount}</th><th class="r">%</th></tr></thead><tbody>${incomeRows}</tbody></table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.expensesByCategory}</div><div class="section-sub">${formatCurrency(expenses)}</div></div>
          <table><thead><tr><th>${l.category}</th><th class="c">Txs</th><th class="r">${l.amount}</th><th class="r">%</th></tr></thead><tbody>${expenseRows}</tbody></table>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.reportNote.split('.')[0]}</div></div>
        <p style="font-size:10px;color:#718096;line-height:1.6">${l.reportNote}</p>
      </div>`
    openPDF(l.financialSummary, body, periodLabel)
  }
}

// ─── PROFIT & LOSS ───────────────────────────────────────────────────────────
export async function exportProfitLoss(params: ReportParams, format: 'excel' | 'pdf') {
  const l = getL()
  const data = await getProfitLoss(params)
  const income: number   = data.totalIncome ?? 0
  const expenses: number = data.totalExpenses ?? 0
  const net = income - expenses
  const months: any[] = data.monthlyData ?? data.byMonth ?? []
  const yr = params.year ?? new Date().getFullYear()

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      [`CHILL NUMBERS — ${l.profitLoss}`],
      [`${l.year}: ${yr}  |  ${l.generatedOn}: ${today()}`],
      [],
      [l.annualSummary],
      [l.indicator, l.value],
      [l.totalIncome, income], [l.totalExpenses, expenses], [l.netProfit, net],
      [`${l.margin} (%)`, income > 0 ? parseFloat(((net / income) * 100).toFixed(2)) : 0],
    ]
    if (months.length > 0) {
      rows.push([], [l.monthlyBreakdown], [l.month, l.income, l.expenses, l.result, `${l.margin} (%)`])
      months.forEach((m: any) => {
        const mNet = (m.income ?? 0) - (m.expenses ?? 0)
        rows.push([m.monthName ?? m.month, m.income ?? 0, m.expenses ?? 0, mNet,
          (m.income ?? 0) > 0 ? parseFloat(((mNet / (m.income ?? 1)) * 100).toFixed(2)) : 0])
      })
    }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:20},{wch:16},{wch:16},{wch:16},{wch:12}]
    titleRow(ws, 0, 5, `CHILL NUMBERS — ${l.profitLoss}`)
    applyHeaderStyle(ws, 'A5:B5')
    if (months.length > 0) applyHeaderStyle(ws, 'A12:E12')
    XLSX.utils.book_append_sheet(wb, ws, 'P&L')
    XLSX.writeFile(wb, filename('profit-loss', 'xlsx'))
  } else {
    const kpis = `<div class="kpi-grid kpi-grid-3">
      <div class="kpi green"><div class="kpi-label">${l.income}</div><div class="kpi-value">${formatCurrency(income)}</div></div>
      <div class="kpi red"><div class="kpi-label">${l.expenses}</div><div class="kpi-value">${formatCurrency(expenses)}</div></div>
      <div class="kpi ${net >= 0 ? 'blue' : 'red'}"><div class="kpi-label">${l.netProfit}</div><div class="kpi-value">${formatCurrency(net)}</div></div>
    </div>`
    openPDF(l.profitLoss, kpis, l.yearLabel(yr))
  }
}

// ─── TRANSACTION SUMMARY ─────────────────────────────────────────────────────
export async function exportTransactionSummary(params: ReportParams, format: 'excel' | 'pdf') {
  const l = getL()
  const data = await getTransactionSummary(params)
  const total: number     = data.totalTransactions ?? 0
  const income: number    = data.totalIncome       ?? 0
  const expenses: number  = data.totalExpenses     ?? 0
  const net               = income - expenses
  const pending: number   = data.pendingCount      ?? 0
  const completed: number = data.completedCount    ?? (total - pending)
  const incomeCount: number  = data.incomeCount    ?? 0
  const expenseCount: number = data.expenseCount   ?? 0
  const txs: any[]        = data.transactions      ?? []
  const profitMargin = income > 0 ? ((net / income) * 100).toFixed(1) : '0.0'
  const avgIncome    = incomeCount  > 0 ? income   / incomeCount  : 0
  const avgExpense   = expenseCount > 0 ? expenses / expenseCount : 0
  const periodLabel  = getPeriodLabel(l, params.period, params.year ?? new Date().getFullYear(), params.month ?? 1)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const s1: any[][] = [
      [`CHILL NUMBERS — ${l.txSummary}`],
      [`${l.period}: ${periodLabel}  |  ${l.generatedOn}: ${today()}`],
      [],
      [l.generalSummary],
      [l.indicator, l.value, l.detail],
      [l.transactions, total, `${completed} ${l.completed.toLowerCase()}, ${pending} ${l.pending.toLowerCase()}`],
      [l.totalIncome, income, `${incomeCount} ${l.transactions} · ${l.average}: ${formatCurrency(avgIncome)}`],
      [l.totalExpenses, expenses, `${expenseCount} ${l.transactions} · ${l.average}: ${formatCurrency(avgExpense)}`],
      [l.netProfit, net, net >= 0 ? l.positive : l.negative],
      [`${l.profitMargin} (%)`, parseFloat(profitMargin), ''],
      [],
      [l.txStatus],
      [l.status, l.transactions, l.pctTotal],
      [l.txCompleted, completed, total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0],
      [l.txPending, pending, total > 0 ? parseFloat(((pending / total) * 100).toFixed(1)) : 0],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:32},{wch:18},{wch:36}]
    titleRow(ws1, 0, 3, `CHILL NUMBERS — ${l.txSummary}`)
    applyHeaderStyle(ws1, 'A5:C5')
    applyHeaderStyle(ws1, 'A13:C13')
    XLSX.utils.book_append_sheet(wb, ws1, l.generalSummary.substring(0, 31))

    const s2: any[][] = [
      [l.txDetail],
      [`${l.period}: ${periodLabel}`],
      [],
      [l.date, l.type, l.description, l.categoryCol, l.amount, l.status],
    ]
    txs.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).forEach((tx: any) => {
      s2.push([tx.date ?? '', tx.type === 1 ? l.income : l.expenses,
        tx.description ?? '', tx.categoryName ?? '', tx.amount ?? 0,
        tx.status === 0 ? l.completed : l.pending])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:14},{wch:12},{wch:36},{wch:22},{wch:14},{wch:12}]
    titleRow(ws2, 0, 6, l.txDetail)
    applyHeaderStyle(ws2, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws2, l.txDetail.substring(0, 31))
    XLSX.writeFile(wb, filename('transaction-summary', 'xlsx'))

  } else {
    const completedIncome   = txs.filter((r: any) => r.type === 1 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
    const completedExpenses = txs.filter((r: any) => r.type === 2 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
    const pendingIncome     = txs.filter((r: any) => r.type === 1 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)
    const pendingExpenses   = txs.filter((r: any) => r.type === 2 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)

    const recentRows = txs.slice(0, 20).map((tx: any) =>
      `<tr>
        <td>${tx.date ?? ''}</td>
        <td><span class="badge ${tx.type === 1 ? 'badge-green' : 'badge-red'}">${tx.type === 1 ? l.income : l.expenses}</span></td>
        <td>${(tx.description ?? '').substring(0, 30)}</td>
        <td>${tx.categoryName ?? ''}</td>
        <td class="r ${tx.type === 1 ? 'pos' : 'neg'}">${tx.type === 1 ? '+' : '-'}${formatCurrency(tx.amount ?? 0)}</td>
        <td class="c"><span class="badge ${tx.status === 0 ? 'badge-blue' : 'badge-yellow'}">${tx.status === 0 ? l.completed : l.pending}</span></td>
      </tr>`
    ).join('') || `<tr><td colspan="6" style="text-align:center;color:#a0aec0;padding:12px">${l.noTxInPeriod}</td></tr>`

    const netClass = net >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">${l.totalIncome}</div><div class="kpi-value">${formatCurrency(income)}</div><div class="kpi-sub">${incomeCount} txs · ${l.average} ${formatCurrency(avgIncome)}</div></div>
        <div class="kpi red"><div class="kpi-label">${l.totalExpenses}</div><div class="kpi-value">${formatCurrency(expenses)}</div><div class="kpi-sub">${expenseCount} txs · ${l.average} ${formatCurrency(avgExpense)}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${net >= 0 ? l.netProfit : l.netLoss}</div><div class="kpi-value">${formatCurrency(Math.abs(net))}</div><div class="kpi-sub">${l.margin}: ${profitMargin}%</div></div>
        <div class="kpi blue"><div class="kpi-label">${l.transactions}</div><div class="kpi-value">${total}</div><div class="kpi-sub">${completed} ${l.completed.toLowerCase()} · ${pending} ${l.pending.toLowerCase()}</div></div>
      </div>
      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.txCompleted}</div><span class="badge badge-blue">${completed}</span></div>
          <table><thead><tr><th>${l.indicator}</th><th class="c">${l.transactions}</th><th class="r">${l.amount}</th></tr></thead>
          <tbody>
            <tr><td>${l.completedIncome}</td><td class="c">${txs.filter((r:any)=>r.type===1&&r.status===0).length}</td><td class="r pos">+${formatCurrency(completedIncome)}</td></tr>
            <tr><td>${l.completedExpenses}</td><td class="c">${txs.filter((r:any)=>r.type===2&&r.status===0).length}</td><td class="r neg">-${formatCurrency(completedExpenses)}</td></tr>
          </tbody></table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.txPending}</div><span class="badge badge-yellow">${pending}</span></div>
          <table><thead><tr><th>${l.indicator}</th><th class="c">${l.transactions}</th><th class="r">${l.amount}</th></tr></thead>
          <tbody>
            <tr><td>${l.pendingIncome}</td><td class="c">${txs.filter((r:any)=>r.type===1&&r.status===1).length}</td><td class="r pos">+${formatCurrency(pendingIncome)}</td></tr>
            <tr><td>${l.pendingExpenses}</td><td class="c">${txs.filter((r:any)=>r.type===2&&r.status===1).length}</td><td class="r neg">-${formatCurrency(pendingExpenses)}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.recentTransactions}</div>
          <div class="section-sub">${txs.length > 20 ? l.showingOf(20, txs.length) : `${txs.length} ${l.transactions}`}</div>
        </div>
        <table><thead><tr><th>${l.date}</th><th>${l.type}</th><th>${l.description}</th><th>${l.categoryCol}</th><th class="r">${l.amount}</th><th class="c">${l.status}</th></tr></thead>
        <tbody>${recentRows}</tbody></table>
      </div>`
    openPDF(l.txSummary, body, periodLabel)
  }
}

// ─── CATEGORY BREAKDOWN ──────────────────────────────────────────────────────
export async function exportCategoryBreakdown(params: ReportParams, format: 'excel' | 'pdf') {
  const l = getL()
  const data = await getCategoryBreakdown(params)
  const categories: any[] = Array.isArray(data) ? data : (data.categories ?? data.items ?? [])
  const grandTotal = categories.reduce((s: number, c: any) => s + (c.total ?? c.amount ?? 0), 0)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      [`CHILL NUMBERS — ${l.categoryBreakdown}`],
      [`${l.generatedOn}: ${today()}`],
      [],
      [l.category, l.type, l.transactions, l.amount, l.pctTotal],
    ]
    categories.forEach((c: any) => {
      const amt = c.total ?? c.amount ?? 0
      rows.push([c.categoryName ?? c.category ?? c.name,
        c.type === 0 ? l.income : l.expenses,
        c.count ?? 0, amt,
        grandTotal > 0 ? parseFloat(((amt / grandTotal) * 100).toFixed(2)) : 0])
    })
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:26},{wch:12},{wch:16},{wch:16},{wch:12}]
    titleRow(ws, 0, 5, `CHILL NUMBERS — ${l.categoryBreakdown}`)
    applyHeaderStyle(ws, 'A4:E4')
    XLSX.utils.book_append_sheet(wb, ws, l.category.substring(0, 31))
    XLSX.writeFile(wb, filename('category-breakdown', 'xlsx'))
  } else {
    const rows = categories.map((c: any) => {
      const amt = c.total ?? c.amount ?? 0
      const pct = grandTotal > 0 ? ((amt / grandTotal) * 100).toFixed(1) : '0.0'
      return `<tr><td>${c.categoryName ?? c.category ?? c.name}</td><td>${c.type === 0 ? l.income : l.expenses}</td><td class="c">${c.count ?? 0}</td><td class="r ${c.type === 0 ? 'pos' : 'neg'}">${formatCurrency(amt)}</td><td class="r">${pct}%</td></tr>`
    }).join('')
    openPDF(l.categoryBreakdown, `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">${l.categoryBreakdown}</div></div><table><thead><tr><th>${l.category}</th><th>${l.type}</th><th class="c">${l.transactions}</th><th class="r">${l.amount}</th><th class="r">%</th></tr></thead><tbody>${rows}</tbody></table></div>`)
  }
}

// ─── EMPLOYEE SUMMARY ────────────────────────────────────────────────────────
export async function exportEmployeeSummary(format: 'excel' | 'pdf') {
  const l = getL()
  const data = await getEmployeeSummary()
  const active: number   = data.activeEmployees ?? 0
  const inactive: number = data.inactiveEmployees ?? 0
  const payroll: number  = data.totalAnnualPayroll ?? 0
  const avg: number      = data.averageSalary ?? (active > 0 ? payroll / active : 0)
  const byType: any[]    = data.byPayrollType ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      [`CHILL NUMBERS — ${l.employeeSummary}`],
      [`${l.generatedOn}: ${today()}`],
      [],
      [l.generalSummaryEmp],
      [l.indicator, l.value],
      [l.activeEmployees, active], [l.inactiveEmployees, inactive],
      [l.annualPayroll, payroll], [l.avgSalary, avg],
    ]
    if (byType.length > 0) {
      rows.push([], [l.byPayrollType], [l.payrollType, l.employeesCount, l.totalSalary])
      byType.forEach((t: any) => rows.push([t.payrollType, t.count ?? 0, t.totalSalary ?? 0]))
    }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:28},{wch:18},{wch:18}]
    titleRow(ws, 0, 3, `CHILL NUMBERS — ${l.employeeSummary}`)
    applyHeaderStyle(ws, 'A5:B5')
    XLSX.utils.book_append_sheet(wb, ws, l.employeeSummary.substring(0, 31))
    XLSX.writeFile(wb, filename('employee-summary', 'xlsx'))
  } else {
    const kpis = `<div class="kpi-grid kpi-grid-3">
      <div class="kpi blue"><div class="kpi-label">${l.activeEmployees}</div><div class="kpi-value">${active}</div></div>
      <div class="kpi green"><div class="kpi-label">${l.annualPayroll}</div><div class="kpi-value">${formatCurrency(payroll)}</div></div>
      <div class="kpi teal"><div class="kpi-label">${l.avgSalary}</div><div class="kpi-value">${formatCurrency(avg)}</div></div>
    </div>`
    openPDF(l.employeeSummary, kpis)
  }
}

// ─── TRANSACTIONS LIST ───────────────────────────────────────────────────────
export async function exportTransactionsList(params: transactionService.TransactionQueryParameters, format: 'excel' | 'pdf') {
  const l = getL()
  const result = await transactionService.getFiltered({ ...params, pageSize: 5000, pageNumber: 1 })
  const txs: any[] = result.data ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      [`CHILL NUMBERS — ${l.txList}`],
      [`${l.generatedOn}: ${today()}`],
      [],
      [l.date, l.type, l.description, l.categoryCol, l.account, l.amount, l.status],
    ]
    txs.forEach((t: any) => rows.push([
      t.date ? new Date(t.date).toLocaleDateString() : '',
      t.type === 1 ? l.income : l.expenses,
      t.description ?? '', t.categoryName ?? t.category ?? '',
      t.accountName ?? t.account ?? '', t.amount ?? 0,
      t.status === 0 ? l.completed : l.pending,
    ]))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:14},{wch:12},{wch:32},{wch:20},{wch:20},{wch:14},{wch:12}]
    titleRow(ws, 0, 7, `CHILL NUMBERS — ${l.txList}`)
    applyHeaderStyle(ws, 'A4:G4')
    XLSX.utils.book_append_sheet(wb, ws, l.txList.substring(0, 31))
    XLSX.writeFile(wb, filename('transactions', 'xlsx'))
  } else {
    const rows = txs.slice(0, 200).map((t: any) =>
      `<tr><td>${t.date ? new Date(t.date).toLocaleDateString() : ''}</td>
       <td>${t.type === 1 ? l.income : l.expenses}</td>
       <td>${t.description ?? ''}</td><td>${t.categoryName ?? t.category ?? ''}</td>
       <td>${t.accountName ?? t.account ?? ''}</td>
       <td class="r ${t.type === 1 ? 'pos' : 'neg'}">${formatCurrency(t.amount ?? 0)}</td>
       <td>${t.status === 0 ? l.completed : l.pending}</td></tr>`
    ).join('')
    openPDF(l.txList, `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">${l.txList}</div></div>
      <table><thead><tr><th>${l.date}</th><th>${l.type}</th><th>${l.description}</th><th>${l.categoryCol}</th><th>${l.account}</th><th class="r">${l.amount}</th><th>${l.status}</th></tr></thead>
      <tbody>${rows}</tbody></table>
      ${txs.length > 200 ? `<p style="color:#718096;font-size:10px;margin-top:8px">${l.showingOf(200, txs.length)} ${l.transactions}.</p>` : ''}</div>`)
  }
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function svgBarChart(
  data: { label: string; income: number; expense: number; profit?: number }[],
  title: string,
  showProfit = true
): string {
  if (!data.length) return ''
  const l = getL()
  const hasProfit = showProfit && data.some(d => d.profit !== undefined)
  const allVals   = data.flatMap(d => [d.income, d.expense, hasProfit ? Math.abs(d.profit ?? 0) : 0])
  const maxVal    = Math.max(...allVals, 1)
  const W = 640, H = 160
  const pad = { top: 16, right: 12, bottom: 36, left: 52 }
  const cW  = W - pad.left - pad.right
  const cH  = H - pad.top  - pad.bottom
  const cols = hasProfit ? 3 : 2
  const groupW = cW / data.length
  const barW   = Math.min(groupW / (cols + 1.5), 16)
  const gap    = barW * 0.4

  const yLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const val = maxVal * pct
    const y   = pad.top + cH - pct * cH
    const lbl = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val.toFixed(0)}`
    return `<line x1="${pad.left}" y1="${y}" x2="${pad.left+cW}" y2="${y}" stroke="#e2e8f0" stroke-width="0.8"/><text x="${pad.left-4}" y="${y+3.5}" text-anchor="end" font-size="8" fill="#a0aec0">${lbl}</text>`
  }).join('')

  const bars = data.map((d, i) => {
    const cx     = pad.left + i * groupW + groupW / 2
    const totalW = cols * barW + (cols - 1) * gap
    const x0     = cx - totalW / 2
    const iH = Math.max((d.income  / maxVal) * cH, 0)
    const eH = Math.max((d.expense / maxVal) * cH, 0)
    const pH = hasProfit ? Math.max((Math.abs(d.profit ?? 0) / maxVal) * cH, 0) : 0
    const pColor = (d.profit ?? 0) >= 0 ? '#4ECDC4' : '#FFA07A'
    const incBar = `<rect x="${x0}" y="${pad.top+cH-iH}" width="${barW}" height="${iH}" fill="#20B2AA" rx="2" opacity="0.9"/>`
    const expBar = `<rect x="${x0+barW+gap}" y="${pad.top+cH-eH}" width="${barW}" height="${eH}" fill="#FF6B6B" rx="2" opacity="0.9"/>`
    const proBar = hasProfit ? `<rect x="${x0+2*(barW+gap)}" y="${pad.top+cH-pH}" width="${barW}" height="${pH}" fill="${pColor}" rx="2" opacity="0.9"/>` : ''
    const lbl    = d.label.length > 5 ? d.label.slice(0, 4) + '...' : d.label
    const lblEl  = `<text x="${cx}" y="${pad.top+cH+14}" text-anchor="middle" font-size="8.5" fill="#718096">${lbl}</text>`
    return incBar + expBar + proBar + lblEl
  }).join('')

  const axisX = `<line x1="${pad.left}" y1="${pad.top+cH}" x2="${pad.left+cW}" y2="${pad.top+cH}" stroke="#cbd5e0" stroke-width="1.5"/>`
  const axisY = `<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top+cH}" stroke="#cbd5e0" stroke-width="1.5"/>`
  const legendItems = [
    `<rect x="0" y="0" width="9" height="9" fill="#20B2AA" rx="1.5"/><text x="12" y="8" font-size="9" fill="#4a5568">${l.legendIncome}</text>`,
    `<rect x="65" y="0" width="9" height="9" fill="#FF6B6B" rx="1.5"/><text x="77" y="8" font-size="9" fill="#4a5568">${l.legendExpenses}</text>`,
    hasProfit ? `<rect x="120" y="0" width="9" height="9" fill="#4ECDC4" rx="1.5"/><text x="132" y="8" font-size="9" fill="#4a5568">${l.legendProfit}</text>` : '',
  ].join('')

  return `<div class="chart-box"><div class="chart-box-title">${title}</div><svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">${yLines}${axisX}${axisY}${bars}</svg><svg width="220" height="14" xmlns="http://www.w3.org/2000/svg" style="margin-top:4px">${legendItems}</svg></div>`
}

// ─── ANALYTICS REPORT ────────────────────────────────────────────────────────
export async function exportAnalyticsReport(
  params: { period: string; year: string; month: string },
  format: 'excel' | 'pdf'
) {
  const l = getL()
  const { period, year, month } = params
  const supabase = (await import('@/lib/supabaseClient')).getSupabase()
  const y = parseInt(year), m = parseInt(month)
  let start: string, end: string
  if (period === 'week') {
    const now = new Date(); const day = now.getDay()
    const s = new Date(now); s.setDate(now.getDate() - day)
    const e = new Date(s); e.setDate(s.getDate() + 6)
    start = s.toISOString().split('T')[0]; end = e.toISOString().split('T')[0]
  } else if (period === 'month') {
    start = `${y}-${String(m).padStart(2, '0')}-01`
    end = new Date(y, m, 0).toISOString().split('T')[0]
  } else {
    start = `${y}-01-01`; end = `${y}-12-31`
  }

  const [txRes, closuresRes, employeesRes] = await Promise.all([
    supabase.from('transactions').select('id,type,amount,date,status,description,categories(name)')
      .gte('date', start).lte('date', end)
      .or('is_from_plaid.eq.false,is_business_transaction.eq.true'),
    supabase.from('week_closures').select('*').eq('year', y).eq('month', m),
    supabase.from('employees').select('*').eq('status', 1),
  ])

  const txs       = txRes.data ?? []
  const closures  = closuresRes.data ?? []
  const employees = employeesRes.data ?? []

  const totalIncome   = txs.filter(r => r.type === 1).reduce((s, r) => s + r.amount, 0)
  const totalExpenses = txs.filter(r => r.type === 2).reduce((s, r) => s + r.amount, 0)
  const netProfit     = totalIncome - totalExpenses
  const profitMargin  = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
  const completedTx   = txs.filter(r => r.status === 0).length
  const pendingTx     = txs.filter(r => r.status === 1).length
  const totalPayroll  = employees.reduce((s, e) => s + (e.salary ?? 0), 0)

  const catMap = new Map<string, { income: number; expense: number; count: number }>()
  txs.forEach((r: any) => {
    const name = r.categories?.name ?? (getLocale() === 'en' ? 'No category' : 'Sin categoría')
    const existing = catMap.get(name) ?? { income: 0, expense: 0, count: 0 }
    if (r.type === 1) existing.income += r.amount
    else existing.expense += r.amount
    existing.count++
    catMap.set(name, existing)
  })
  const categories = Array.from(catMap.entries())
    .map(([name, v]) => ({ name, ...v, total: v.income + v.expense }))
    .sort((a, b) => b.total - a.total)

  const topIncome   = [...txs].filter(r => r.type === 1).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const topExpenses = [...txs].filter(r => r.type === 2).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const periodLabel = getPeriodLabel(l, period, y, m, start, end)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const s1: any[][] = [
      [`CHILL NUMBERS — ${l.analyticsReport}`],
      [`${l.period}: ${periodLabel}  |  ${l.generatedOn}: ${today()}`],
      [],
      [l.executiveSummaryAnalytics],
      [l.indicator, l.value, l.detailCol],
      [l.totalIncome, totalIncome, `${txs.filter(r => r.type === 1).length} ${l.transactions}`],
      [l.totalExpenses, totalExpenses, `${txs.filter(r => r.type === 2).length} ${l.transactions}`],
      [l.netProfit, netProfit, netProfit >= 0 ? l.positive : l.negative],
      [l.profitMargin, parseFloat(profitMargin.toFixed(2)), '%'],
      [l.txCompleted2, completedTx, ''],
      [l.txPending2, pendingTx, ''],
      [],
      [l.employees],
      [l.activeEmp, employees.length, ''],
      [l.annualPayrollTotal, totalPayroll, ''],
      [l.avgSalaryLabel, employees.length > 0 ? totalPayroll / employees.length : 0, ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:30},{wch:18},{wch:24}]
    titleRow(ws1, 0, 3, `CHILL NUMBERS — ${l.analyticsReport}`)
    applyHeaderStyle(ws1, 'A5:C5')
    applyHeaderStyle(ws1, 'A13:C13')
    XLSX.utils.book_append_sheet(wb, ws1, l.executiveSummaryAnalytics.substring(0, 31))

    const s2: any[][] = [
      [l.txDetail],
      [`${l.period}: ${periodLabel}`],
      [],
      [l.date, l.type, l.description, l.categoryCol, l.amount, l.status],
    ]
    txs.sort((a, b) => b.date.localeCompare(a.date)).forEach((r: any) => {
      s2.push([r.date, r.type === 1 ? l.income : l.expenses,
        r.description ?? '', r.categories?.name ?? '', r.amount,
        r.status === 0 ? l.completed : l.pending])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:14},{wch:12},{wch:36},{wch:22},{wch:14},{wch:12}]
    titleRow(ws2, 0, 6, l.txDetail)
    applyHeaderStyle(ws2, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws2, l.txDetail.substring(0, 31))

    const grandTotal = categories.reduce((s, c) => s + c.total, 0)
    const s3: any[][] = [
      [l.categoryAnalysis],
      [`${l.period}: ${periodLabel}`],
      [],
      [l.category, l.income, l.expenses, l.total, l.pctTotal, l.transactions],
    ]
    categories.forEach(c => {
      s3.push([c.name, c.income, c.expense, c.total,
        grandTotal > 0 ? parseFloat(((c.total / grandTotal) * 100).toFixed(2)) : 0, c.count])
    })
    const ws3 = XLSX.utils.aoa_to_sheet(s3)
    ws3['!cols'] = [{wch:26},{wch:14},{wch:14},{wch:14},{wch:12},{wch:14}]
    titleRow(ws3, 0, 6, l.categoryAnalysis)
    applyHeaderStyle(ws3, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws3, l.categoryAnalysis.substring(0, 31))

    if (closures.length > 0) {
      const s4: any[][] = [
        [l.weeklyClosures],
        [`${l.period}: ${periodLabel}`],
        [],
        [l.weekLabel(0).replace('0', '#'), l.periodCol, l.incomesCol, l.expensesCol, l.profitCol, l.statusCol],
      ]
      closures.forEach((c: any) => {
        s4.push([l.weekLabel(c.week_number), `${c.start_date} — ${c.end_date}`,
          c.total_income, c.total_expenses, c.net_profit,
          c.closed_at ? l.closed : l.open])
      })
      const ws4 = XLSX.utils.aoa_to_sheet(s4)
      ws4['!cols'] = [{wch:12},{wch:14},{wch:14},{wch:14},{wch:14},{wch:10}]
      titleRow(ws4, 0, 6, l.weeklyClosures)
      applyHeaderStyle(ws4, 'A4:F4')
      XLSX.utils.book_append_sheet(wb, ws4, l.weeklyClosures.substring(0, 31))
    }
    XLSX.writeFile(wb, filename('analytics-report', 'xlsx'))

  } else {
    const locale = getLocale()
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const mo = i + 1
      const monthTxs = txs.filter((r: any) => new Date(r.date).getMonth() + 1 === mo)
      const inc = monthTxs.filter((r: any) => r.type === 1).reduce((s: number, r: any) => s + r.amount, 0)
      const exp = monthTxs.filter((r: any) => r.type === 2).reduce((s: number, r: any) => s + r.amount, 0)
      return { label: new Date(parseInt(year), i, 1).toLocaleDateString(locale, { month: 'short' }), income: inc, expense: exp, profit: inc - exp }
    })

    const catChartData = categories.slice(0, 8).map(c => ({
      label: c.name.length > 8 ? c.name.substring(0, 7) + '…' : c.name,
      income: c.income, expense: c.expense,
    }))

    const monthlyChart  = period === 'year' ? svgBarChart(monthlyData, `${l.monthlyPerformance} — ${year}`) : ''
    const categoryChart = categories.length > 0 ? svgBarChart(catChartData, l.distributionByCategory) : ''

    const grandTotal = categories.reduce((s, c) => s + c.total, 0)
    const catRows = categories.slice(0, 15).map(c => {
      const pct = grandTotal > 0 ? ((c.total / grandTotal) * 100).toFixed(1) : '0.0'
      return `<tr><td>${c.name}</td><td class="r pos">${c.income > 0 ? formatCurrency(c.income) : '—'}</td><td class="r neg">${c.expense > 0 ? formatCurrency(c.expense) : '—'}</td><td class="c">${c.count}</td><td class="r">${pct}%</td></tr>`
    }).join('')

    const topIncomeRows = topIncome.map((r: any, i) =>
      `<tr><td class="c" style="font-weight:700;color:#276749">${i + 1}</td><td>${(r.description ?? '').substring(0, 28)}</td><td class="c">${r.date}</td><td class="r pos">+${formatCurrency(r.amount)}</td></tr>`
    ).join('')

    const topExpenseRows = topExpenses.map((r: any, i) =>
      `<tr><td class="c" style="font-weight:700;color:#9b2c2c">${i + 1}</td><td>${(r.description ?? '').substring(0, 28)}</td><td class="c">${r.date}</td><td class="r neg">-${formatCurrency(r.amount)}</td></tr>`
    ).join('')

    const closureRows = closures.map((c: any) => {
      const isClosed = !!c.closed_at
      return `<tr><td>${l.weekLabel(c.week_number)}</td><td class="c">${c.start_date} — ${c.end_date}</td><td class="r pos">${formatCurrency(c.total_income)}</td><td class="r neg">${formatCurrency(c.total_expenses)}</td><td class="r ${c.net_profit >= 0 ? 'pos' : 'neg'}">${formatCurrency(c.net_profit)}</td><td class="c"><span class="badge ${isClosed ? 'badge-green' : 'badge-blue'}">${isClosed ? l.closed : l.open}</span></td></tr>`
    }).join('')

    const netClass = netProfit >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-3">
        <div class="kpi green"><div class="kpi-label">${l.totalIncome}</div><div class="kpi-value">${formatCurrency(totalIncome)}</div><div class="kpi-sub">${txs.filter((r: any) => r.type === 1).length} ${l.transactions}</div></div>
        <div class="kpi red"><div class="kpi-label">${l.totalExpenses}</div><div class="kpi-value">${formatCurrency(totalExpenses)}</div><div class="kpi-sub">${txs.filter((r: any) => r.type === 2).length} ${l.transactions}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${netProfit >= 0 ? l.netProfit : l.netLoss}</div><div class="kpi-value">${formatCurrency(netProfit)}</div><div class="kpi-sub">${netProfit >= 0 ? l.positive : l.negative}</div></div>
      </div>
      <div class="kpi-grid kpi-grid-3">
        <div class="kpi teal"><div class="kpi-label">${l.profitMargin}</div><div class="kpi-value">${profitMargin.toFixed(1)}%</div></div>
        <div class="kpi blue"><div class="kpi-label">${l.transactions}</div><div class="kpi-value">${txs.length}</div><div class="kpi-sub">${completedTx} ${l.completed.toLowerCase()} · ${pendingTx} ${l.pending.toLowerCase()}</div></div>
        <div class="kpi purple"><div class="kpi-label">${l.activeEmployees}</div><div class="kpi-value">${employees.length}</div><div class="kpi-sub">${l.annualPayroll}: ${formatCurrency(totalPayroll)}</div></div>
      </div>
      ${monthlyChart}
      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.categoryAnalysis}</div><div class="section-sub">${categories.length} ${l.category.toLowerCase()}</div></div>
        ${categoryChart}
        <table><thead><tr><th>${l.category}</th><th class="r">${l.income}</th><th class="r">${l.expenses}</th><th class="c">${l.transactions}</th><th class="r">${l.pctTotal}</th></tr></thead><tbody>${catRows}</tbody></table>
      </div>
      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.top5Income}</div></div>
          <table><thead><tr><th class="c">#</th><th>${l.description}</th><th class="c">${l.date}</th><th class="r">${l.amount}</th></tr></thead>
          <tbody>${topIncomeRows || `<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">${l.noData}</td></tr>`}</tbody></table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.top5Expenses}</div></div>
          <table><thead><tr><th class="c">#</th><th>${l.description}</th><th class="c">${l.date}</th><th class="r">${l.amount}</th></tr></thead>
          <tbody>${topExpenseRows || `<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">${l.noData}</td></tr>`}</tbody></table>
        </div>
      </div>
      ${closures.length > 0 ? `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">${l.weeklyClosures}</div><div class="section-sub">${closures.filter((c: any) => c.closed_at).length} / ${closures.length} ${l.closed.toLowerCase()}</div></div><table><thead><tr><th>${l.weekLabel(0).replace('0', '#')}</th><th class="c">${l.periodCol}</th><th class="r">${l.incomesCol}</th><th class="r">${l.expensesCol}</th><th class="r">${l.profitCol}</th><th class="c">${l.statusCol}</th></tr></thead><tbody>${closureRows}</tbody></table></div>` : ''}
      ${employees.length > 0 ? `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">${l.staffSummary}</div></div><div class="kpi-grid kpi-grid-3"><div class="kpi blue"><div class="kpi-label">${l.activeEmployees}</div><div class="kpi-value">${employees.length}</div></div><div class="kpi green"><div class="kpi-label">${l.annualPayroll}</div><div class="kpi-value">${formatCurrency(totalPayroll)}</div></div><div class="kpi teal"><div class="kpi-label">${l.avgSalary}</div><div class="kpi-value">${formatCurrency(employees.length > 0 ? totalPayroll / employees.length : 0)}</div></div></div></div>` : ''}`

    openPDF(l.analyticsReport, body, periodLabel)
  }
}

// ─── WEEK CLOSE REPORT ───────────────────────────────────────────────────────
export async function exportWeekClose(year: number, month: number, format: 'excel' | 'pdf') {
  const l = getL()
  const { getWeekClosures, formatCurrency: fmtCur } = await import('@/services/weekClosureService')
  const result  = await getWeekClosures(year, month)
  const weeks   = result.weeks
  const summary = result.summary
  const periodLabel = l.monthLabel(year, month)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const s1: any[][] = [
      [`CHILL NUMBERS — ${l.weekClose}`],
      [`${l.period}: ${periodLabel}  |  ${l.generatedOn}: ${today()}`],
      [],
      [l.monthSummary],
      [l.indicator, l.value],
      [l.monthIncome, summary.totalIncome],
      [l.monthExpenses, summary.totalExpenses],
      [l.netProfit2, summary.netProfit],
      [l.totalWeeks, summary.totalWeeks],
      [l.closedWeeks, summary.closedWeeks],
      [l.pendingWeeks, summary.pendingWeeks],
      [l.openWeeks, summary.openWeeks],
      [],
      [l.weekDetail],
      [l.weekLabel(0).replace('0', '#'), l.periodCol, l.incomesCol, l.expensesCol, l.profitCol, l.txCount, l.statusCol, l.closedOn],
    ]
    weeks.forEach(w => {
      s1.push([
        l.weekLabel(w.weekNumber),
        `${w.startDate} — ${w.endDate}`,
        w.income, w.expenses, w.netProfit, w.transactionCount,
        w.status === 'closed' ? l.closed : w.status === 'pending' ? l.pending : l.open,
        w.closedAt ? new Date(w.closedAt).toLocaleDateString() : '—',
      ])
    })
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:12},{wch:26},{wch:14},{wch:14},{wch:14},{wch:14},{wch:12},{wch:16}]
    titleRow(ws1, 0, 8, `CHILL NUMBERS — ${l.weekClose}`)
    applyHeaderStyle(ws1, 'A5:B5')
    applyHeaderStyle(ws1, 'A15:H15')
    XLSX.utils.book_append_sheet(wb, ws1, l.weekClose.substring(0, 31))
    XLSX.writeFile(wb, filename(`week-close-${year}-${String(month).padStart(2, '0')}`, 'xlsx'))

  } else {
    const statusBadge = (status: string) => {
      if (status === 'closed')  return `<span class="badge badge-green">${l.closed}</span>`
      if (status === 'pending') return `<span class="badge badge-yellow">${l.pending}</span>`
      return `<span class="badge badge-blue">${l.open}</span>`
    }
    const weekRows = weeks.map(w => `
      <tr>
        <td><strong>${l.weekLabel(w.weekNumber)}</strong></td>
        <td class="c" style="font-size:9px;color:#718096">${w.startDate} — ${w.endDate}</td>
        <td class="c">${w.transactionCount}</td>
        <td class="r pos">+${fmtCur(w.income)}</td>
        <td class="r neg">-${fmtCur(w.expenses)}</td>
        <td class="r ${w.netProfit >= 0 ? 'pos' : 'neg'}">${w.netProfit >= 0 ? '+' : ''}${fmtCur(w.netProfit)}</td>
        <td class="c">${statusBadge(w.status)}</td>
        <td class="c" style="font-size:9px;color:#718096">${w.closedAt ? new Date(w.closedAt).toLocaleDateString() : '—'}</td>
      </tr>`).join('')

    const closedPct = summary.totalWeeks > 0 ? ((summary.closedWeeks / summary.totalWeeks) * 100).toFixed(0) : '0'
    const netClass  = summary.netProfit >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">${l.monthIncome}</div><div class="kpi-value">${fmtCur(summary.totalIncome)}</div><div class="kpi-sub">${l.period}: ${periodLabel}</div></div>
        <div class="kpi red"><div class="kpi-label">${l.monthExpenses}</div><div class="kpi-value">${fmtCur(summary.totalExpenses)}</div><div class="kpi-sub">${l.period}: ${periodLabel}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${summary.netProfit >= 0 ? l.netProfit : l.netLoss}</div><div class="kpi-value">${fmtCur(Math.abs(summary.netProfit))}</div><div class="kpi-sub">${summary.netProfit >= 0 ? l.positive : l.negative}</div></div>
        <div class="kpi teal"><div class="kpi-label">${l.closedWeeks}</div><div class="kpi-value">${summary.closedWeeks}/${summary.totalWeeks}</div><div class="kpi-sub">${closedPct}% ${l.closed.toLowerCase()}</div></div>
      </div>
      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.weekDetail}</div>
          <div class="section-sub">${summary.pendingWeeks > 0 ? l.pendingCount(summary.pendingWeeks) : l.allUpToDate}</div>
        </div>
        <table>
          <thead><tr>
            <th>${l.weekLabel(0).replace('0', '#')}</th><th class="c">${l.periodCol}</th>
            <th class="c">${l.txCount}</th><th class="r">${l.incomesCol}</th>
            <th class="r">${l.expensesCol}</th><th class="r">${l.profitCol}</th>
            <th class="c">${l.statusCol}</th><th class="c">${l.closedOn}</th>
          </tr></thead>
          <tbody>${weekRows}</tbody>
          <tfoot><tr style="background:#f7fafc;font-weight:700">
            <td colspan="3"><strong>${l.totals}</strong></td>
            <td class="r pos">+${fmtCur(summary.totalIncome)}</td>
            <td class="r neg">-${fmtCur(summary.totalExpenses)}</td>
            <td class="r ${summary.netProfit >= 0 ? 'pos' : 'neg'}">${summary.netProfit >= 0 ? '+' : ''}${fmtCur(summary.netProfit)}</td>
            <td colspan="2"></td>
          </tr></tfoot>
        </table>
      </div>
      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">${l.weeklyCloseInfo}</div></div>
        <p style="font-size:10px;color:#718096;line-height:1.6">${l.weeklyCloseInfoBody}</p>
      </div>`
    openPDF(l.weekClose, body, periodLabel)
  }
}

// ─── ANALYTICS (legacy stub) ─────────────────────────────────────────────────
export async function exportAnalyticsData(format: 'excel' | 'pdf') {
  const year  = String(new Date().getFullYear())
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  return exportAnalyticsReport({ period: 'month', year, month }, format)
}

// ─── Export format modal ──────────────────────────────────────────────────────
export const showExportModal = (onExport: (format: 'excel' | 'pdf') => void) => {
  const l = getL()
  const isDark = document.documentElement.classList.contains('dark')
  const bg = isDark ? '#1f2937' : '#fff'
  const text = isDark ? '#f3f4f6' : '#2d3748'
  const subtext = isDark ? '#9ca3af' : '#718096'
  const cancelBg = isDark ? '#374151' : '#edf2f7'
  const cancelText = isDark ? '#d1d5db' : '#4a5568'
  const border = isDark ? '1px solid #374151' : 'none'

  const modal = document.createElement('div')
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999'
  modal.innerHTML = `<div style="background:${bg};border-radius:12px;padding:28px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);border:${border}">
    <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:${text}">${l.exportTitle}</h3>
    <p style="margin:0 0 20px;font-size:13px;color:${subtext}">${l.exportSubtitle}</p>
    <div style="display:flex;gap:10px">
      <button id="exp-excel" style="flex:1;background:#1a7f4b;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📊 ${l.excelBtn}</button>
      <button id="exp-pdf" style="flex:1;background:#c53030;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📄 PDF</button>
    </div>
    <button id="exp-cancel" style="width:100%;margin-top:10px;background:${cancelBg};color:${cancelText};border:none;border-radius:8px;padding:9px;font-size:13px;cursor:pointer">${l.cancelBtn}</button>
  </div>`
  document.body.appendChild(modal)
  const close = () => document.body.removeChild(modal)
  modal.querySelector('#exp-excel')?.addEventListener('click', () => { close(); onExport('excel') })
  modal.querySelector('#exp-pdf')?.addEventListener('click', () => { close(); onExport('pdf') })
  modal.querySelector('#exp-cancel')?.addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })
}

// ─── Legacy compatibility ─────────────────────────────────────────────────────
export const exportReportData = async (reportType: string, format: 'excel' | 'pdf' | 'csv') => {
  const fmt = format === 'csv' ? 'excel' : format
  const year  = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  switch (reportType) {
    case 'financial-summary':    return exportFinancialSummary({ period: 'month' }, fmt)
    case 'profit-loss-detailed': return exportProfitLoss({ year }, fmt)
    case 'transaction-summary':  return exportTransactionSummary({ period: 'month' }, fmt)
    case 'category-breakdown':   return exportCategoryBreakdown({ period: 'month' }, fmt)
    case 'employee-summary':     return exportEmployeeSummary(fmt)
    case 'week-close':           return exportWeekClose(year, month, fmt)
    default:                     return exportFinancialSummary({ period: 'month' }, fmt)
  }
}
