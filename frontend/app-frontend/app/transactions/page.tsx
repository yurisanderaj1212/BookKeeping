'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react'
import TransactionForm from '../../components/transactions/TransactionForm'
import TransactionList from '../../components/transactions/TransactionList'
import Sidebar from '../../components/dashboard/Sidebar'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  status: 'pending' | 'completed'
  notes?: string
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      amount: 2500.00,
      description: 'Client Payment - Web Development',
      category: 'services',
      date: '2024-01-20',
      status: 'completed',
      notes: 'Payment for Q4 2023 project'
    },
    {
      id: '2',
      type: 'expense',
      amount: 450.00,
      description: 'Office Supplies',
      category: 'office',
      date: '2024-01-19',
      status: 'completed',
      notes: 'Stationery and equipment'
    },
    {
      id: '3',
      type: 'income',
      amount: 1800.00,
      description: 'Consulting Services',
      category: 'consulting',
      date: '2024-01-18',
      status: 'completed'
    },
    {
      id: '4',
      type: 'expense',
      amount: 120.00,
      description: 'Software Subscription',
      category: 'software',
      date: '2024-01-17',
      status: 'completed',
      notes: 'Monthly Adobe Creative Suite'
    },
    {
      id: '5',
      type: 'expense',
      amount: 85.00,
      description: 'Internet Bill',
      category: 'utilities',
      date: '2024-01-16',
      status: 'pending'
    },
    {
      id: '6',
      type: 'income',
      amount: 3200.00,
      description: 'Product Sales',
      category: 'sales',
      date: '2024-01-15',
      status: 'completed',
      notes: 'E-commerce platform sales'
    },
    {
      id: '7',
      type: 'expense',
      amount: 200.00,
      description: 'Marketing Campaign',
      category: 'marketing',
      date: '2024-01-14',
      status: 'pending'
    },
    {
      id: '8',
      type: 'income',
      amount: 1500.00,
      description: 'Freelance Project',
      category: 'services',
      date: '2024-01-13',
      status: 'completed'
    },
    {
      id: '9',
      type: 'expense',
      amount: 75.00,
      description: 'This is a very long transaction description that should be truncated properly without causing horizontal scroll issues in the table layout and should show ellipsis when it exceeds the column width',
      category: 'office',
      date: '2024-01-12',
      status: 'pending',
      notes: 'This is also a very long note that should be truncated properly to prevent layout issues'
    }
  ])

  const handleCreateTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleSaveTransaction = (transactionData: Transaction) => {
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? transactionData : t)
      )
    } else {
      // Add new transaction
      setTransactions(prev => [transactionData, ...prev])
    }
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Category filter
    if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
      return false
    }

    // Type filter
    if (selectedType !== 'all' && transaction.type !== selectedType) {
      return false
    }

    // Date range filter
    if (dateRange !== 'all') {
      const transactionDate = new Date(transaction.date)
      const today = new Date()
      
      switch (dateRange) {
        case 'today':
          return transactionDate.toDateString() === today.toDateString()
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return transactionDate >= weekAgo
        case 'month':
          return transactionDate.getMonth() === today.getMonth() && 
                 transactionDate.getFullYear() === today.getFullYear()
        case 'year':
          return transactionDate.getFullYear() === today.getFullYear()
      }
    }

    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1)
  }

  const handleExport = () => {
    // Create CSV content using filtered transactions
    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Status', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        transaction.date,
        transaction.type,
        `"${transaction.description}"`,
        transaction.category,
        transaction.amount.toFixed(2),
        transaction.status,
        `"${transaction.notes || ''}"`
      ].join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logging out...')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Transacciones
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona tus ingresos y gastos
                </p>
              </div>
              <button 
                onClick={handleCreateTransaction}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Transacción</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  resetPagination()
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  resetPagination()
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todas las categorías</option>
                <option value="services">Servicios</option>
                <option value="sales">Ventas</option>
                <option value="consulting">Consultoría</option>
                <option value="office">Oficina</option>
                <option value="software">Software</option>
                <option value="marketing">Marketing</option>
                <option value="utilities">Servicios Públicos</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value)
                  resetPagination()
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value)
                  resetPagination()
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todas las fechas</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transacciones
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleExport}
                className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <TransactionList
          transactions={paginatedTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Transaction Form Modal */}
        <TransactionForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSaveTransaction}
          transaction={editingTransaction}
          mode={editingTransaction ? 'edit' : 'create'}
        />
      </div>
    </div>
  )
}