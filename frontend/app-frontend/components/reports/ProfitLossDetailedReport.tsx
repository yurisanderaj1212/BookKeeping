'use client'

import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { 
  getTotalIncomeFiltered, 
  getTotalExpensesFiltered, 
  getNetProfitFiltered, 
  formatCurrency,
  getDateRangeFromPeriod,
  getTransactionsByDateRange
} from '@/data/transactions-data'

interface ProfitLossDetailedReportProps {
  period: string
  year: string
  month: string
}

export default function ProfitLossDetailedReport({ period, year, month }: ProfitLossDetailedReportProps) {
  // Get date range based on selected period
  const { startDate, endDate } = getDateRangeFromPeriod(period, year, month)
  
  // Calculate filtered totals
  const totalIncome = getTotalIncomeFiltered(startDate, endDate)
  const totalExpenses = getTotalExpensesFiltered(startDate, endDate)
  const netProfit = getNetProfitFiltered(startDate, endDate)
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0

  // Get filtered transactions for the period
  const filteredTransactions = startDate && endDate 
    ? getTransactionsByDateRange(startDate, endDate)
    : []

  const getPeriodLabel = () => {
    switch (period) {
      case 'month':
        return `${getMonthName(month)} ${year}`
      case 'quarter':
        return `Trimestre ${Math.ceil(parseInt(month) / 3)} ${year}`
      case 'year':
        return `Año ${year}`
      default:
        return 'Período personalizado'
    }
  }

  const getMonthName = (monthNum: string) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[parseInt(monthNum) - 1] || 'Mes'
  }

  // Generate monthly data based on filtered period
  const generateMonthlyData = () => {
    if (period === 'year') {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      
      return months.map((monthName, index) => {
        const monthStart = `${year}-${(index + 1).toString().padStart(2, '0')}-01`
        const monthEnd = new Date(parseInt(year), index + 1, 0).toISOString().split('T')[0]
        
        const monthlyIncome = getTotalIncomeFiltered(monthStart, monthEnd)
        const monthlyExpenses = getTotalExpensesFiltered(monthStart, monthEnd)
        const monthlyProfit = monthlyIncome - monthlyExpenses
        const monthlyMargin = monthlyIncome > 0 ? ((monthlyProfit / monthlyIncome) * 100) : 0
        
        return {
          month: monthName,
          ingresos: monthlyIncome,
          gastos: monthlyExpenses,
          beneficio: monthlyProfit,
          margen: monthlyMargin
        }
      })
    } else {
      // For month or quarter, show weekly breakdown or single period
      return [{
        month: getPeriodLabel(),
        ingresos: totalIncome,
        gastos: totalExpenses,
        beneficio: netProfit,
        margen: profitMargin
      }]
    }
  }

  const monthlyData = generateMonthlyData()
  const yearlyTotals = monthlyData.reduce((acc, month) => ({
    ingresos: acc.ingresos + month.ingresos,
    gastos: acc.gastos + month.gastos,
    beneficio: acc.beneficio + month.beneficio
  }), { ingresos: 0, gastos: 0, beneficio: 0 })

  const yearlyMargin = yearlyTotals.ingresos > 0 ? ((yearlyTotals.beneficio / yearlyTotals.ingresos) * 100) : 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Report Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Informe de Pérdidas y Beneficios</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getPeriodLabel()}</p>
          </div>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <p>Chill Numbers</p>
            <p>Generado el {new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-green-600 text-sm font-medium mb-1">Ingresos totales</div>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(yearlyTotals.ingresos)}</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-red-600 text-sm font-medium mb-1">Gastos totales</div>
            <div className="text-2xl font-bold text-red-700">{formatCurrency(yearlyTotals.gastos)}</div>
          </div>
          
          <div className={`${yearlyTotals.beneficio >= 0 ? 'bg-blue-50' : 'bg-orange-50'} p-4 rounded-lg text-center`}>
            <div className={`text-sm font-medium mb-1 ${yearlyTotals.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Beneficio neto
            </div>
            <div className={`text-2xl font-bold ${yearlyTotals.beneficio >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(yearlyTotals.beneficio)}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-purple-600 text-sm font-medium mb-1">Margen de beneficio</div>
            <div className="text-2xl font-bold text-purple-700">{yearlyMargin.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {period === 'year' ? 'Mes' : 'Período'}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ingresos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Gastos</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Beneficio</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Margen</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((monthData, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{monthData.month}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-semibold">
                    {formatCurrency(monthData.ingresos)}
                  </td>
                  <td className="py-3 px-4 text-right text-red-600 font-semibold">
                    {formatCurrency(monthData.gastos)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${
                    monthData.beneficio >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(monthData.beneficio)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    monthData.margen >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {monthData.margen.toFixed(1)}%
                  </td>
                </tr>
              ))}
              
              {/* Total Row - only show if multiple periods */}
              {monthlyData.length > 1 && (
                <tr className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-bold">
                  <td className="py-4 px-4 text-gray-900 dark:text-gray-100">Total</td>
                  <td className="py-4 px-4 text-right text-green-700">
                    {formatCurrency(yearlyTotals.ingresos)}
                  </td>
                  <td className="py-4 px-4 text-right text-red-700">
                    {formatCurrency(yearlyTotals.gastos)}
                  </td>
                  <td className={`py-4 px-4 text-right ${
                    yearlyTotals.beneficio >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    {formatCurrency(yearlyTotals.beneficio)}
                  </td>
                  <td className={`py-4 px-4 text-right ${
                    yearlyMargin >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`}>
                    {yearlyMargin.toFixed(1)}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            Este informe muestra el análisis de pérdidas y beneficios para el período seleccionado.
          </span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  )
}