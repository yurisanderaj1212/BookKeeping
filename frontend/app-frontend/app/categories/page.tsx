'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import CategoryList from '../../components/categories/CategoryList'
import CategoryForm from '../../components/categories/CategoryForm'
import { defaultCategories, Category } from '@/data/categories-data'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const handleLogout = async () => {
    // TODO: Implement actual logout logic
    console.log('Logging out...')
    router.push('/auth/login')
  }

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `${categoryData.type}-${Date.now()}`
    }
    setCategories(prev => [...prev, newCategory])
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleUpdateCategory = (categoryData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      setCategories(prev => 
        prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...categoryData, id: editingCategory.id }
            : cat
        )
      )
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
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
                  Categorías
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona las categorías de tus transacciones
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Categoría</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Categories List */}
        <CategoryList
          categories={categories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
        />

        {/* Category Form Modal */}
        <CategoryForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          editingCategory={editingCategory}
        />
        </div>
      </div>
    </div>
  )
}