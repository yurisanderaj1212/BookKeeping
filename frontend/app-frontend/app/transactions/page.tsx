'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react'
import TransactionForm from '../../components/transactions/TransactionForm'
import TransactionList from '../../components/transactions/TransactionList'
import Sidebar from '../../components/dashboard/Sidebar'
import OnboardingTour from '../../components/onboarding/OnboardingTour'
import { useOnboarding } from '../../hooks/useOnboarding'
import { useAuth } from '../../hooks/useAuth'
import { Transaction } from '../../data/transactions-data'
import * as transactionService from '../../services/transactionService'

export default function TransactionsPage() {
  // TODOS LOS HOOKS AL INICIO
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const {
    isOnboardingOpen,
    closeOnboarding,
    completeOnboarding
  } = useOnboarding()

  // Cargar transacciones del backend
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
    }
  }, [isAuthenticated])

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true)
      setError(null)
      const data = await transactionService.getAll()
      
      // Mapear TransactionDto del backend a Transaction del frontend
      const mappedTransactions: Transaction[] = data.map(dto => ({
        id: dto.id.toString(),
        type: dto.type === 0 ? 'income' : 'expense',
        amount: dto.amount,
        description: dto.description,
        category: dto.categoryId.toString(),
        date: dto.date.split('T')[0],
        status: 'completed',
        notes: dto.notes || ''
      }))
      
      setTransactions(mappedTransactions)
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError(err.message || 'Error al cargar las transacciones')
    } finally {
      setLoadingTransactions(false)
    }
  }

  // RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras se verifica la autenticación
  if (isLoading || loadingTransactions) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {isLoading ? 'Verificando autenticación...' : 'Cargando transacciones...'}
          </p>
        </div>
      </div>
    )
  }
  
  // Si no está autenticado, el hook ya redirigió al login
  if (!isAuthenticated) {
    return null
  }

  const handleCreateTransaction = () => {
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleSaveTransaction = async (transactionData: Transaction) => {
    try {
      if (editingTransaction) {
        // Update existing transaction
        const updateDto: transactionService.UpdateTransactionDto = {
          amount: transactionData.amount,
          description: transactionData.description,
          categoryId: parseInt(transactionData.category),
          date: transactionData.date,
          notes: transactionData.notes || ''
        }
        
        await transactionService.update(parseInt(editingTransaction.id), updateDto)
      } else {
        // Add new transaction
        const createDto: transactionService.CreateTransactionDto = {
          type: transactionData.type === 'income' ? 0 : 1,
          amount: transactionData.amount,
          description: transactionData.description,
          categoryId: parseInt(transactionData.category),
          accountId: 1, // TODO: Obtener del usuario o permitir seleccionar
          date: transactionData.date,
          notes: transactionData.notes || ''
        }
        
        await transactionService.create(createDto)
      }
      
      // Recargar transacciones después de guardar
      await loadTransactions()
      setShowForm(false)
    } catch (err: any) {
      console.error('Error saving transaction:', err)
      setError(err.message || 'Error al guardar la transacción')
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionService.deleteTransaction(parseInt(transactionId))
      // Recargar transacciones después de eliminar
      await loadTransactions()
    } catch (err: any) {
      console.error('Error deleting transaction:', err)
      setError(err.message || 'Error al eliminar la transacción')
    }
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
    logout() // Usar la función logout del hook useAuth
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
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
                  data-tour="add-transaction-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Transacción</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" data-tour="transactions-main">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6" data-tour="transaction-filters">
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
        <div data-tour="transaction-list">
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
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

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  )
}