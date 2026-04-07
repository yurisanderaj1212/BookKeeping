'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionList from '@/components/transactions/TransactionList'
import Sidebar from '@/components/dashboard/Sidebar'
import { TableSkeleton } from '@/components/ui/PageShell'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations, useLocale } from 'next-intl'
import PageLayout from '@/components/ui/PageLayout'
import MobileMenuButton from '@/components/ui/MobileMenuButton'
import { useNotifications } from '@/hooks/useNotifications'
import { translateCategoryName } from '@/lib/categoryTranslator'
import * as transactionService from '@/services/transactionService'
import * as categoryService from '@/services/categoryService'
import accountService, { getAccountDisplayName } from '@/services/accountService'
import { exportTransactionsList, showExportModal } from '@/services/exportService'
import PlaidReviewQueue from '@/components/plaid/PlaidReviewQueue'
import type { Transaction } from '@/data/transactions-data'

export default function TransactionsPage() {
  // TODOS LOS HOOKS AL INICIO
  const { isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('transactions')
  const tCommon = useTranslations('common')
  const tCategories = useTranslations('categories')
  const locale = useLocale()
  const { showError, showSuccess } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedAccount, setSelectedAccount] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Array<{ id: number; name: string; sub_type: number }>>([])
  const [categories, setCategories] = useState<categoryService.CategoryDto[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Nuevos estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pagination, setPagination] = useState<transactionService.PaginationMetadata | null>(null)
  
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()

  // Cargar transacciones del backend cuando cambian los filtros o la página
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions()
    }
  }, [isAuthenticated, currentPage, pageSize, searchTerm, selectedCategory, selectedType, selectedAccount, dateRange])

  // Cargar cuentas solo una vez
  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts()
      loadCategories()
    }
  }, [isAuthenticated])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err: any) {
      // silenciar — no exponer detalles en consola
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true)
      const data = await accountService.getAccounts()
      setAccounts(data.map(acc => ({ id: acc.id, name: acc.name, sub_type: acc.sub_type })))
    } catch {
      // silenciar — no exponer detalles en consola
    } finally {
      setLoadingAccounts(false)
    }
  }

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true)
      setError(null)
      
      // Construir parámetros de filtrado
      const params: transactionService.TransactionQueryParameters = {
        pageNumber: currentPage,
        pageSize: pageSize,
        sortBy: 'date',
        sortDirection: 'desc'
      }
      
      // Agregar filtros solo si no son 'all'
      if (searchTerm) {
        params.searchText = searchTerm
      }
      
      if (selectedCategory !== 'all') {
        // selectedCategory ahora es el ID numérico como string
        params.categoryIds = selectedCategory
      }
      
      if (selectedType !== 'all') {
        // Income = 1, Expense = 2 (TransactionType enum del backend)
        params.type = selectedType === 'income' ? 1 : 2
      }
      
      if (selectedAccount !== 'all') {
        params.accountIds = selectedAccount === 'none' ? 'null' : selectedAccount
      }
      
      // Filtro de rango de fechas
      if (dateRange !== 'all') {
        const today = new Date()
        let startDate: Date | null = null
        
        switch (dateRange) {
          case 'today':
            startDate = new Date(today.setHours(0, 0, 0, 0))
            params.startDate = startDate.toISOString().split('T')[0]
            params.endDate = startDate.toISOString().split('T')[0]
            break
          case 'week':
            startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            params.startDate = startDate.toISOString().split('T')[0]
            break
          case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1)
            params.startDate = startDate.toISOString().split('T')[0]
            break
          case 'year':
            startDate = new Date(today.getFullYear(), 0, 1)
            params.startDate = startDate.toISOString().split('T')[0]
            break
        }
      }
      
      // Llamar al backend con filtros
      const result = await transactionService.getFiltered(params)
      
      // Mapear TransactionDto del backend a Transaction del frontend
      const mappedTransactions: Transaction[] = result.data.map(dto => ({
        id: dto.id.toString(),
        type: dto.type === 1 ? 'income' : 'expense',
        amount: dto.amount,
        description: dto.description,
        category: dto.categoryId.toString(),
        date: dto.date.split('T')[0],
        status: dto.status === 1 ? 'pending' : 'completed',
        notes: dto.notes || '',
        accountId: dto.accountId || undefined,
        isFromPlaid: (dto as any).isFromPlaid ?? false,
        isBusinessTransaction: (dto as any).isBusinessTransaction ?? null,
        merchantName: (dto as any).merchantName ?? null,
      }))
      
      setTransactions(mappedTransactions)
      setPagination(result.pagination)
    } catch (err: any) {
      setError(err.message || t('loadError'))
    } finally {
      setLoadingTransactions(false)
    }
  }

  // RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Solo redirigir si definitivamente no está autenticado (sin flash de loading)
  if (!isAuthenticated && !isLoading) {
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
          // Income = 1, Expense = 2 (TransactionType enum del backend)
          type: transactionData.type === 'income' ? 1 : 2,
          amount: transactionData.amount,
          description: transactionData.description,
          categoryId: parseInt(transactionData.category),
          date: transactionData.date,
          accountId: transactionData.accountId || undefined // Incluir accountId (puede ser undefined)
        }
        
        await transactionService.update(parseInt(editingTransaction.id), updateDto)
      } else {
        // Add new transaction
        const createDto: transactionService.CreateTransactionDto = {
          type: transactionData.type === 'income' ? 1 : 2,
          amount: transactionData.amount,
          description: transactionData.description,
          categoryId: parseInt(transactionData.category),
          accountId: transactionData.accountId || undefined,
          date: transactionData.date,
          notes: transactionData.notes || '',
          status: transactionData.status === 'pending' ? 1 : 0,
        }
        
        await transactionService.create(createDto)
      }
      
      // Recargar transacciones después de guardar
      await loadTransactions()
      setShowForm(false)
    } catch (err: any) {
      showError(tCommon('error'), err.message || t('loadError'))
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionService.deleteTransaction(parseInt(transactionId))
      await loadTransactions()
    } catch (err: any) {
      showError(tCommon('error'), err.message || t('loadError'))
    }
  }

  // Ya no necesitamos filtrar en el frontend - el backend lo hace
  const filteredTransactions = transactions

  const handleExport = () => {
    showExportModal((format) => {
      const params: transactionService.TransactionQueryParameters = {
        pageNumber: 1,
        pageSize: 5000,
        sortBy: 'date',
        sortDirection: 'desc',
        ...(searchTerm && { searchText: searchTerm }),
        ...(selectedCategory !== 'all' && { categoryId: parseInt(selectedCategory) }),
        ...(selectedType !== 'all' && { type: selectedType === 'income' ? 1 : 2 }),
        ...(selectedAccount !== 'all' && { accountId: parseInt(selectedAccount) }),
      }
      exportTransactionsList(params, format)
    })
  }

  const handleLogout = () => {
    logout() // Usar la función logout del hook useAuth
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />
      
      {/* Main Content */}
      <PageLayout>
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-16 py-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <MobileMenuButton />
                <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                  {t('subtitle')}
                </p>
              </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={handleExport}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{tCommon('export')}</span>
                </button>
                <button 
                  onClick={handleCreateTransaction}
                  className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                  data-tour="add-transaction-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t('new')}</span>
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
              <div className="shrink-0">
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
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 mb-4 sm:mb-6" data-tour="transaction-filters">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {/* Search — full width on mobile */}
            <div className="relative col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                disabled={loadingCategories}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">{t('allCategories')}</option>
                {categories
                  .filter(cat => cat.type === 0) // Ingresos (BD: 0=Income)
                  .map(cat => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {translateCategoryName(cat.name, tCategories)}
                    </option>
                  ))}
                {categories
                  .filter(cat => cat.type === 1) // Gastos (BD: 1=Expense)
                  .map(cat => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {translateCategoryName(cat.name, tCategories)}
                    </option>
                  ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">{t('allTypes')}</option>
                <option value="income">{t('incomes')}</option>
                <option value="expense">{t('expenses')}</option>
              </select>
            </div>

            {/* Account Filter */}
            <div>
              <select
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value)
                  setCurrentPage(1)
                }}
                disabled={loadingAccounts}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">{t('allAccounts')}</option>
                <option value="none">{t('noAccount')}</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id.toString()}>
                    {getAccountDisplayName(account as any, locale)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">{t('allDates')}</option>
                <option value="today">{t('today')}</option>
                <option value="week">{t('thisWeek')}</option>
                <option value="month">{t('thisMonth')}</option>
                <option value="year">{t('thisYear')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cola de revisión de transacciones Plaid */}
        {process.env.NEXT_PUBLIC_PLAID_CLIENT_ID && (
          <div className="mb-6">
            <PlaidReviewQueue onTransactionConfirmed={loadTransactions} />
          </div>
        )}

        {/* Transactions List */}
        <div data-tour="transaction-list">
          {loadingTransactions ? (
            <TableSkeleton rows={8} />
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onReviewed={loadTransactions}
            />
          )}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPreviousPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tCommon('previous')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tCommon('next')}
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {tCommon('showing')}{' '}
                  <span className="font-medium">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span>
                  {' '}-{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)}
                  </span>
                  {' '}{tCommon('of')}{' '}
                  <span className="font-medium">{pagination.totalRecords}</span>
                  {' '}{t('transactionsLabel')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1) // Reset to first page when changing page size
                  }}
                  className="border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="10">{t('perPage10')}</option>
                  <option value="20">{t('perPage20')}</option>
                  <option value="50">{t('perPage50')}</option>
                  <option value="100">{t('perPage100')}</option>
                </select>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300">
                    {tCommon('page')} {pagination.currentPage} {tCommon('of')} {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
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
      </PageLayout>

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        currentStep={onboardingStep}
        setStep={setOnboardingStep}
      />
    </div>
  )
}