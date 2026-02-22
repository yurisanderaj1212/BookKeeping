// Centralized transactions data - will be replaced with API calls later

import { calculatePayrollExpenses } from './employees-data'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  status: 'pending' | 'completed'
  notes?: string
  accountId?: number // NUEVO: ID de la cuenta asociada
}

// Mock transactions data - single source of truth
export const mockTransactions: Transaction[] = [
  // 2024 Transactions
  {
    id: '1',
    type: 'income',
    amount: 2500.00,
    description: 'Client Payment - Web Development',
    category: 'income-services',
    date: '2024-01-20',
    status: 'completed',
    notes: 'Payment for Q4 2023 project'
  },
  {
    id: '2',
    type: 'expense',
    amount: 450.00,
    description: 'Office Supplies',
    category: 'expense-office-supplies',
    date: '2024-01-19',
    status: 'completed',
    notes: 'Stationery and equipment'
  },
  {
    id: '3',
    type: 'income',
    amount: 1800.00,
    description: 'Consulting Services',
    category: 'income-consulting',
    date: '2024-01-18',
    status: 'completed'
  },
  {
    id: '4',
    type: 'expense',
    amount: 120.00,
    description: 'Software Subscription',
    category: 'expense-software',
    date: '2024-01-17',
    status: 'completed',
    notes: 'Monthly Adobe Creative Suite'
  },
  {
    id: '5',
    type: 'expense',
    amount: 85.00,
    description: 'Internet Bill',
    category: 'expense-utilities',
    date: '2024-01-16',
    status: 'pending'
  },
  {
    id: '6',
    type: 'income',
    amount: 3200.00,
    description: 'Product Sales',
    category: 'income-sales',
    date: '2024-01-15',
    status: 'completed',
    notes: 'E-commerce platform sales'
  },
  {
    id: '7',
    type: 'expense',
    amount: 200.00,
    description: 'Marketing Campaign',
    category: 'expense-marketing',
    date: '2024-01-14',
    status: 'pending'
  },
  {
    id: '8',
    type: 'income',
    amount: 1500.00,
    description: 'Freelance Project',
    category: 'income-freelance',
    date: '2024-01-13',
    status: 'completed'
  },
  {
    id: '9',
    type: 'expense',
    amount: 75.00,
    description: 'Business Lunch with Client',
    category: 'expense-meals',
    date: '2024-01-12',
    status: 'pending',
    notes: 'Meeting with potential client'
  },
  {
    id: '10',
    type: 'income',
    amount: 2800.00,
    description: 'Monthly Retainer',
    category: 'income-services',
    date: '2024-01-11',
    status: 'completed'
  },
  {
    id: '11',
    type: 'expense',
    amount: 350.00,
    description: 'Equipment Purchase',
    category: 'expense-equipment',
    date: '2024-01-10',
    status: 'completed'
  },
  {
    id: '12',
    type: 'income',
    amount: 950.00,
    description: 'Training Workshop',
    category: 'income-consulting',
    date: '2024-01-09',
    status: 'completed'
  },
  {
    id: '13',
    type: 'expense',
    amount: 180.00,
    description: 'Cloud Storage',
    category: 'expense-software',
    date: '2024-01-08',
    status: 'completed'
  },
  {
    id: '14',
    type: 'income',
    amount: 4200.00,
    description: 'E-commerce Sales',
    category: 'income-sales',
    date: '2024-01-07',
    status: 'completed'
  },
  {
    id: '15',
    type: 'expense',
    amount: 95.00,
    description: 'Electricity Bill',
    category: 'expense-utilities',
    date: '2024-01-06',
    status: 'completed'
  },
  {
    id: '16',
    type: 'income',
    amount: 1650.00,
    description: 'Design Services',
    category: 'income-services',
    date: '2024-01-05',
    status: 'completed'
  },
  {
    id: '17',
    type: 'expense',
    amount: 320.00,
    description: 'Social Media Ads',
    category: 'expense-marketing',
    date: '2024-01-04',
    status: 'pending'
  },
  {
    id: '18',
    type: 'income',
    amount: 2100.00,
    description: 'Business Consultation',
    category: 'income-consulting',
    date: '2024-01-03',
    status: 'completed'
  },
  {
    id: '19',
    type: 'expense',
    amount: 1500.00,
    description: 'Office Rent',
    category: 'expense-rent',
    date: '2024-01-02',
    status: 'completed'
  },
  {
    id: '20',
    type: 'income',
    amount: 3800.00,
    description: 'Annual Contract',
    category: 'income-services',
    date: '2024-01-01',
    status: 'completed'
  },

  // 2023 Transactions
  {
    id: '21',
    type: 'expense',
    amount: 220.00,
    description: 'Professional Tools',
    category: 'expense-software',
    date: '2023-12-31',
    status: 'completed'
  },
  {
    id: '22',
    type: 'income',
    amount: 1750.00,
    description: 'Mobile App Development',
    category: 'income-services',
    date: '2023-12-30',
    status: 'completed'
  },
  {
    id: '23',
    type: 'expense',
    amount: 80.00,
    description: 'Domain Renewal',
    category: 'expense-software',
    date: '2023-12-29',
    status: 'completed'
  },
  {
    id: '24',
    type: 'income',
    amount: 5200.00,
    description: 'Holiday Sales Boost',
    category: 'income-sales',
    date: '2023-12-28',
    status: 'completed'
  },
  {
    id: '25',
    type: 'expense',
    amount: 400.00,
    description: 'Year-end Marketing',
    category: 'expense-marketing',
    date: '2023-12-27',
    status: 'completed'
  },
  {
    id: '26',
    type: 'income',
    amount: 2200.00,
    description: 'Q4 Consulting Revenue',
    category: 'income-consulting',
    date: '2023-11-15',
    status: 'completed'
  },
  {
    id: '27',
    type: 'expense',
    amount: 300.00,
    description: 'Office Equipment',
    category: 'expense-equipment',
    date: '2023-11-10',
    status: 'completed'
  },
  {
    id: '28',
    type: 'income',
    amount: 1800.00,
    description: 'Website Redesign Project',
    category: 'income-services',
    date: '2023-10-20',
    status: 'completed'
  },
  {
    id: '29',
    type: 'expense',
    amount: 150.00,
    description: 'Marketing Tools',
    category: 'expense-marketing',
    date: '2023-10-15',
    status: 'completed'
  },
  {
    id: '30',
    type: 'income',
    amount: 3500.00,
    description: 'Q3 Sales Revenue',
    category: 'income-sales',
    date: '2023-09-30',
    status: 'completed'
  },

  // 2022 Transactions
  {
    id: '31',
    type: 'income',
    amount: 2800.00,
    description: 'Year-end Bonus Project',
    category: 'income-services',
    date: '2022-12-20',
    status: 'completed'
  },
  {
    id: '32',
    type: 'expense',
    amount: 500.00,
    description: 'Annual Software Licenses',
    category: 'expense-software',
    date: '2022-12-15',
    status: 'completed'
  },
  {
    id: '33',
    type: 'income',
    amount: 1900.00,
    description: 'Holiday Season Sales',
    category: 'income-sales',
    date: '2022-12-10',
    status: 'completed'
  },
  {
    id: '34',
    type: 'expense',
    amount: 250.00,
    description: 'Office Renovation',
    category: 'expense-office',
    date: '2022-11-25',
    status: 'completed'
  },
  {
    id: '35',
    type: 'income',
    amount: 3200.00,
    description: 'Large Client Contract',
    category: 'income-consulting',
    date: '2022-11-01',
    status: 'completed'
  },
  {
    id: '36',
    type: 'expense',
    amount: 180.00,
    description: 'Utilities Q4',
    category: 'expense-utilities',
    date: '2022-10-30',
    status: 'completed'
  },
  {
    id: '37',
    type: 'income',
    amount: 1600.00,
    description: 'Autumn Campaign Revenue',
    category: 'income-sales',
    date: '2022-10-15',
    status: 'completed'
  },
  {
    id: '38',
    type: 'expense',
    amount: 120.00,
    description: 'Professional Development',
    category: 'expense-professional',
    date: '2022-09-20',
    status: 'completed'
  },
  {
    id: '39',
    type: 'income',
    amount: 2400.00,
    description: 'Summer Project Completion',
    category: 'income-services',
    date: '2022-08-30',
    status: 'completed'
  },
  {
    id: '40',
    type: 'expense',
    amount: 350.00,
    description: 'Marketing Campaign Q3',
    category: 'expense-marketing',
    date: '2022-08-15',
    status: 'completed'
  }
]

