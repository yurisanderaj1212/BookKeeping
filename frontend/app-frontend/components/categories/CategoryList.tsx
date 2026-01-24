'use client'

import { useState } from 'react'
import { Edit, Trash2, Filter, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Category } from '@/data/categories-data'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export default function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Filter categories based on search and type
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || category.type === filterType
    return matchesSearch && matchesType
  })

  // Separate by type for better organization
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income')
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense')

  const handleDeleteConfirm = (categoryId: string) => {
    onDelete(categoryId)
    setShowDeleteConfirm(null)
  }

  const CategoryCard = ({ category }: { category: Category }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              category.type === 'income' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.type === 'income' ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Ingreso
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Gasto
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            title="Editar categoría"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(category.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Eliminar categoría"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            >
              <option value="all">Todas las categorías</option>
              <option value="income">Solo ingresos</option>
              <option value="expense">Solo gastos</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {filteredCategories.length} de {categories.length} categorías
          </span>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
              {incomeCategories.length} Ingresos
            </span>
            <span className="flex items-center">
              <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
              {expenseCategories.length} Gastos
            </span>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron categorías</h3>
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primera categoría'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Income Categories */}
          {(filterType === 'all' || filterType === 'income') && incomeCategories.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Categorías de Ingresos ({incomeCategories.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}

          {/* Expense Categories */}
          {(filterType === 'all' || filterType === 'expense') && expenseCategories.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Categorías de Gastos ({expenseCategories.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
                    Eliminar Categoría
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 text-sm">
                ¿Estás seguro de que quieres eliminar esta categoría?
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