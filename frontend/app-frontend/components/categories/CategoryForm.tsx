'use client'

import { useState, useEffect } from 'react'
import { X, Tag, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { Category } from '@/data/categories-data'

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (category: Omit<Category, 'id'>) => void
  editingCategory?: Category | null
}

export default function CategoryForm({ isOpen, onClose, onSubmit, editingCategory }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'income' as 'income' | 'expense',
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load editing category data
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
        description: editingCategory.description || ''
      })
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        type: 'income',
        description: ''
      })
    }
    // Clear errors when category changes
    setErrors({})
  }, [editingCategory, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      const category: Omit<Category, 'id'> = {
        name: formData.name.trim(),
        type: formData.type,
        color: formData.type === 'income' ? '#10B981' : '#EF4444', // Default colors
        icon: formData.type === 'income' ? '💰' : '💸', // Default icons
        description: formData.description.trim() || undefined
      }

      onSubmit(category)
      onClose()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Category Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Categoría
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Ingreso</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <TrendingDown className="w-4 h-4" />
                  <span className="font-medium">Gasto</span>
                </div>
              </button>
            </div>
          </div>

          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Nombre de la Categoría
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Ventas, Oficina, Marketing..."
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
              placeholder="Describe para qué se usa esta categoría..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm"
            >
              {editingCategory ? 'Actualizar' : 'Crear'} Categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}