// Helper functions for transactions with date filtering
export const getTransactionById = (id: string): Transaction | undefined => {
  return mockTransactions.find(transaction => transaction.id === id)
}

export const getTransactionsByType = (type: 'income' | 'expense'): Transaction[] => {
  return mockTransactions.filter(transaction => transaction.type === type)
}

export const getTransactionsByCategory = (categoryId: string): Transaction[] => {
  return mockTransactions.filter(transaction => transaction.category === categoryId)
}

export const getTransactionsByDateRange = (startDate: string, endDate: string): Transaction[] => {
  return mockTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return transactionDate >= start && transactionDate <= end
  })
}

// New filtered functions for reports
export const getTotalIncomeFiltered = (startDate?: string, endDate?: string): number => {
  let transactions = mockTransactions.filter(t => t.type === 'income')
  
  if (startDate && endDate) {
    transactions = getTransactionsByDateRange(startDate, endDate).filter(t => t.type === 'income')
  }
  
  return transactions.reduce((sum, t) => sum + t.amount, 0)
}

export const getTotalExpensesFiltered = (startDate?: string, endDate?: string): number => {
  let transactions = mockTransactions.filter(t => t.type === 'expense')
  
  if (startDate && endDate) {
    transactions = getTransactionsByDateRange(startDate, endDate).filter(t => t.type === 'expense')
  }
  
  const transactionExpenses = transactions.reduce((sum, t) => sum + t.amount, 0)
  
  // Add payroll expenses based on date range
  let payrollExpenses = 0
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff <= 7) {
      payrollExpenses = calculatePayrollExpenses('week')
    } else if (daysDiff <= 31) {
      payrollExpenses = calculatePayrollExpenses('month')
    } else {
      payrollExpenses = calculatePayrollExpenses('year')
    }
  } else {
    payrollExpenses = calculatePayrollExpenses('month')
  }
  
  return transactionExpenses + payrollExpenses
}

