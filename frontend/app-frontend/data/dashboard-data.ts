// Mock data for dashboard - will be replaced with API calls later

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

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 2500.00,
    description: 'Client Payment - Web Development',
    category: 'Services',
    date: '2024-01-20',
    categoryIcon: '🔧'
  },
  {
    id: '2',
    type: 'expense',
    amount: 450.00,
    description: 'Office Supplies',
    category: 'Office',
    date: '2024-01-19',
    categoryIcon: '📋'
  },
  {
    id: '3',
    type: 'income',
    amount: 1800.00,
    description: 'Consulting Services',
    category: 'Consulting',
    date: '2024-01-18',
    categoryIcon: '💡'
  },
  {
    id: '4',
    type: 'expense',
    amount: 120.00,
    description: 'Software Subscription',
    category: 'Software',
    date: '2024-01-17',
    categoryIcon: '⚙️'
  },
  {
    id: '5',
    type: 'expense',
    amount: 85.00,
    description: 'Internet Bill',
    category: 'Utilities',
    date: '2024-01-16',
    categoryIcon: '🌐'
  },
  {
    id: '6',
    type: 'income',
    amount: 3200.00,
    description: 'Product Sales',
    category: 'Sales',
    date: '2024-01-15',
    categoryIcon: '📊'
  },
  {
    id: '7',
    type: 'expense',
    amount: 200.00,
    description: 'Marketing Campaign',
    category: 'Marketing',
    date: '2024-01-14',
    categoryIcon: '📈'
  },
  {
    id: '8',
    type: 'income',
    amount: 1500.00,
    description: 'Freelance Project',
    category: 'Services',
    date: '2024-01-13',
    categoryIcon: '🔧'
  },
  {
    id: '9',
    type: 'expense',
    amount: 75.00,
    description: 'Phone Bill',
    category: 'Utilities',
    date: '2024-01-12',
    categoryIcon: '📱'
  },
  {
    id: '10',
    type: 'income',
    amount: 2800.00,
    description: 'Monthly Retainer',
    category: 'Services',
    date: '2024-01-11',
    categoryIcon: '🔧'
  },
  {
    id: '11',
    type: 'expense',
    amount: 350.00,
    description: 'Equipment Purchase',
    category: 'Office',
    date: '2024-01-10',
    categoryIcon: '🖥️'
  },
  {
    id: '12',
    type: 'income',
    amount: 950.00,
    description: 'Training Workshop',
    category: 'Consulting',
    date: '2024-01-09',
    categoryIcon: '💡'
  },
  {
    id: '13',
    type: 'expense',
    amount: 180.00,
    description: 'Cloud Storage',
    category: 'Software',
    date: '2024-01-08',
    categoryIcon: '⚙️'
  },
  {
    id: '14',
    type: 'income',
    amount: 4200.00,
    description: 'E-commerce Sales',
    category: 'Sales',
    date: '2024-01-07',
    categoryIcon: '📊'
  },
  {
    id: '15',
    type: 'expense',
    amount: 95.00,
    description: 'Electricity Bill',
    category: 'Utilities',
    date: '2024-01-06',
    categoryIcon: '🌐'
  },
  {
    id: '16',
    type: 'income',
    amount: 1650.00,
    description: 'Design Services',
    category: 'Services',
    date: '2024-01-05',
    categoryIcon: '🔧'
  },
  {
    id: '17',
    type: 'expense',
    amount: 320.00,
    description: 'Social Media Ads',
    category: 'Marketing',
    date: '2024-01-04',
    categoryIcon: '📈'
  },
  {
    id: '18',
    type: 'income',
    amount: 2100.00,
    description: 'Business Consultation',
    category: 'Consulting',
    date: '2024-01-03',
    categoryIcon: '💡'
  },
  {
    id: '19',
    type: 'expense',
    amount: 150.00,
    description: 'Office Rent',
    category: 'Office',
    date: '2024-01-02',
    categoryIcon: '📋'
  },
  {
    id: '20',
    type: 'income',
    amount: 3800.00,
    description: 'Annual Contract',
    category: 'Services',
    date: '2024-01-01',
    categoryIcon: '🔧'
  },
  {
    id: '21',
    type: 'expense',
    amount: 220.00,
    description: 'Professional Tools',
    category: 'Software',
    date: '2023-12-31',
    categoryIcon: '⚙️'
  },
  {
    id: '22',
    type: 'income',
    amount: 1750.00,
    description: 'Mobile App Development',
    category: 'Services',
    date: '2023-12-30',
    categoryIcon: '🔧'
  },
  {
    id: '23',
    type: 'expense',
    amount: 80.00,
    description: 'Domain Renewal',
    category: 'Software',
    date: '2023-12-29',
    categoryIcon: '⚙️'
  },
  {
    id: '24',
    type: 'income',
    amount: 5200.00,
    description: 'Holiday Sales Boost',
    category: 'Sales',
    date: '2023-12-28',
    categoryIcon: '📊'
  },
  {
    id: '25',
    type: 'expense',
    amount: 400.00,
    description: 'Year-end Marketing',
    category: 'Marketing',
    date: '2023-12-27',
    categoryIcon: '📈'
  }
  
]

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
    name: 'Services',
    amount: 8500,
    percentage: 35,
    color: '#20B2AA',
    icon: '🔧'
  },
  {
    name: 'Sales',
    amount: 6200,
    percentage: 26,
    color: '#4CAF50',
    icon: '📊'
  },
  {
    name: 'Consulting',
    amount: 4800,
    percentage: 20,
    color: '#2196F3',
    icon: '💡'
  },
  {
    name: 'Office',
    amount: 2100,
    percentage: 9,
    color: '#FF9800',
    icon: '📋'
  },
  {
    name: 'Software',
    amount: 1500,
    percentage: 6,
    color: '#9C27B0',
    icon: '⚙️'
  },
  {
    name: 'Marketing',
    amount: 900,
    percentage: 4,
    color: '#F44336',
    icon: '📈'
  }
]

// Mock stats data
export const mockStatsData: StatsData = {
  totalIncome: 24000,
  totalExpenses: 10200,
  netProfit: 13800,
  pending: 2400,
  incomeChange: 12.5,
  expensesChange: -8.2,
  profitChange: 15.3,
  pendingChange: -5.1
}

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}