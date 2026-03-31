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

const PDF_STYLES = `
  @page { margin: 15mm 18mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; color: #1a202c; font-size: 11px; background: #fff; }

  /* ── Header ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #1a9e96; margin-bottom: 22px; }
  .brand-block .brand { font-size: 20px; font-weight: 900; color: #1a9e96; letter-spacing: -0.5px; }
  .brand-block .report-name { font-size: 14px; font-weight: 700; color: #2d3748; margin-top: 2px; }
  .brand-block .period-tag { display: inline-block; margin-top: 5px; background: #e6fffa; color: #1a9e96; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; border: 1px solid #81e6d9; }
  .meta { text-align: right; font-size: 10px; color: #718096; }
  .meta strong { display: block; font-size: 12px; color: #2d3748; margin-top: 2px; }

  /* ── Section ── */
  .section { margin-bottom: 22px; page-break-inside: avoid; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .section-dot { width: 4px; height: 18px; background: #1a9e96; border-radius: 2px; flex-shrink: 0; }
  .section-title { font-size: 12px; font-weight: 700; color: #2d3748; }
  .section-sub { font-size: 10px; color: #718096; margin-left: auto; }

  /* ── KPI Grid ── */
  .kpi-grid { display: grid; gap: 10px; margin-bottom: 18px; }
  .kpi-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .kpi-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; position: relative; overflow: hidden; }
  .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #e2e8f0; }
  .kpi.green::before { background: #38a169; }
  .kpi.red::before   { background: #e53e3e; }
  .kpi.blue::before  { background: #3182ce; }
  .kpi.teal::before  { background: #1a9e96; }
  .kpi.purple::before{ background: #805ad5; }
  .kpi.orange::before{ background: #dd6b20; }
  .kpi-label { font-size: 9px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi-value { font-size: 17px; font-weight: 800; margin-top: 4px; line-height: 1; }
  .kpi-sub { font-size: 9px; color: #a0aec0; margin-top: 3px; }
  .green  .kpi-value { color: #276749; }
  .red    .kpi-value { color: #9b2c2c; }
  .blue   .kpi-value { color: #2b6cb0; }
  .teal   .kpi-value { color: #1a9e96; }
  .purple .kpi-value { color: #553c9a; }
  .orange .kpi-value { color: #c05621; }

  /* ── Chart ── */
  .chart-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px; }
  .chart-box-title { font-size: 11px; font-weight: 700; color: #2d3748; margin-bottom: 10px; }
  .chart-legend { display: flex; gap: 14px; margin-top: 8px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 9px; color: #4a5568; }
  .legend-swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

  /* ── Table ── */
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead tr { background: #2d3748; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 600; color: #fff; font-size: 10px; }
  thead th.r { text-align: right; }
  tbody tr:nth-child(even) { background: #f7fafc; }
  tbody tr:hover { background: #ebf8ff; }
  td { padding: 7px 10px; border-bottom: 1px solid #edf2f7; color: #2d3748; }
  td.r { text-align: right; }
  td.c { text-align: center; }
  .pos { color: #276749; font-weight: 600; }
  .neg { color: #9b2c2c; font-weight: 600; }
  .neu { color: #2b6cb0; font-weight: 600; }

  /* ── Two-col layout ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }

  /* ── Badge ── */
  .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .badge-green  { background: #c6f6d5; color: #276749; }
  .badge-blue   { background: #bee3f8; color: #2b6cb0; }
  .badge-yellow { background: #fefcbf; color: #744210; }
  .badge-red    { background: #fed7d7; color: #9b2c2c; }

  /* ── Divider ── */
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }

  /* ── Footer ── */
  .footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #a0aec0; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { page-break-inside: avoid; }
  }
`

