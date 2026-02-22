'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Transaction } from '@/data/transactions-data'
import * as categoryService from '@/services/categoryService'
import accountService, { Account } from '@/services/accountService'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (transaction: Transaction) => void
  transaction?: Transaction | null
  mode: 'create' | 'edit'
}

export default function TransactionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction, 
  mode = 'create' 
}: TransactionFormProps) {
  
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: '',
    accountId: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<{
    income: Array<{ value: string; label: string; isSystem: boolean }>
    expense: Array<{ value: string; label: string; isSystem: boolean }>
  }>({
    income: [],
    expense: []
  })
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [showAccountWarning, setShowAccountWarning] = useState(false)

  // Cargar categorías del backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const allCategories = await categoryService.getAll()
        
        const incomeCategories = allCategories
          .filter(cat => cat.type === 0 && cat.isActive)
          .sort((a, b) => {
            if (a.isSystemDefault && !b.isSystemDefault) return -1
            if (!a.isSystemDefault && b.isSystemDefault) return 1
            return a.displayOrder - b.displayOrder
          })
          .map(cat => ({
            value: cat.id.toString(),
            label: cat.name,
            isSystem: cat.isSystemDefault
          }))
        
        const expenseCategories = allCategories
          .filter(cat => cat.type === 1 && cat.isActive)
          .sort((a, b) => {
            if (a.isSystemDefault && !b.isSystemDefault) return -1
            if (!a.isSystemDefault && b.isSystemDefault) return 1
            return a.displayOrder - b.displayOrder
          })
          .map(cat => ({
            value: cat.id.toString(),
            label: cat.name,
            isSystem: cat.isSystemDefault
          }))
        
        setCategories({
          income: incomeCategories,
          expense: expenseCategories
        })
      } catch (error) {
        console.error('Error loading categories:', error)
        setCategories({ income: [], expense: [] })
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  // Cargar cuentas del backend
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true)
        const userAccounts = await accountService.getAccounts()
        const activeAccounts = userAccounts.filter(acc => acc.isActive)
        setAccounts(activeAccounts)
      } catch (error) {
        console.error('Error loading accounts:', error)
        setAccounts([])
      } finally {
        setLoadingAccounts(false)
      }
    }

    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  // Actualizar cuenta seleccionada cuando cambia accountId
  useEffect(() => {
    if (formData.accountId) {
      const account = accounts.find(acc => acc.id === parseInt(formData.accountId))
      setSelectedAccount(account || null)
      
      if (account && formData.type === 'expense' && formData.amount) {
        const amount = parseFloat(formData.amount)
        if (amount > account.currentBalance) {
          setShowAccountWarning(true)
        } else {
          setShowAccountWarning(false)
        }
      } else {
        setShowAccountWarning(false)
      }
    } else {
      setSelectedAccount(null)
      setShowAccountWarning(false)
    }
  }, [formData.accountId, formData.type, formData.amount, accounts])

  // Update form data when transaction changes
  useEffect(() => {
    if (transaction && transaction !== null) {
      setFormData({
        type: transaction.type || 'income',
        amount: transaction.amount?.toString() || '',
        description: transaction.description || '',
        category: transaction.category || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        status: transaction.status || 'pending',
        notes: transaction.notes || '',
        accountId: transaction.accountId?.toString() || ''
      })
    } else {
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        accountId: ''
      })
    }
    setErrors({})
    setShowAccountWarning(false)
  }, [transaction, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El monto es requerido y debe ser mayor a 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es requerida'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const transactionData: Transaction = {
        ...formData,
        type: formData.type as 'income' | 'expense',
        status: formData.status as 'pending' | 'completed',
        amount: parseFloat(formData.amount),
        accountId: formData.accountId ? parseInt(formData.accountId) : undefined,
        id: transaction?.id || Date.now().toString()
      }
      
      onSave(transactionData)
      onClose()
      
      if (mode === 'create') {
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          notes: '',
          accountId: ''
        })
        setShowAccountWarning(false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {mode === 'create' ? 'Nueva Transacción' : 'Editar Transacción'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Tipo, Fecha y Monto en una fila */}
          <div className="grid grid-cols-3 gap-3">
            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-red-500 text-xs mt-0.5">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese descripción"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-0.5">{errors.description}</p>
            )}
          </div>

          {/* Cuenta y Categoría en dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            {/* Selector de Cuenta */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cuenta <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              
              <select
                value={formData.accountId}
                onChange={(e) => handleInputChange('accountId', e.target.value)}
                disabled={loadingAccounts}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors.accountId ? 'border-red-500' : 'border-gray-300'
                } ${loadingAccounts ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loadingAccounts ? 'Cargando...' : '📝 Sin cuenta'}
                </option>
                
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${account.currentBalance.toFixed(2)}
                  </option>
                ))}
              </select>
              
              {errors.accountId && (
                <p className="text-red-500 text-xs mt-0.5">{errors.accountId}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={loadingCategories}
                className={`w-full px-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loadingCategories ? 'Cargando...' : 'Seleccionar'}
                </option>
                
                {categories[formData.type as keyof typeof categories]
                  .filter(cat => cat.isSystem)
                  .map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                
                {categories[formData.type as keyof typeof categories].some(cat => !cat.isSystem) && (
                  <option disabled>──────────</option>
                )}
                
                {categories[formData.type as keyof typeof categories]
                  .filter(cat => !cat.isSystem)
                  .map((category) => (
                    <option key={category.value} value={category.value}>
                      📌 {category.label}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-xs mt-0.5">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Mensajes informativos compactos */}
          {accounts.length === 0 && !loadingAccounts && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-800">
                💡 No tienes cuentas. <button type="button" onClick={() => window.open('/accounts', '_blank')} className="underline hover:text-blue-900">Crear una</button>
              </p>
            </div>
          )}
          
          {selectedAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <p className="text-xs text-blue-800">
                Balance: ${selectedAccount.currentBalance.toFixed(2)} {selectedAccount.currency}
              </p>
            </div>
          )}
          
          {showAccountWarning && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
              <p className="text-xs text-orange-800">
                ⚠️ Balance resultante: ${(selectedAccount!.currentBalance - parseFloat(formData.amount || '0')).toFixed(2)}
              </p>
            </div>
          )}
          
          {!formData.accountId && !loadingAccounts && accounts.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p className="text-xs text-gray-600">
                💡 Sin cuenta asignada. Podrás asignarla después.
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Estado
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('status', 'pending')}
                className={`px-2 py-1.5 rounded-lg border transition-all duration-200 text-xs ${
                  formData.status === 'pending'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Pendiente
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('status', 'completed')}
                className={`px-2 py-1.5 rounded-lg border transition-all duration-200 text-xs ${
                  formData.status === 'completed'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Completada
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notas <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              placeholder="Notas adicionales..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingCategories}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
