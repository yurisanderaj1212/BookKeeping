'use client'

import { useRouter } from 'next/navigation'
import { Plus, Download, BarChart3, Landmark } from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import StatsCards from '../../components/dashboard/StatsCards'
import WeeklyChart from '../../components/dashboard/WeeklyChart'
import MonthlyChart from '../../components/dashboard/MonthlyChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import CategoryBreakdown from '../../components/dashboard/CategoryBreakdown'
import {
  mockStatsData,
  mockWeeklyData,
  mockMonthlyData,
  mockTransactions,
  mockCategoryData
} from '../../data/dashboard-data'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const quickActions = [
    {
      id: 'add-transaction',
      title: 'Add Transaction',
      description: 'Record new income or expense',
      icon: Plus,
      color: 'bg-primary-500 hover:bg-primary-600',
      textColor: 'text-white'
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create financial statements',
      icon: Download,
      color: 'bg-orange-500 hover:bg-orange-600',
      textColor: 'text-white'
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Detailed financial insights',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    },
    {
      id: 'connect-bank',
      title: 'Connect Bank',
      description: 'Link your bank account',
      icon: Landmark,
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Summary</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-sm">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="bg-primary-500 text-white px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center space-x-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalIncome={mockStatsData.totalIncome}
          totalExpenses={mockStatsData.totalExpenses}
          netProfit={mockStatsData.netProfit}
          pending={mockStatsData.pending}
          incomeChange={mockStatsData.incomeChange}
          expensesChange={mockStatsData.expensesChange}
          profitChange={mockStatsData.profitChange}
          pendingChange={mockStatsData.pendingChange}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeeklyChart data={mockWeeklyData} />
          <MonthlyChart data={mockMonthlyData} />
        </div>

        {/* Bottom Row - Same height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-[600px]">
            <RecentTransactions transactions={mockTransactions} />
          </div>
          <div className="h-[600px]">
            <CategoryBreakdown categories={mockCategoryData} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  className={`${action.color} ${action.textColor} p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg group`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInScale 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}