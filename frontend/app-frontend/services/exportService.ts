import * as XLSX from 'xlsx'
import {
  getFinancialSummary, getProfitLoss, getTransactionSummary,
  getCategoryBreakdown, getEmployeeSummary, formatCurrency, type ReportParams
} from '@/services/reportService'
import * as transactionService from '@/services/transactionService'

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

const PDF_STYLES = `@page{margin:20mm}*{box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#2d3748;font-size:12px;margin:0}.page-header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a9e96;padding-bottom:16px;margin-bottom:24px}.brand{font-size:22px;font-weight:800;color:#1a9e96}.report-title{font-size:16px;font-weight:700}.section{margin-bottom:28px}.section-title{font-size:13px;font-weight:700;border-left:4px solid #1a9e96;padding-left:10px;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:11px}thead tr{background:#2d3748;color:#fff}thead th{padding:9px 12px;text-align:left;font-weight:600}tbody tr:nth-child(even){background:#f7fafc}td{padding:8px 12px;border-bottom:1px solid #e2e8f0}.num{text-align:right}.positive{color:#276749;font-weight:600}.negative{color:#9b2c2c;font-weight:600}.neutral{color:#2b6cb0;font-weight:600}.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}.kpi{background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}.kpi-label{font-size:10px;color:#718096;text-transform:uppercase}.kpi-value{font-size:18px;font-weight:700;margin-top:4px}.footer{margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:10px;color:#a0aec0;text-align:center}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`

function openPDF(title: string, body: string, subtitle = '') {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - Chill Numbers</title><style>${PDF_STYLES}</style></head><body><div class="page-header"><div><div class="brand">CHILL NUMBERS</div><div class="report-title">${title}</div>${subtitle ? `<div style="font-size:11px;color:#718096">${subtitle}</div>` : ''}</div><div style="text-align:right"><div style="font-size:11px;color:#718096">Generado el</div><div style="font-weight:600">${today()}</div></div></div>${body}<div class="footer">Reporte generado por Chill Numbers &bull; ${today()}</div></body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 400)
}

// ─── FINANCIAL SUMMARY ───────────────────────────────────────────────────────
export async function exportFinancialSummary(params: ReportParams, format: 'excel' | 'pdf') {
  const data = await getFinancialSummary(params)
  const income: number = data.totalIncome ?? 0
  const expenses: number = data.totalExpenses ?? 0
  const net = income - expenses
  const margin = income > 0 ? ((net / income) * 100).toFixed(1) : '0.0'
  const byMonth: any[] = data.byMonth ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — RESUMEN FINANCIERO'],[`Generado el: ${today()}`],[],['MÉTRICAS PRINCIPALES'],['Concepto','Valor'],['Ingresos Totales',income],['Gastos Totales',expenses],['Resultado Neto',net],['Margen (%)',parseFloat(margin)]]
    if (byMonth.length > 0) { rows.push([],['DESGLOSE MENSUAL'],['Mes','Año','Tipo','Monto']); byMonth.forEach((m:any) => rows.push([m.month,m.year,m.type===0?'Ingreso':'Gasto',m.amount])) }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:28},{wch:18},{wch:12},{wch:16}]
    titleRow(ws,0,4,'CHILL NUMBERS — RESUMEN FINANCIERO'); applyHeaderStyle(ws,'A5:B5')
    if (byMonth.length>0) applyHeaderStyle(ws,'A12:D12')
    XLSX.utils.book_append_sheet(wb,ws,'Resumen Financiero'); XLSX.writeFile(wb,filename('resumen-financiero','xlsx'))
  } else {
    const kpis = `<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Ingresos Totales</div><div class="kpi-value positive">${formatCurrency(income)}</div></div><div class="kpi"><div class="kpi-label">Gastos Totales</div><div class="kpi-value negative">${formatCurrency(expenses)}</div></div><div class="kpi"><div class="kpi-label">Resultado Neto</div><div class="kpi-value ${net>=0?'positive':'negative'}">${formatCurrency(net)}</div></div></div>`
    openPDF('Resumen Financiero', kpis)
  }
}