export const getNetProfitFiltered = (startDate?: string, endDate?: string): number => {
  return getTotalIncomeFiltered(startDate, endDate) - getTotalExpensesFiltered(startDate, endDate)
}

// Helper function to generate date ranges from period selection
export const getDateRangeFromPeriod = (period: string, year: string, month: string) => {
  switch (period) {
    case 'month':
      const startOfMonth = `${year}-${month.padStart(2, '0')}-01`
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0]
      return { startDate: startOfMonth, endDate: endOfMonth }
    
    case 'quarter':
      const quarterNum = Math.ceil(parseInt(month) / 3)
      const startMonth = ((quarterNum - 1) * 3 + 1).toString().padStart(2, '0')
      const endMonth = (quarterNum * 3).toString().padStart(2, '0')
      const startOfQuarter = `${year}-${startMonth}-01`
      const endOfQuarter = new Date(parseInt(year), parseInt(endMonth), 0).toISOString().split('T')[0]
      return { startDate: startOfQuarter, endDate: endOfQuarter }
    
    case 'year':
      return { startDate: `${year}-01-01`, endDate: `${year}-12-31` }
    
    default:
      return { startDate: undefined, endDate: undefined }
  }
}

export const getTotalIncome = (): number => {
  return mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getTotalExpenses = (): number => {
  const transactionExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  // Add monthly payroll expenses
  const payrollExpenses = calculatePayrollExpenses('month')
  
  return transactionExpenses + payrollExpenses
}

export const getNetProfit = (): number => {
  return getTotalIncome() - getTotalExpenses()
}

export const getPendingTransactions = (): Transaction[] => {
  return mockTransactions.filter(t => t.status === 'pending')
}

export const getPendingTransactionsCount = (): number => {
  return getPendingTransactions().length
}

export const getCompletedTransactions = (): Transaction[] => {
  return mockTransactions.filter(t => t.status === 'completed')
}

export const getTransactionStats = () => {
  return {
    totalIncome: getTotalIncome(),
    totalExpenses: getTotalExpenses(),
    netProfit: getNetProfit(),
    pendingCount: getPendingTransactionsCount(),
    completedCount: getCompletedTransactions().length,
    totalTransactions: mockTransactions.length
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Helper function to get current week dates (using 2024 for demo data)
export const getCurrentWeekDates = () => {
  // Using January 2024 for demo purposes since that's where our data is
  const startOfWeek = new Date('2024-01-15') // Monday
  const endOfWeek = new Date('2024-01-21') // Sunday
  
  return {
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0]
  }
}

// Helper function to get current month dates (using 2024 for demo data)
export const getCurrentMonthDates = () => {
  const startOfMonth = new Date('2024-01-01')
  const endOfMonth = new Date('2024-01-31')
  
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  }
}

// Helper function to get current year dates (using 2024 for demo data)
export const getCurrentYearDates = () => {
  const startOfYear = new Date('2024-01-01')
  const endOfYear = new Date('2024-12-31')
  
  return {
    startDate: startOfYear.toISOString().split('T')[0],
    endDate: endOfYear.toISOString().split('T')[0]
  }
}

// Functions to get data by period
export const getDataByPeriod = (period: 'week' | 'month' | 'year') => {
  let dateRange
  
  switch (period) {
    case 'week':
      dateRange = getCurrentWeekDates()
      break
    case 'month':
      dateRange = getCurrentMonthDates()
      break
    case 'year':
      dateRange = getCurrentYearDates()
      break
    default:
      dateRange = getCurrentWeekDates()
  }
  
  const totalIncome = getTotalIncomeFiltered(dateRange.startDate, dateRange.endDate)
  const totalExpenses = getTotalExpensesFiltered(dateRange.startDate, dateRange.endDate)
  const netProfit = totalIncome - totalExpenses
  const pendingCount = mockTransactions.filter(t => {
    const transactionDate = new Date(t.date)
    const startDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)
    return t.status === 'pending' && transactionDate >= startDate && transactionDate <= endDate
  }).length
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    pendingCount,
    period,
    dateRange
  }
}

