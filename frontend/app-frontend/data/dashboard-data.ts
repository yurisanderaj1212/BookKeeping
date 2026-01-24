// Mock data for dashboard - will be replaced with API calls later
import { getCategoryName, getCategoryIcon, getCategoryColor } from './categories-data'
import { mockTransactions, getTotalIncome, getTotalExpenses, getNetProfit, getPendingTransactions, formatCurrency } from './transactions-data'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  categoryIcon: string
}

export interface WeeklyData {
  week: string
  income: number
  expenses: number
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
  icon: string
}

export interface StatsData {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pending: number
  incomeChange: number
  expensesChange: number
  profitChange: number
  pendingChange: number
}

// Mock transactions data - now using centralized data
export const dashboardTransactions: Transaction[] = mockTransactions.map(transaction => ({
  ...transaction,
  categoryIcon: getCategoryIcon(transaction.category)
}))

// Mock weekly data (last 4 weeks of current month)
export const mockWeeklyData: WeeklyData[] = [
  { week: 'Week 1', income: 4200, expenses: 1800 },
  { week: 'Week 2', income: 3800, expenses: 2100 },
  { week: 'Week 3', income: 5200, expenses: 1900 },
  { week: 'Week 4', income: 4600, expenses: 2300 }
]

// Mock monthly data (last 6 months)
export const mockMonthlyData: MonthlyData[] = [
  { month: 'Aug', income: 18500, expenses: 8200 },
  { month: 'Sep', income: 19200, expenses: 8800 },
  { month: 'Oct', income: 20100, expenses: 9100 },
  { month: 'Nov', income: 18800, expenses: 8500 },
  { month: 'Dec', income: 21500, expenses: 9800 },
  { month: 'Jan', income: 22300, expenses: 10200 }
]

// Mock category breakdown
export const mockCategoryData: CategoryData[] = [
  {
    name: getCategoryName('income-services'),
    amount: 8500,
    percentage: 35,
    color: getCategoryColor('income-services'),
    icon: getCategoryIcon('income-services')
  },
  {
    name: getCategoryName('income-sales'),
    amount: 6200,
    percentage: 26,
    color: getCategoryColor('income-sales'),
    icon: getCategoryIcon('income-sales')
  },
  {
    name: getCategoryName('income-consulting'),
    amount: 4800,
    percentage: 20,
    color: getCategoryColor('income-consulting'),
    icon: getCategoryIcon('income-consulting')
  },
  {
    name: getCategoryName('expense-office'),
    amount: 2100,
    percentage: 9,
    color: getCategoryColor('expense-office'),
    icon: getCategoryIcon('expense-office')
  },
  {
    name: getCategoryName('expense-software'),
    amount: 1500,
    percentage: 6,
    color: getCategoryColor('expense-software'),
    icon: getCategoryIcon('expense-software')
  },
  {
    name: getCategoryName('expense-marketing'),
    amount: 900,
    percentage: 4,
    color: getCategoryColor('expense-marketing'),
    icon: getCategoryIcon('expense-marketing')
  }
]

// Mock stats data - now calculated from centralized transactions
export const mockStatsData: StatsData = {
  totalIncome: getTotalIncome(),
  totalExpenses: getTotalExpenses(),
  netProfit: getNetProfit(),
  pending: getPendingTransactions().reduce((sum, t) => sum + t.amount, 0),
  incomeChange: 12.5,
  expensesChange: -8.2,
  profitChange: 15.3,
  pendingChange: -5.1
}

// Helper functions - now using centralized formatCurrency
export { formatCurrency } from './transactions-data'

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}