// ─── PROFIT & LOSS ───────────────────────────────────────────────────────────
export async function exportProfitLoss(params: ReportParams, format: 'excel' | 'pdf') {
  const data = await getProfitLoss(params)
  const income: number = data.totalIncome ?? 0
  const expenses: number = data.totalExpenses ?? 0
  const net = income - expenses
  const months: any[] = data.monthlyData ?? data.byMonth ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — PÉRDIDAS Y GANANCIAS'],[`Año: ${params.year??new Date().getFullYear()}  |  Generado: ${today()}`],[],['RESUMEN ANUAL'],['Concepto','Monto'],['Ingresos Totales',income],['Gastos Totales',expenses],['Resultado Neto',net],['Margen (%)',income>0?parseFloat(((net/income)*100).toFixed(2)):0]]
    if (months.length>0) { rows.push([],['DESGLOSE MENSUAL'],['Mes','Ingresos','Gastos','Resultado','Margen (%)']); months.forEach((m:any)=>{ const mNet=(m.income??0)-(m.expenses??0); rows.push([m.monthName??m.month,m.income??0,m.expenses??0,mNet,(m.income??0)>0?parseFloat(((mNet/(m.income??1))*100).toFixed(2)):0]) }) }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:20},{wch:16},{wch:16},{wch:16},{wch:12}]
    titleRow(ws,0,5,'CHILL NUMBERS — PÉRDIDAS Y GANANCIAS'); applyHeaderStyle(ws,'A5:B5')
    if (months.length>0) applyHeaderStyle(ws,'A12:E12')
    XLSX.utils.book_append_sheet(wb,ws,'P&G'); XLSX.writeFile(wb,filename('perdidas-ganancias','xlsx'))
  } else {
    const kpis = `<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Ingresos</div><div class="kpi-value positive">${formatCurrency(income)}</div></div><div class="kpi"><div class="kpi-label">Gastos</div><div class="kpi-value negative">${formatCurrency(expenses)}</div></div><div class="kpi"><div class="kpi-label">Resultado Neto</div><div class="kpi-value ${net>=0?'positive':'negative'}">${formatCurrency(net)}</div></div></div>`
    openPDF('Pérdidas y Ganancias', kpis, `Año ${params.year??new Date().getFullYear()}`)
  }
}

// ─── TRANSACTION SUMMARY ─────────────────────────────────────────────────────
export async function exportTransactionSummary(params: ReportParams, format: 'excel' | 'pdf') {
  const data = await getTransactionSummary(params)
  const total: number = data.totalTransactions ?? 0
  const income: number = data.totalIncome ?? 0
  const expenses: number = data.totalExpenses ?? 0
  const pending: number = data.pendingCount ?? 0
  const completed: number = data.completedCount ?? (total - pending)
  const byCategory: any[] = data.byCategory ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — RESUMEN DE TRANSACCIONES'],[`Generado el: ${today()}`],[],['RESUMEN GENERAL'],['Concepto','Valor'],['Total Transacciones',total],['Completadas',completed],['Pendientes',pending],['Total Ingresos',income],['Total Gastos',expenses]]
    if (byCategory.length>0) { rows.push([],['POR CATEGORÍA'],['Categoría','Tipo','Transacciones','Monto Total']); byCategory.forEach((c:any)=>rows.push([c.categoryName??c.category,c.type===0?'Ingreso':'Gasto',c.count??0,c.total??c.amount??0])) }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:28},{wch:16},{wch:16},{wch:16}]
    titleRow(ws,0,4,'CHILL NUMBERS — RESUMEN DE TRANSACCIONES'); applyHeaderStyle(ws,'A5:B5')
    XLSX.utils.book_append_sheet(wb,ws,'Resumen Transacciones'); XLSX.writeFile(wb,filename('resumen-transacciones','xlsx'))
  } else {
    const kpis = `<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Total Transacciones</div><div class="kpi-value neutral">${total}</div></div><div class="kpi"><div class="kpi-label">Completadas</div><div class="kpi-value positive">${completed}</div></div><div class="kpi"><div class="kpi-label">Pendientes</div><div class="kpi-value negative">${pending}</div></div></div>`
    openPDF('Resumen de Transacciones', kpis)
  }
}