function openPDF(title: string, body: string, subtitle = '') {
  const w = window.open('', '_blank')
  if (!w) return
  const header = `
    <div class="header">
      <div class="brand-block">
        <div class="brand">CHILL NUMBERS</div>
        <div class="report-name">${title}</div>
        ${subtitle ? `<span class="period-tag">${subtitle}</span>` : ''}
      </div>
      <div class="meta">Generado el<strong>${today()}</strong></div>
    </div>`
  const footer = `<div class="footer"><span>Chill Numbers &bull; Reporte Financiero</span><span>${today()}</span></div>`
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title} - Chill Numbers</title><style>${PDF_STYLES}</style></head><body>${header}${body}${footer}</body></html>`)
  w.document.close()
  setTimeout(() => w.print(), 500)
}

// ─── FINANCIAL SUMMARY ───────────────────────────────────────────────────────
export async function exportFinancialSummary(params: ReportParams, format: 'excel' | 'pdf') {
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

  const periodLabel = params.period === 'week' ? 'Semana actual'
    : params.period === 'month' ? `${new Date(params.year ?? new Date().getFullYear(), (params.month ?? 1) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    : `Año ${params.year ?? new Date().getFullYear()}`

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()

    // Sheet 1 — Executive Summary
    const s1: any[][] = [
      ['CHILL NUMBERS — ESTADO DE RESULTADOS'],
      [`Período: ${periodLabel}  |  Generado: ${today()}`],
      [],
      ['RESUMEN EJECUTIVO'],
      ['Indicador', 'Valor', 'Transacciones'],
      ['Ingresos Totales', income, incomeCount],
      ['Gastos Totales', expenses, expenseCount],
      ['Resultado Neto', net, txCount],
      ['Margen de Beneficio (%)', parseFloat(margin), ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:30},{wch:18},{wch:16}]
    titleRow(ws1, 0, 3, 'CHILL NUMBERS — ESTADO DE RESULTADOS')
    applyHeaderStyle(ws1, 'A5:C5')
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

    // Sheet 2 — Category Breakdown
    const s2: any[][] = [
      ['DESGLOSE POR CATEGORÍAS'],
      [`Período: ${periodLabel}`],
      [],
      ['INGRESOS POR CATEGORÍA'],
      ['Categoría', 'Monto', '% del Total', 'Transacciones'],
    ]
    incomeBreakdown.forEach((c: any) => s2.push([c.categoryName, c.amount, c.percentage, c.transactionCount]))
    s2.push([], ['GASTOS POR CATEGORÍA'], ['Categoría', 'Monto', '% del Total', 'Transacciones'])
    expenseBreakdown.forEach((c: any) => s2.push([c.categoryName, c.amount, c.percentage, c.transactionCount]))
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:28},{wch:16},{wch:14},{wch:14}]
    titleRow(ws2, 0, 4, 'DESGLOSE POR CATEGORÍAS')
    applyHeaderStyle(ws2, 'A5:D5')
    applyHeaderStyle(ws2, `A${7 + incomeBreakdown.length}:D${7 + incomeBreakdown.length}`, BRAND_COLOR)
    XLSX.utils.book_append_sheet(wb, ws2, 'Categorías')

    XLSX.writeFile(wb, filename('estado-resultados', 'xlsx'))

  } else {
    // Build category bar chart
    const chartData = [...incomeBreakdown.slice(0, 6).map((c: any) => ({ label: c.categoryName.substring(0, 8), income: c.amount, expense: 0 })),
      ...expenseBreakdown.slice(0, 6).map((c: any) => ({ label: c.categoryName.substring(0, 8), income: 0, expense: c.amount }))]
    const chart = chartData.length > 0 ? svgBarChart(chartData, 'Distribución por Categorías', false) : ''

    const incomeRows = incomeBreakdown.slice(0, 10).map((c: any) =>
      `<tr><td>${c.categoryName}</td><td class="c">${c.transactionCount}</td><td class="r pos">+${formatCurrency(c.amount)}</td><td class="r">${c.percentage}%</td></tr>`
    ).join('') || '<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">Sin ingresos en este período</td></tr>'

    const expenseRows = expenseBreakdown.slice(0, 10).map((c: any) =>
      `<tr><td>${c.categoryName}</td><td class="c">${c.transactionCount}</td><td class="r neg">-${formatCurrency(c.amount)}</td><td class="r">${c.percentage}%</td></tr>`
    ).join('') || '<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">Sin gastos en este período</td></tr>'

    const netClass = net >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">Ingresos Totales</div><div class="kpi-value">${formatCurrency(income)}</div><div class="kpi-sub">${incomeCount} transacciones</div></div>
        <div class="kpi red"><div class="kpi-label">Gastos Totales</div><div class="kpi-value">${formatCurrency(expenses)}</div><div class="kpi-sub">${expenseCount} transacciones</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${net >= 0 ? 'Beneficio Neto' : 'Pérdida Neta'}</div><div class="kpi-value">${formatCurrency(Math.abs(net))}</div><div class="kpi-sub">${net >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</div></div>
        <div class="kpi teal"><div class="kpi-label">Margen</div><div class="kpi-value">${margin}%</div><div class="kpi-sub">${txCount} transacciones totales</div></div>
      </div>

      ${chart}

      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Desglose de Ingresos</div><div class="section-sub">${formatCurrency(income)}</div></div>
          <table><thead><tr><th>Categoría</th><th class="c">Txs</th><th class="r">Monto</th><th class="r">%</th></tr></thead><tbody>${incomeRows}</tbody></table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Desglose de Gastos</div><div class="section-sub">${formatCurrency(expenses)}</div></div>
          <table><thead><tr><th>Categoría</th><th class="c">Txs</th><th class="r">Monto</th><th class="r">%</th></tr></thead><tbody>${expenseRows}</tbody></table>
        </div>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">Nota del Reporte</div></div>
        <p style="font-size:10px;color:#718096;line-height:1.6">Este reporte incluye todas las transacciones registradas en el período seleccionado. Los porcentajes se calculan sobre el total de ingresos o gastos según corresponda.</p>
      </div>
    `
    openPDF('Estado de Resultados', body, periodLabel)
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
  const avgIncome    = incomeCount  > 0 ? income  / incomeCount  : 0
  const avgExpense   = expenseCount > 0 ? expenses / expenseCount : 0

  const periodLabel = params.period === 'week' ? 'Semana actual'
    : params.period === 'month' ? `${new Date(params.year ?? new Date().getFullYear(), (params.month ?? 1) - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    : `Año ${params.year ?? new Date().getFullYear()}`

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()

    // Sheet 1 — Summary
    const s1: any[][] = [
      ['CHILL NUMBERS — RESUMEN DE TRANSACCIONES'],
      [`Período: ${periodLabel}  |  Generado: ${today()}`],
      [],
      ['RESUMEN GENERAL'],
      ['Indicador', 'Valor', 'Detalle'],
      ['Total Transacciones', total, `${completed} completadas, ${pending} pendientes`],
      ['Total Ingresos', income, `${incomeCount} transacciones · Promedio: ${formatCurrency(avgIncome)}`],
      ['Total Gastos', expenses, `${expenseCount} transacciones · Promedio: ${formatCurrency(avgExpense)}`],
      ['Resultado Neto', net, net >= 0 ? 'Beneficio' : 'Pérdida'],
      ['Margen de Beneficio (%)', parseFloat(profitMargin), ''],
      [],
      ['ESTADO DE TRANSACCIONES'],
      ['Estado', 'Cantidad', '% del Total'],
      ['Completadas', completed, total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0],
      ['Pendientes', pending, total > 0 ? parseFloat(((pending / total) * 100).toFixed(1)) : 0],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:32},{wch:18},{wch:36}]
    titleRow(ws1, 0, 3, 'CHILL NUMBERS — RESUMEN DE TRANSACCIONES')
    applyHeaderStyle(ws1, 'A5:C5')
    applyHeaderStyle(ws1, 'A13:C13')
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')

    // Sheet 2 — All transactions
    const s2: any[][] = [
      ['DETALLE DE TRANSACCIONES'],
      [`Período: ${periodLabel}`],
      [],
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Estado'],
    ]
    txs.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).forEach((tx: any) => {
      s2.push([
        tx.date ?? '',
        tx.type === 1 ? 'Ingreso' : 'Gasto',
        tx.description ?? '',
        tx.categoryName ?? '',
        tx.amount ?? 0,
        tx.status === 0 ? 'Completada' : 'Pendiente',
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:14},{wch:10},{wch:36},{wch:22},{wch:14},{wch:12}]
    titleRow(ws2, 0, 6, 'DETALLE DE TRANSACCIONES')
    applyHeaderStyle(ws2, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws2, 'Transacciones')

    XLSX.writeFile(wb, filename('resumen-transacciones', 'xlsx'))

  } else {
    // Completed vs pending amounts
    const completedIncome   = txs.filter((r: any) => r.type === 1 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
    const completedExpenses = txs.filter((r: any) => r.type === 2 && r.status === 0).reduce((s: number, r: any) => s + r.amount, 0)
    const pendingIncome     = txs.filter((r: any) => r.type === 1 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)
    const pendingExpenses   = txs.filter((r: any) => r.type === 2 && r.status === 1).reduce((s: number, r: any) => s + r.amount, 0)

    // Recent 20 transactions table
    const recentRows = txs.slice(0, 20).map((tx: any) =>
      `<tr>
        <td>${tx.date ?? ''}</td>
        <td><span class="badge ${tx.type === 1 ? 'badge-green' : 'badge-red'}">${tx.type === 1 ? 'Ingreso' : 'Gasto'}</span></td>
        <td>${(tx.description ?? '').substring(0, 30)}</td>
        <td>${tx.categoryName ?? ''}</td>
        <td class="r ${tx.type === 1 ? 'pos' : 'neg'}">${tx.type === 1 ? '+' : '-'}${formatCurrency(tx.amount ?? 0)}</td>
        <td class="c"><span class="badge ${tx.status === 0 ? 'badge-blue' : 'badge-yellow'}">${tx.status === 0 ? 'Completada' : 'Pendiente'}</span></td>
      </tr>`
    ).join('') || '<tr><td colspan="6" style="text-align:center;color:#a0aec0;padding:12px">Sin transacciones en este período</td></tr>'

    const netClass = net >= 0 ? 'green' : 'red'
    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">Total Ingresos</div><div class="kpi-value">${formatCurrency(income)}</div><div class="kpi-sub">${incomeCount} txs · Prom. ${formatCurrency(avgIncome)}</div></div>
        <div class="kpi red"><div class="kpi-label">Total Gastos</div><div class="kpi-value">${formatCurrency(expenses)}</div><div class="kpi-sub">${expenseCount} txs · Prom. ${formatCurrency(avgExpense)}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${net >= 0 ? 'Beneficio Neto' : 'Pérdida Neta'}</div><div class="kpi-value">${formatCurrency(Math.abs(net))}</div><div class="kpi-sub">Margen: ${profitMargin}%</div></div>
        <div class="kpi blue"><div class="kpi-label">Total Transacciones</div><div class="kpi-value">${total}</div><div class="kpi-sub">${completed} completadas · ${pending} pendientes</div></div>
      </div>

      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Transacciones Completadas</div><span class="badge badge-blue">${completed}</span></div>
          <table>
            <thead><tr><th>Concepto</th><th class="c">Cantidad</th><th class="r">Monto</th></tr></thead>
            <tbody>
              <tr><td>Ingresos completados</td><td class="c">${txs.filter((r:any)=>r.type===1&&r.status===0).length}</td><td class="r pos">+${formatCurrency(completedIncome)}</td></tr>
              <tr><td>Gastos completados</td><td class="c">${txs.filter((r:any)=>r.type===2&&r.status===0).length}</td><td class="r neg">-${formatCurrency(completedExpenses)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Transacciones Pendientes</div><span class="badge badge-yellow">${pending}</span></div>
          <table>
            <thead><tr><th>Concepto</th><th class="c">Cantidad</th><th class="r">Monto</th></tr></thead>
            <tbody>
              <tr><td>Ingresos pendientes</td><td class="c">${txs.filter((r:any)=>r.type===1&&r.status===1).length}</td><td class="r pos">+${formatCurrency(pendingIncome)}</td></tr>
              <tr><td>Gastos pendientes</td><td class="c">${txs.filter((r:any)=>r.type===2&&r.status===1).length}</td><td class="r neg">-${formatCurrency(pendingExpenses)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">Transacciones Recientes</div><div class="section-sub">${txs.length > 20 ? `Mostrando 20 de ${txs.length}` : `${txs.length} transacciones`}</div></div>
        <table>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Categoría</th><th class="r">Monto</th><th class="c">Estado</th></tr></thead>
          <tbody>${recentRows}</tbody>
        </table>
      </div>
    `
    openPDF('Resumen de Transacciones', body, periodLabel)
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

// ─── SVG Bar Chart Generator ─────────────────────────────────────────────────
function svgBarChart(
  data: { label: string; income: number; expense: number; profit?: number }[],
  title: string,
  showProfit = true
): string {
  if (!data.length) return ''
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
    const lbl = val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${val.toFixed(0)}`
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
    const lbl    = d.label.length > 5 ? d.label.slice(0,4)+'...' : d.label
    const lblEl  = `<text x="${cx}" y="${pad.top+cH+14}" text-anchor="middle" font-size="8.5" fill="#718096">${lbl}</text>`
    return incBar + expBar + proBar + lblEl
  }).join('')

  const axisX = `<line x1="${pad.left}" y1="${pad.top+cH}" x2="${pad.left+cW}" y2="${pad.top+cH}" stroke="#cbd5e0" stroke-width="1.5"/>`
  const axisY = `<line x1="${pad.left}" y1="${pad.top}" x2="${pad.left}" y2="${pad.top+cH}" stroke="#cbd5e0" stroke-width="1.5"/>`
  const legendItems = [
    `<rect x="0" y="0" width="9" height="9" fill="#20B2AA" rx="1.5"/><text x="12" y="8" font-size="9" fill="#4a5568">Ingresos</text>`,
    `<rect x="65" y="0" width="9" height="9" fill="#FF6B6B" rx="1.5"/><text x="77" y="8" font-size="9" fill="#4a5568">Gastos</text>`,
    hasProfit ? `<rect x="120" y="0" width="9" height="9" fill="#4ECDC4" rx="1.5"/><text x="132" y="8" font-size="9" fill="#4a5568">Beneficio</text>` : '',
  ].join('')

  return `<div class="chart-box"><div class="chart-box-title">${title}</div><svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">${yLines}${axisX}${axisY}${bars}</svg><svg width="220" height="14" xmlns="http://www.w3.org/2000/svg" style="margin-top:4px">${legendItems}</svg></div>`
}


// ─── ANALYTICS REPORT (Professional) ────────────────────────────────────────
export async function exportAnalyticsReport(
  params: { period: string; year: string; month: string },
  format: 'excel' | 'pdf'
) {
  const { period, year, month } = params
  const supabase = (await import('@/lib/supabaseClient')).getSupabase()

  // Build date range
  const y = parseInt(year), m = parseInt(month)
  let start: string, end: string
  if (period === 'week') {
    const now = new Date(); const day = now.getDay()
    const s = new Date(now); s.setDate(now.getDate() - day)
    const e = new Date(s); e.setDate(s.getDate() + 6)
    start = s.toISOString().split('T')[0]; end = e.toISOString().split('T')[0]
  } else if (period === 'month') {
    start = `${y}-${String(m).padStart(2,'0')}-01`
    end = new Date(y, m, 0).toISOString().split('T')[0]
  } else {
    start = `${y}-01-01`; end = `${y}-12-31`
  }

  // Fetch all data in parallel
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

  // Category breakdown
  const catMap = new Map<string, { income: number; expense: number; count: number }>()
  txs.forEach((r: any) => {
    const name = r.categories?.name ?? 'Sin categoría'
    const existing = catMap.get(name) ?? { income: 0, expense: 0, count: 0 }
    if (r.type === 1) existing.income += r.amount
    else existing.expense += r.amount
    existing.count++
    catMap.set(name, existing)
  })
  const categories = Array.from(catMap.entries())
    .map(([name, v]) => ({ name, ...v, total: v.income + v.expense }))
    .sort((a, b) => b.total - a.total)

  // Top transactions
  const topIncome   = [...txs].filter(r => r.type === 1).sort((a, b) => b.amount - a.amount).slice(0, 5)
  const topExpenses = [...txs].filter(r => r.type === 2).sort((a, b) => b.amount - a.amount).slice(0, 5)

  const periodLabel = period === 'week' ? `Semana — ${start} al ${end}`
    : period === 'month' ? `${new Date(y, m-1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    : `Año ${year}`

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()

    // Sheet 1: Executive Summary
    const s1: any[][] = [
      ['CHILL NUMBERS — ANÁLISIS FINANCIERO COMPLETO'],
      [`Período: ${periodLabel}  |  Generado: ${today()}`],
      [],
      ['RESUMEN EJECUTIVO'],
      ['Indicador', 'Valor', 'Detalle'],
      ['Ingresos Totales', totalIncome, `${txs.filter(r=>r.type===1).length} transacciones`],
      ['Gastos Totales', totalExpenses, `${txs.filter(r=>r.type===2).length} transacciones`],
      ['Resultado Neto', netProfit, netProfit >= 0 ? 'Beneficio' : 'Pérdida'],
      ['Margen de Beneficio', parseFloat(profitMargin.toFixed(2)), '%'],
      ['Transacciones Completadas', completedTx, ''],
      ['Transacciones Pendientes', pendingTx, ''],
      [],
      ['EMPLEADOS'],
      ['Empleados Activos', employees.length, ''],
      ['Nómina Total Anual', totalPayroll, ''],
      ['Salario Promedio', employees.length > 0 ? totalPayroll / employees.length : 0, ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:30},{wch:18},{wch:24}]
    titleRow(ws1, 0, 3, 'CHILL NUMBERS — ANÁLISIS FINANCIERO COMPLETO')
    applyHeaderStyle(ws1, 'A5:C5')
    applyHeaderStyle(ws1, 'A13:C13')
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen Ejecutivo')

    // Sheet 2: Transactions
    const s2: any[][] = [
      ['DETALLE DE TRANSACCIONES'],
      [`Período: ${periodLabel}`],
      [],
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto', 'Estado'],
    ]
    txs.sort((a, b) => b.date.localeCompare(a.date)).forEach((r: any) => {
      s2.push([
        r.date, r.type === 1 ? 'Ingreso' : 'Gasto',
        r.description ?? '', r.categories?.name ?? '',
        r.amount, r.status === 0 ? 'Completada' : 'Pendiente',
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(s2)
    ws2['!cols'] = [{wch:14},{wch:10},{wch:36},{wch:22},{wch:14},{wch:12}]
    titleRow(ws2, 0, 6, 'DETALLE DE TRANSACCIONES')
    applyHeaderStyle(ws2, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws2, 'Transacciones')

    // Sheet 3: Categories
    const s3: any[][] = [
      ['ANÁLISIS POR CATEGORÍAS'],
      [`Período: ${periodLabel}`],
      [],
      ['Categoría', 'Ingresos', 'Gastos', 'Total', '% del Total', 'Transacciones'],
    ]
    const grandTotal = categories.reduce((s, c) => s + c.total, 0)
    categories.forEach(c => {
      s3.push([c.name, c.income, c.expense, c.total,
        grandTotal > 0 ? parseFloat(((c.total / grandTotal) * 100).toFixed(2)) : 0, c.count])
    })
    const ws3 = XLSX.utils.aoa_to_sheet(s3)
    ws3['!cols'] = [{wch:26},{wch:14},{wch:14},{wch:14},{wch:12},{wch:14}]
    titleRow(ws3, 0, 6, 'ANÁLISIS POR CATEGORÍAS')
    applyHeaderStyle(ws3, 'A4:F4')
    XLSX.utils.book_append_sheet(wb, ws3, 'Categorías')

    // Sheet 4: Closures (if any)
    if (closures.length > 0) {
      const s4: any[][] = [
        ['CIERRES SEMANALES'],
        [`Mes: ${periodLabel}`],
        [],
        ['Semana', 'Inicio', 'Fin', 'Ingresos', 'Gastos', 'Beneficio', 'Estado'],
      ]
      closures.forEach((c: any) => {
        s4.push([`Semana ${c.week_number}`, c.start_date, c.end_date,
          c.total_income, c.total_expenses, c.net_profit,
          c.closed_at ? 'Cerrada' : 'Abierta'])
      })
      const ws4 = XLSX.utils.aoa_to_sheet(s4)
      ws4['!cols'] = [{wch:12},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14},{wch:10}]
      titleRow(ws4, 0, 7, 'CIERRES SEMANALES')
      applyHeaderStyle(ws4, 'A4:G4')
      XLSX.utils.book_append_sheet(wb, ws4, 'Cierres Semanales')
    }

    XLSX.writeFile(wb, filename('analisis-financiero-completo', 'xlsx'))

  } else {
    // PDF — Professional multi-section report with charts
    // Build monthly chart data for annual view
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const monthTxs = txs.filter((r: any) => new Date(r.date).getMonth() + 1 === m)
      const inc = monthTxs.filter((r: any) => r.type === 1).reduce((s: number, r: any) => s + r.amount, 0)
      const exp = monthTxs.filter((r: any) => r.type === 2).reduce((s: number, r: any) => s + r.amount, 0)
      return { label: new Date(parseInt(year), i, 1).toLocaleDateString('es', { month: 'short' }), income: inc, expense: exp, profit: inc - exp }
    })

    // Category chart (top 8)
    const catChartData = categories.slice(0, 8).map(c => ({
      label: c.name.length > 8 ? c.name.substring(0, 7) + '…' : c.name,
      income: c.income, expense: c.expense,
    }))

    const monthlyChart  = period === 'year' ? svgBarChart(monthlyData, 'Rendimiento Mensual — ' + year) : ''
    const categoryChart = categories.length > 0 ? svgBarChart(catChartData, 'Distribución por Categorías') : ''

    const grandTotal = categories.reduce((s, c) => s + c.total, 0)
    const catRows = categories.slice(0, 15).map(c => {
      const pct = grandTotal > 0 ? ((c.total / grandTotal) * 100).toFixed(1) : '0.0'
      return `<tr><td>${c.name}</td><td class="r pos">${c.income > 0 ? formatCurrency(c.income) : '—'}</td><td class="r neg">${c.expense > 0 ? formatCurrency(c.expense) : '—'}</td><td class="c">${c.count}</td><td class="r">${pct}%</td></tr>`
    }).join('')

    const topIncomeRows = topIncome.map((r: any, i) =>
      `<tr><td class="c" style="font-weight:700;color:#276749">${i+1}</td><td>${(r.description ?? '').substring(0,28)}</td><td class="c">${r.date}</td><td class="r pos">+${formatCurrency(r.amount)}</td></tr>`
    ).join('')

    const topExpenseRows = topExpenses.map((r: any, i) =>
      `<tr><td class="c" style="font-weight:700;color:#9b2c2c">${i+1}</td><td>${(r.description ?? '').substring(0,28)}</td><td class="c">${r.date}</td><td class="r neg">-${formatCurrency(r.amount)}</td></tr>`
    ).join('')

    const closureRows = closures.map((c: any) => {
      const isClosed = !!c.closed_at
      return `<tr><td>Semana ${c.week_number}</td><td class="c">${c.start_date} — ${c.end_date}</td><td class="r pos">${formatCurrency(c.total_income)}</td><td class="r neg">${formatCurrency(c.total_expenses)}</td><td class="r ${c.net_profit >= 0 ? 'pos' : 'neg'}">${formatCurrency(c.net_profit)}</td><td class="c"><span class="badge ${isClosed ? 'badge-green' : 'badge-blue'}">${isClosed ? 'Cerrada' : 'Abierta'}</span></td></tr>`
    }).join('')

    const netClass = netProfit >= 0 ? 'green' : 'red'

    const body = `
      <div class="kpi-grid kpi-grid-3">
        <div class="kpi green"><div class="kpi-label">Ingresos Totales</div><div class="kpi-value">${formatCurrency(totalIncome)}</div><div class="kpi-sub">${txs.filter((r:any)=>r.type===1).length} transacciones</div></div>
        <div class="kpi red"><div class="kpi-label">Gastos Totales</div><div class="kpi-value">${formatCurrency(totalExpenses)}</div><div class="kpi-sub">${txs.filter((r:any)=>r.type===2).length} transacciones</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">Resultado Neto</div><div class="kpi-value">${formatCurrency(netProfit)}</div><div class="kpi-sub">${netProfit >= 0 ? 'Beneficio' : 'Perdida'}</div></div>
      </div>
      <div class="kpi-grid kpi-grid-3">
        <div class="kpi teal"><div class="kpi-label">Margen de Beneficio</div><div class="kpi-value">${profitMargin.toFixed(1)}%</div><div class="kpi-sub">Sobre ingresos totales</div></div>
        <div class="kpi blue"><div class="kpi-label">Transacciones</div><div class="kpi-value">${txs.length}</div><div class="kpi-sub">${completedTx} completadas · ${pendingTx} pendientes</div></div>
        <div class="kpi purple"><div class="kpi-label">Empleados Activos</div><div class="kpi-value">${employees.length}</div><div class="kpi-sub">Nomina: ${formatCurrency(totalPayroll)}</div></div>
      </div>

      ${monthlyChart}

      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">Analisis por Categorias</div><div class="section-sub">${categories.length} categorias activas</div></div>
        ${categoryChart}
        <table><thead><tr><th>Categoria</th><th class="r">Ingresos</th><th class="r">Gastos</th><th class="c">Transacciones</th><th class="r">% Total</th></tr></thead><tbody>${catRows}</tbody></table>
      </div>

      <div class="two-col">
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Top 5 Ingresos</div></div>
          <table><thead><tr><th class="c">#</th><th>Descripcion</th><th class="c">Fecha</th><th class="r">Monto</th></tr></thead><tbody>${topIncomeRows || '<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">Sin datos</td></tr>'}</tbody></table>
        </div>
        <div class="section" style="margin:0">
          <div class="section-header"><div class="section-dot"></div><div class="section-title">Top 5 Gastos</div></div>
          <table><thead><tr><th class="c">#</th><th>Descripcion</th><th class="c">Fecha</th><th class="r">Monto</th></tr></thead><tbody>${topExpenseRows || '<tr><td colspan="4" style="text-align:center;color:#a0aec0;padding:10px">Sin datos</td></tr>'}</tbody></table>
        </div>
      </div>

      ${closures.length > 0 ? `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">Cierres Semanales</div><div class="section-sub">${closures.filter((c:any)=>c.closed_at).length} de ${closures.length} cerradas</div></div><table><thead><tr><th>Semana</th><th class="c">Periodo</th><th class="r">Ingresos</th><th class="r">Gastos</th><th class="r">Beneficio</th><th class="c">Estado</th></tr></thead><tbody>${closureRows}</tbody></table></div>` : ''}

      ${employees.length > 0 ? `<div class="section"><div class="section-header"><div class="section-dot"></div><div class="section-title">Resumen de Personal</div></div><div class="kpi-grid kpi-grid-3"><div class="kpi blue"><div class="kpi-label">Empleados Activos</div><div class="kpi-value">${employees.length}</div></div><div class="kpi green"><div class="kpi-label">Nomina Total Anual</div><div class="kpi-value">${formatCurrency(totalPayroll)}</div></div><div class="kpi teal"><div class="kpi-label">Salario Promedio</div><div class="kpi-value">${formatCurrency(employees.length > 0 ? totalPayroll / employees.length : 0)}</div></div></div></div>` : ''}
    `

    openPDF('Analisis Financiero Completo', body, periodLabel)
  }
}

// ─── WEEK CLOSE REPORT ───────────────────────────────────────────────────────
export async function exportWeekClose(year: number, month: number, format: 'excel' | 'pdf') {
  const { getWeekClosures, formatCurrency: fmtCur } = await import('@/services/weekClosureService')
  const result = await getWeekClosures(year, month)
  const weeks   = result.weeks
  const summary = result.summary

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const periodLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`

  if (format === 'excel') {
    const wb = XLSX.utils.book_new()

    // Sheet 1 — Summary
    const s1: any[][] = [
      ['CHILL NUMBERS — CIERRE SEMANAL'],
      [`Período: ${periodLabel}  |  Generado: ${today()}`],
      [],
      ['RESUMEN DEL MES'],
      ['Indicador', 'Valor'],
      ['Ingresos del Mes', summary.totalIncome],
      ['Gastos del Mes', summary.totalExpenses],
      ['Beneficio Neto', summary.netProfit],
      ['Total Semanas', summary.totalWeeks],
      ['Semanas Cerradas', summary.closedWeeks],
      ['Semanas Pendientes', summary.pendingWeeks],
      ['Semanas Abiertas', summary.openWeeks],
      [],
      ['DETALLE POR SEMANA'],
      ['Semana', 'Período', 'Ingresos', 'Gastos', 'Beneficio', 'Transacciones', 'Estado', 'Cerrada el'],
    ]
    weeks.forEach(w => {
      s1.push([
        `Semana ${w.weekNumber}`,
        `${w.startDate} — ${w.endDate}`,
        w.income,
        w.expenses,
        w.netProfit,
        w.transactionCount,
        w.status === 'closed' ? 'Cerrada' : w.status === 'pending' ? 'Pendiente' : 'Abierta',
        w.closedAt ? new Date(w.closedAt).toLocaleDateString('es-ES') : '—',
      ])
    })
    const ws1 = XLSX.utils.aoa_to_sheet(s1)
    ws1['!cols'] = [{wch:12},{wch:26},{wch:14},{wch:14},{wch:14},{wch:14},{wch:12},{wch:16}]
    titleRow(ws1, 0, 8, 'CHILL NUMBERS — CIERRE SEMANAL')
    applyHeaderStyle(ws1, 'A5:B5')
    applyHeaderStyle(ws1, 'A15:H15')
    XLSX.utils.book_append_sheet(wb, ws1, 'Cierre Semanal')

    XLSX.writeFile(wb, filename(`cierre-semanal-${year}-${String(month).padStart(2,'0')}`, 'xlsx'))

  } else {
    const statusBadge = (status: string) => {
      if (status === 'closed')  return '<span class="badge badge-green">Cerrada</span>'
      if (status === 'pending') return '<span class="badge badge-yellow">Pendiente</span>'
      return '<span class="badge badge-blue">Abierta</span>'
    }

    const weekRows = weeks.map(w => `
      <tr>
        <td><strong>Semana ${w.weekNumber}</strong></td>
        <td class="c" style="font-size:9px;color:#718096">${w.startDate} — ${w.endDate}</td>
        <td class="c">${w.transactionCount}</td>
        <td class="r pos">+${fmtCur(w.income)}</td>
        <td class="r neg">-${fmtCur(w.expenses)}</td>
        <td class="r ${w.netProfit >= 0 ? 'pos' : 'neg'}">${w.netProfit >= 0 ? '+' : ''}${fmtCur(w.netProfit)}</td>
        <td class="c">${statusBadge(w.status)}</td>
        <td class="c" style="font-size:9px;color:#718096">${w.closedAt ? new Date(w.closedAt).toLocaleDateString('es-ES') : '—'}</td>
      </tr>`
    ).join('')

    const closedPct = summary.totalWeeks > 0 ? ((summary.closedWeeks / summary.totalWeeks) * 100).toFixed(0) : '0'
    const netClass  = summary.netProfit >= 0 ? 'green' : 'red'

    const body = `
      <div class="kpi-grid kpi-grid-4">
        <div class="kpi green"><div class="kpi-label">Ingresos del Mes</div><div class="kpi-value">${fmtCur(summary.totalIncome)}</div><div class="kpi-sub">Período: ${periodLabel}</div></div>
        <div class="kpi red"><div class="kpi-label">Gastos del Mes</div><div class="kpi-value">${fmtCur(summary.totalExpenses)}</div><div class="kpi-sub">Período: ${periodLabel}</div></div>
        <div class="kpi ${netClass}"><div class="kpi-label">${summary.netProfit >= 0 ? 'Beneficio Neto' : 'Pérdida Neta'}</div><div class="kpi-value">${fmtCur(Math.abs(summary.netProfit))}</div><div class="kpi-sub">${summary.netProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</div></div>
        <div class="kpi teal"><div class="kpi-label">Estado de Cierres</div><div class="kpi-value">${summary.closedWeeks}/${summary.totalWeeks}</div><div class="kpi-sub">${closedPct}% cerradas</div></div>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">Detalle de Semanas</div><div class="section-sub">${summary.pendingWeeks > 0 ? `⚠️ ${summary.pendingWeeks} semana(s) pendiente(s)` : '✅ Todo al día'}</div></div>
        <table>
          <thead>
            <tr>
              <th>Semana</th>
              <th class="c">Período</th>
              <th class="c">Transacciones</th>
              <th class="r">Ingresos</th>
              <th class="r">Gastos</th>
              <th class="r">Beneficio</th>
              <th class="c">Estado</th>
              <th class="c">Cerrada el</th>
            </tr>
          </thead>
          <tbody>${weekRows}</tbody>
          <tfoot>
            <tr style="background:#f7fafc;font-weight:700">
              <td colspan="3"><strong>TOTALES</strong></td>
              <td class="r pos">+${fmtCur(summary.totalIncome)}</td>
              <td class="r neg">-${fmtCur(summary.totalExpenses)}</td>
              <td class="r ${summary.netProfit >= 0 ? 'pos' : 'neg'}">${summary.netProfit >= 0 ? '+' : ''}${fmtCur(summary.netProfit)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="section">
        <div class="section-header"><div class="section-dot"></div><div class="section-title">¿Qué es el Cierre Semanal?</div></div>
        <p style="font-size:10px;color:#718096;line-height:1.6">El cierre semanal bloquea las transacciones de una semana específica, evitando modificaciones accidentales y manteniendo la integridad de los registros financieros. Las semanas cerradas aparecen en verde, las pendientes en amarillo y las abiertas en azul.</p>
      </div>
    `
    openPDF('Cierre Semanal', body, periodLabel)
  }
}

// ─── ANALYTICS (legacy stub — now delegates to full report) ──────────────────
export async function exportAnalyticsData(format: 'excel' | 'pdf') {
  const year  = String(new Date().getFullYear())
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  return exportAnalyticsReport({ period: 'month', year, month }, format)
}

// ─── Modal de selección de formato ───────────────────────────────────────────
export const showExportModal = (onExport: (format: 'excel' | 'pdf') => void) => {
  const locale = document.documentElement.lang?.startsWith('en') ? 'en' : 'es'
  const s = locale === 'en'
    ? { title: 'Export Report', subtitle: 'Select export format', excel: 'Excel (.xlsx)', pdf: 'PDF', cancel: 'Cancel' }
    : { title: 'Exportar Reporte', subtitle: 'Selecciona el formato de exportación', excel: 'Excel (.xlsx)', pdf: 'PDF', cancel: 'Cancelar' }

  const modal = document.createElement('div')
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999'
  modal.innerHTML = `<div style="background:#fff;border-radius:12px;padding:28px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2)"><h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:#2d3748">${s.title}</h3><p style="margin:0 0 20px;font-size:13px;color:#718096">${s.subtitle}</p><div style="display:flex;gap:10px"><button id="exp-excel" style="flex:1;background:#1a7f4b;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📊 ${s.excel}</button><button id="exp-pdf" style="flex:1;background:#c53030;color:#fff;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer">📄 ${s.pdf}</button></div><button id="exp-cancel" style="width:100%;margin-top:10px;background:#edf2f7;color:#4a5568;border:none;border-radius:8px;padding:9px;font-size:13px;cursor:pointer">${s.cancel}</button></div>`
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
