'use client'

import { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { getCategoryName, getCategoryColor } from '@/data/categories-data'
import { Transaction } from '@/data/transactions-data'

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete
}: TransactionListProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    // Return date in YYYY-MM-DD format
    return dateString
  }

  const getCategoryLabel = (categoryId: string) => {
    return getCategoryName(categoryId)
  }

  const getCategoryColorClass = (categoryId: string) => {
    // Convert hex color to Tailwind classes based on category type
    const categoryName = getCategoryName(categoryId)
    
    // Default colors for different categories
    const colorMap: Record<string, string> = {
      'Ventas': 'bg-green-100 text-green-800',
      'Servicios': 'bg-blue-100 text-blue-800',
      'Consultoría': 'bg-purple-100 text-purple-800',
      'Inversiones': 'bg-emerald-100 text-emerald-800',
      'Otros Ingresos': 'bg-gray-100 text-gray-800',
      'Oficina': 'bg-orange-100 text-orange-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Viajes': 'bg-cyan-100 text-cyan-800',
      'Servicios Públicos': 'bg-yellow-100 text-yellow-800',
      'Software': 'bg-indigo-100 text-indigo-800',
      'Equipos': 'bg-slate-100 text-slate-800',
      'Servicios Profesionales': 'bg-violet-100 text-violet-800',
      'Alquiler': 'bg-rose-100 text-rose-800',
      'Otros Gastos': 'bg-gray-100 text-gray-800'
    }

    return colorMap[categoryName] || 'bg-gray-100 text-gray-800'
  }

  const filteredTransactions = transactions

  const handleDeleteConfirm = (transactionId: string) => {
    onDelete(transactionId)
    setShowDeleteConfirm(null)
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron transacciones
          </h3>
          <p className="text-gray-500">
            Intenta ajustar los filtros o agregar una nueva transacción.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Container with horizontal scroll prevention */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>
                Fecha
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '30%' }}>
                Descripción
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '16%' }}>
                Categoría
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>
                Monto
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '14%' }}>
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '12%' }}>
                Acciones
              </th>
            </tr>
          </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredTransactions.map((transaction) => (
            <tr 
              key={transaction.id} 
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Date */}
              <td className="px-4 py-4 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(transaction.date)}
                </p>
              </td>

              {/* Description */}
              <td className="px-4 py-4">
                <div className="w-full">
                  <p className="text-sm font-medium text-gray-900 truncate" title={transaction.description}>
                    {transaction.description}
                  </p>
                  {transaction.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate" title={transaction.notes}>
                      {transaction.notes}
                    </p>
                  )}
                </div>
              </td>

              {/* Category */}
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColorClass(transaction.category)}`}>
                  {getCategoryLabel(transaction.category)}
                </span>
              </td>

              {/* Amount */}
              <td className="px-4 py-4 text-center">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </td>

              {/* Status */}
              <td className="px-4 py-4 text-center">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status === 'completed' ? 'Completada' : 'Pendiente'}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-gray-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(transaction.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredTransactions.length} transacciones
          </p>
          <div className="flex items-center space-x-6">
            <div className="text-sm">
              <span className="text-gray-600">
                Total Ingresos: 
              </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">
                Total Gastos: 
              </span>
              <span className="font-semibold text-red-600">
                {formatCurrency(
                  filteredTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full shadow-xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Transacción
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 text-sm">
                ¿Estás seguro de que quieres eliminar esta transacción?
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}