// ─── CATEGORY BREAKDOWN ──────────────────────────────────────────────────────
export async function exportCategoryBreakdown(params: ReportParams, format: 'excel' | 'pdf') {
  const data = await getCategoryBreakdown(params)
  const categories: any[] = Array.isArray(data) ? data : (data.categories ?? data.items ?? [])
  const grandTotal = categories.reduce((s:number,c:any)=>s+(c.total??c.amount??0),0)

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — DESGLOSE POR CATEGORÍAS'],[`Generado el: ${today()}`],[],['Categoría','Tipo','Transacciones','Monto Total','% del Total']]
    categories.forEach((c:any)=>{ const amt=c.total??c.amount??0; rows.push([c.categoryName??c.category??c.name,c.type===0?'Ingreso':'Gasto',c.count??0,amt,grandTotal>0?parseFloat(((amt/grandTotal)*100).toFixed(2)):0]) })
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:26},{wch:12},{wch:16},{wch:16},{wch:12}]
    titleRow(ws,0,5,'CHILL NUMBERS — DESGLOSE POR CATEGORÍAS'); applyHeaderStyle(ws,'A4:E4')
    XLSX.utils.book_append_sheet(wb,ws,'Categorías'); XLSX.writeFile(wb,filename('desglose-categorias','xlsx'))
  } else {
    const rows = categories.map((c:any)=>{ const amt=c.total??c.amount??0; const pct=grandTotal>0?((amt/grandTotal)*100).toFixed(1):'0.0'; return `<tr><td>${c.categoryName??c.category??c.name}</td><td>${c.type===0?'Ingreso':'Gasto'}</td><td class="num">${c.count??0}</td><td class="num ${c.type===0?'positive':'negative'}">${formatCurrency(amt)}</td><td class="num">${pct}%</td></tr>` }).join('')
    openPDF('Desglose por Categorías',`<div class="section"><div class="section-title">Desglose por Categorías</div><table><thead><tr><th>Categoría</th><th>Tipo</th><th>Transacciones</th><th>Monto</th><th>%</th></tr></thead><tbody>${rows}</tbody></table></div>`)
  }
}

// ─── EMPLOYEE SUMMARY ────────────────────────────────────────────────────────
export async function exportEmployeeSummary(format: 'excel' | 'pdf') {
  const data = await getEmployeeSummary()
  const active: number = data.activeEmployees ?? 0
  const inactive: number = data.inactiveEmployees ?? 0
  const payroll: number = data.totalAnnualPayroll ?? 0
  const avg: number = data.averageSalary ?? (active>0?payroll/active:0)
  const byType: any[] = data.byPayrollType ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — RESUMEN DE EMPLEADOS'],[`Generado el: ${today()}`],[],['RESUMEN GENERAL'],['Concepto','Valor'],['Empleados Activos',active],['Empleados Inactivos',inactive],['Nómina Anual Total',payroll],['Salario Promedio',avg]]
    if (byType.length>0) { rows.push([],['POR TIPO DE NÓMINA'],['Tipo','Empleados','Salario Total']); byType.forEach((t:any)=>rows.push([t.payrollType,t.count??0,t.totalSalary??0])) }
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:28},{wch:18},{wch:18}]
    titleRow(ws,0,3,'CHILL NUMBERS — RESUMEN DE EMPLEADOS'); applyHeaderStyle(ws,'A5:B5')
    XLSX.utils.book_append_sheet(wb,ws,'Empleados'); XLSX.writeFile(wb,filename('resumen-empleados','xlsx'))
  } else {
    const kpis = `<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Empleados Activos</div><div class="kpi-value neutral">${active}</div></div><div class="kpi"><div class="kpi-label">Nómina Anual</div><div class="kpi-value positive">${formatCurrency(payroll)}</div></div><div class="kpi"><div class="kpi-label">Salario Promedio</div><div class="kpi-value neutral">${formatCurrency(avg)}</div></div></div>`
    openPDF('Resumen de Empleados', kpis)
  }
}

