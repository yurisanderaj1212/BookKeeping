'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react'
import TransactionForm from '../../components/transactions/TransactionForm'
import TransactionList from '../../components/transactions/TransactionList'
import Sidebar from '../../components/dashboard/Sidebar'
import { mockTransactions, Transaction } from '../../data/transactions-data'

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)

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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-19">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Transacciones
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona tus ingresos y gastos
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleExport}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todas las categorías</option>
                <option value="income-services">Servicios</option>
                <option value="income-sales">Ventas</option>
                <option value="income-consulting">Consultoría</option>
                <option value="income-investments">Inversiones</option>
                <option value="income-other">Otros Ingresos</option>
                <option value="expense-office">Oficina</option>
                <option value="expense-software">Software</option>
                <option value="expense-marketing">Marketing</option>
                <option value="expense-utilities">Servicios Públicos</option>
                <option value="expense-travel">Viajes</option>
                <option value="expense-equipment">Equipos</option>
                <option value="expense-professional">Servicios Profesionales</option>
                <option value="expense-rent">Alquiler</option>
                <option value="expense-other">Otros Gastos</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
                onChange={(e) => setDateRange(e.target.value)}
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
        </div>

        {/* Transactions List */}
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
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