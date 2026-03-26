'use client'

import { useState, useEffect } from 'react'
import { Plus, Wallet, Landmark, DollarSign } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import AccountForm from '@/components/accounts/AccountForm'
import AccountList from '@/components/accounts/AccountList'
import OnboardingTour from '@/components/onboarding/OnboardingTour'
import Toast, { ToastContainer } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useToast } from '@/hooks/useToast'
import accountService, { Account } from '@/services/accountService'
import ConnectedBanks from '@/components/plaid/ConnectedBanks'

export default function AccountsPage() {
  const { isLoading, isAuthenticated, logout } = useAuth()
  const t = useTranslations('accounts')
  const tCommon = useTranslations('common')
  const {
    isOnboardingOpen,
    currentStep: onboardingStep,
    setStep: setOnboardingStep,
    closeOnboarding,
    completeOnboarding,
  } = useOnboarding()
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const { toasts, success, error: toastError, dismiss } = useToast()

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts()
    }
  }, [isAuthenticated])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await accountService.getAccounts()
      
      setAccounts(data)
    } catch (err: any) {
      console.error('Error loading accounts:', err)
      setError(err.message || t('loadError'))
      
      // Si es error de autenticación, mostrar mensaje específico
      if (err.message.includes('401') || err.message.includes('autenticado')) {
        setError(t('loadError'))
      }
    } finally {
      setLoading(false)
    }
  }

  // Si no está autenticado, redirigir (sin bloquear el layout)
  if (!isAuthenticated && !isLoading) return null

  const handleCreateAccount = () => {
    setEditingAccount(null)
    setShowForm(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleSaveAccount = async (accountData: any, accountId?: number) => {
    try {
      if (accountId) {
        // Modo edición: actualizar cuenta existente
        await accountService.updateAccount(accountId, accountData)
      } else {
        // Modo creación: crear nueva cuenta
        await accountService.createAccount(accountData)
      }
      
      await loadAccounts()
      setShowForm(false)
      setEditingAccount(null)
    } catch (err: any) {
      console.error('Error saving account:', err)
      throw err // Re-lanzar el error para que AccountForm lo maneje
    }
  }

  const handleDeleteAccount = async (accountId: number) => {
    setConfirmDeleteId(accountId)
  }

  const handleConfirmDelete = async () => {
    if (confirmDeleteId === null) return
    try {
      await accountService.deactivateAccount(confirmDeleteId)
      await loadAccounts()
      success(t('deactivateSuccess'))
    } catch (err: any) {
      toastError(err.message || t('deactivateError'))
    } finally {
      setConfirmDeleteId(null)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleSidebarToggle = (isCollapsed: boolean) => {
    setSidebarCollapsed(isCollapsed)
  }

  // Calcular totales
  const totalBalance = accounts
    .filter(acc => acc.isActive)
    .reduce((sum, acc) => sum + acc.currentBalance, 0)

  const activeAccounts = accounts.filter(acc => acc.isActive).length

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`} data-tour="accounts-main">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {t('subtitle')}
                </p>
              </div>
              <button
                onClick={handleCreateAccount}
                data-tour="add-account-btn"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('new')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" data-tour="accounts-summary">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 mb-1">{t('totalBalance')}</p>
                  <p className="text-2xl font-bold text-gray-900 break-all">
                    ${totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-12 h-12 shrink-0 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('activeAccounts')}</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAccounts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t('totalAccounts')}</p>
                  <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Accounts List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-tour="account-list">
              {[1,2,3].map(i => (
                <div key={i} className="p-6 border-b border-gray-100 flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200" data-tour="account-list">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('noAccounts')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('noAccountsDesc')}
              </p>
              <button
                onClick={handleCreateAccount}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{t('createFirst')}</span>
              </button>
            </div>
          ) : (
            <div data-tour="account-list">
              <AccountList
                accounts={accounts}
                onEdit={handleEditAccount}
                onDelete={handleDeleteAccount}
              />
            </div>
          )}

          {/* Cuentas bancarias conectadas via Plaid */}
          <div className="mt-6">
            <ConnectedBanks />
          </div>
        </div>
      </div>

      {/* Account Form Modal */}
      <AccountForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingAccount(null)
        }}
        onSave={handleSaveAccount}
        account={editingAccount}
        mode={editingAccount ? 'edit' : 'create'}
      />

      {/* Modal de confirmación de desactivación */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('deactivate')}</h3>
            <p className="text-sm text-gray-600 mb-6">
              {t('deactivateConfirm')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('deactivateBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        currentStep={onboardingStep}
        setStep={setOnboardingStep}
      />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