// ─── TRANSACTIONS LIST ───────────────────────────────────────────────────────
export async function exportTransactionsList(params: transactionService.TransactionQueryParameters, format: 'excel' | 'pdf') {
  const result = await transactionService.getFiltered({ ...params, pageSize: 5000, pageNumber: 1 })
  const txs: any[] = result.data ?? []

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [['CHILL NUMBERS — LISTADO DE TRANSACCIONES'],[`Generado el: ${today()}`],[],['Fecha','Tipo','Descripción','Categoría','Cuenta','Monto','Estado']]
    txs.forEach((t:any)=>rows.push([t.date?new Date(t.date).toLocaleDateString():'',t.type===1?'Ingreso':'Gasto',t.description??'',t.categoryName??t.category??'',t.accountName??t.account??'',t.amount??0,t.status===0?'Completada':'Pendiente']))
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{wch:14},{wch:10},{wch:32},{wch:20},{wch:20},{wch:14},{wch:12}]
    titleRow(ws,0,7,'CHILL NUMBERS — LISTADO DE TRANSACCIONES'); applyHeaderStyle(ws,'A4:G4')
    XLSX.utils.book_append_sheet(wb,ws,'Transacciones'); XLSX.writeFile(wb,filename('transacciones','xlsx'))
  } else {
    const rows = txs.slice(0,200).map((t:any)=>`<tr><td>${t.date?new Date(t.date).toLocaleDateString():''}</td><td>${t.type===1?'Ingreso':'Gasto'}</td><td>${t.description??''}</td><td>${t.categoryName??t.category??''}</td><td>${t.accountName??t.account??''}</td><td class="num ${t.type===1?'positive':'negative'}">${formatCurrency(t.amount??0)}</td><td>${t.status===0?'Completada':'Pendiente'}</td></tr>`).join('')
    openPDF('Listado de Transacciones',`<div class="section"><div class="section-title">Listado de Transacciones</div><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Categoría</th><th>Cuenta</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>${txs.length>200?`<p style="color:#718096;font-size:10px;margin-top:8px">Mostrando 200 de ${txs.length} transacciones.</p>`:''}</div>`)
  }
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export async function exportAnalyticsData(format: 'excel' | 'pdf') {
  const [financial, txSummary, employees] = await Promise.all([getFinancialSummary({}),getTransactionSummary({}),getEmployeeSummary().catch(()=>null)])
  const income: number = financial.totalIncome ?? 0
  const expenses: number = financial.totalExpenses ?? 0
  const net = income - expenses
  const total: number = txSummary.totalTransactions ?? 0
  const pending: number = txSummary.pendingCount ?? 0

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()
    const s1: any[][] = [['CHILL NUMBERS — ANÁLISIS FINANCIERO'],[`Generado el: ${today()}`],[],['RESUMEN FINANCIERO'],['Concepto','Valor'],['Ingresos Totales',income],['Gastos Totales',expenses],['Resultado Neto',net],[],['TRANSACCIONES'],['Concepto','Valor'],['Total',total],['Pendientes',pending],['Completadas',total-pending]]
    if (employees) s1.push([],['EMPLEADOS'],['Concepto','Valor'],['Activos',employees.activeEmployees??0],['Nómina Anual',employees.totalAnnualPayroll??0])
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:28},{wch:18}]
    titleRow(ws1,0,2,'CHILL NUMBERS — ANÁLISIS FINANCIERO'); applyHeaderStyle(ws1,'A5:B5'); applyHeaderStyle(ws1,'A11:B11')
    XLSX.utils.book_append_sheet(wb,ws1,'Análisis'); XLSX.writeFile(wb,filename('analisis-financiero','xlsx'))
  } else {
    const kpis = `<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Ingresos</div><div class="kpi-value positive">${formatCurrency(income)}</div></div><div class="kpi"><div class="kpi-label">Gastos</div><div class="kpi-value negative">${formatCurrency(expenses)}</div></div><div class="kpi"><div class="kpi-label">Resultado Neto</div><div class="kpi-value ${net>=0?'positive':'negative'}">${formatCurrency(net)}</div></div></div><div class="kpi-grid"><div class="kpi"><div class="kpi-label">Total Transacciones</div><div class="kpi-value neutral">${total}</div></div><div class="kpi"><div class="kpi-label">Pendientes</div><div class="kpi-value negative">${pending}</div></div>${employees?`<div class="kpi"><div class="kpi-label">Empleados Activos</div><div class="kpi-value neutral">${employees.activeEmployees??0}</div></div>`:'<div></div>'}</div>`
    openPDF('Análisis Financiero', kpis)
  }
}