// Function to get period label
export const getPeriodLabel = (period: 'week' | 'month' | 'year') => {
  switch (period) {
    case 'week':
      return `Semana del 15-21 enero 2024`
    case 'month':
      return `Enero 2024`
    case 'year':
      return `Año 2024`
    default:
      return 'Período actual'
  }
}

// Helper functions to get previous period dates for comparison
export const getPreviousWeekDates = () => {
  const startOfWeek = new Date('2024-01-08') // Previous Monday
  const endOfWeek = new Date('2024-01-14') // Previous Sunday
  
  return {
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0]
  }
}

export const getPreviousMonthDates = () => {
  const startOfMonth = new Date('2023-12-01')
  const endOfMonth = new Date('2023-12-31')
  
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  }
}

export const getPreviousYearDates = () => {
  const startOfYear = new Date('2023-01-01')
  const endOfYear = new Date('2023-12-31')
  
  return {
    startDate: startOfYear.toISOString().split('T')[0],
    endDate: endOfYear.toISOString().split('T')[0]
  }
}

// Function to calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

// Function to get data with percentage changes
export const getDataWithChanges = (period: 'week' | 'month' | 'year') => {
  // Get current period data
  const currentData = getDataByPeriod(period)
  
  // Get previous period dates
  let previousDateRange
  switch (period) {
    case 'week':
      previousDateRange = getPreviousWeekDates()
      break
    case 'month':
      previousDateRange = getPreviousMonthDates()
      break
    case 'year':
      previousDateRange = getPreviousYearDates()
      break
    default:
      previousDateRange = getPreviousWeekDates()
  }
  
  // Calculate previous period data (including payroll)
  const previousIncome = getTotalIncomeFiltered(previousDateRange.startDate, previousDateRange.endDate)
  const previousExpenses = getTotalExpensesFiltered(previousDateRange.startDate, previousDateRange.endDate)
  const previousNetProfit = previousIncome - previousExpenses
  const previousPendingCount = mockTransactions.filter(t => {
    const transactionDate = new Date(t.date)
    const startDate = new Date(previousDateRange.startDate)
    const endDate = new Date(previousDateRange.endDate)
    return t.status === 'pending' && transactionDate >= startDate && transactionDate <= endDate
  }).length
  
  // Calculate percentage changes
  const incomeChange = calculatePercentageChange(currentData.totalIncome, previousIncome)
  const expensesChange = calculatePercentageChange(currentData.totalExpenses, previousExpenses)
  const profitChange = calculatePercentageChange(currentData.netProfit, previousNetProfit)
  const pendingChange = calculatePercentageChange(currentData.pendingCount, previousPendingCount)
  
  return {
    ...currentData,
    changes: {
      incomeChange,
      expensesChange,
      profitChange,
      pendingChange
    }
  }
}