// ─── Modal de selección de formato ───────────────────────────────────────────
export const showExportModal = (onExport: (format: 'excel' | 'pdf') => void) => {
  const locale = document.documentElement.lang?.startsWith('en') ? 'en' : 'es'
  const s = locale === 'en'
    ? { title: 'Export report', subtitle: 'Select export format', cancel: 'Cancel' }
    : { title: 'Exportar reporte', subtitle: 'Selecciona el formato de exportación', cancel: 'Cancelar' }

  const modal = document.createElement('div')
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999'
  modal.innerHTML = `<div style="background:#fff;border-radius:12px;padding:28px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)"><h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:#2d3748">${s.title}</h3><p style="margin:0 0 20px;font-size:13px;color:#718096">${s.subtitle}</p><div style="display:flex;gap:10px"><button id="exp-excel" style="flex:1;background:#1a7f4b;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📊 Excel (.xlsx)</button><button id="exp-pdf" style="flex:1;background:#c53030;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📄 PDF</button></div><button id="exp-cancel" style="width:100%;margin-top:10px;background:#edf2f7;color:#4a5568;border:none;border-radius:8px;padding:9px;font-size:13px;cursor:pointer">${s.cancel}</button></div>`
  document.body.appendChild(modal)
  const close = () => document.body.removeChild(modal)
  modal.querySelector('#exp-excel')?.addEventListener('click', () => { close(); onExport('excel') })
  modal.querySelector('#exp-pdf')?.addEventListener('click', () => { close(); onExport('pdf') })
  modal.querySelector('#exp-cancel')?.addEventListener('click', close)
  modal.addEventListener('click', (e) => { if (e.target === modal) close() })
}

// ─── Compatibilidad con llamadas antiguas ────────────────────────────────────
export const exportReportData = async (reportType: string, format: 'excel' | 'pdf' | 'csv') => {
  const fmt = format === 'csv' ? 'excel' : format
  const year = new Date().getFullYear()
  switch (reportType) {
    case 'financial-summary': return exportFinancialSummary({ period: 'month' }, fmt)
    case 'profit-loss-detailed': return exportProfitLoss({ year }, fmt)
    case 'transaction-summary': return exportTransactionSummary({ period: 'month' }, fmt)
    case 'category-breakdown': return exportCategoryBreakdown({ period: 'month' }, fmt)
    case 'employee-summary': return exportEmployeeSummary(fmt)
    default: return exportFinancialSummary({ period: 'month' }, fmt)
  }
}
