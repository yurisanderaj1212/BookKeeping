export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  description?: string
}

export const defaultCategories: Category[] = [
  // Categorías de Ingresos
  {
    id: 'income-sales',
    name: 'Ventas',
    type: 'income',
    color: '#10B981',
    icon: '💰',
    description: 'Ingresos por ventas de productos o servicios'
  },
  {
    id: 'income-services',
    name: 'Servicios',
    type: 'income',
    color: '#059669',
    icon: '🛠️',
    description: 'Ingresos por prestación de servicios'
  },
  {
    id: 'income-consulting',
    name: 'Consultoría',
    type: 'income',
    color: '#047857',
    icon: '💼',
    description: 'Ingresos por servicios de consultoría'
  },
  {
    id: 'income-investments',
    name: 'Inversiones',
    type: 'income',
    color: '#065F46',
    icon: '📈',
    description: 'Rendimientos de inversiones'
  },
  {
    id: 'income-other',
    name: 'Otros Ingresos',
    type: 'income',
    color: '#064E3B',
    icon: '💵',
    description: 'Otros tipos de ingresos'
  },

  // Categorías de Gastos
  {
    id: 'expense-office',
    name: 'Oficina',
    type: 'expense',
    color: '#EF4444',
    icon: '🏢',
    description: 'Gastos de oficina y suministros'
  },
  {
    id: 'expense-marketing',
    name: 'Marketing',
    type: 'expense',
    color: '#DC2626',
    icon: '📢',
    description: 'Gastos en publicidad y marketing'
  },
  {
    id: 'expense-travel',
    name: 'Viajes',
    type: 'expense',
    color: '#B91C1C',
    icon: '✈️',
    description: 'Gastos de viaje y transporte'
  },
  {
    id: 'expense-utilities',
    name: 'Servicios Públicos',
    type: 'expense',
    color: '#991B1B',
    icon: '⚡',
    description: 'Electricidad, agua, internet, teléfono'
  },
  {
    id: 'expense-software',
    name: 'Software',
    type: 'expense',
    color: '#7F1D1D',
    icon: '💻',
    description: 'Licencias de software y herramientas'
  },
  {
    id: 'expense-equipment',
    name: 'Equipos',
    type: 'expense',
    color: '#6B1D1D',
    icon: '🖥️',
    description: 'Compra de equipos y hardware'
  },
  {
    id: 'expense-professional',
    name: 'Servicios Profesionales',
    type: 'expense',
    color: '#5B1D1D',
    icon: '👨‍💼',
    description: 'Abogados, contadores, consultores'
  },
  {
    id: 'expense-rent',
    name: 'Alquiler',
    type: 'expense',
    color: '#4B1D1D',
    icon: '🏠',
    description: 'Alquiler de oficina o local'
  },
  {
    id: 'expense-other',
    name: 'Otros Gastos',
    type: 'expense',
    color: '#3B1D1D',
    icon: '📋',
    description: 'Otros gastos operativos'
  }
]

export const getCategoryById = (id: string): Category | undefined => {
  return defaultCategories.find(category => category.id === id)
}

export const getCategoriesByType = (type: 'income' | 'expense'): Category[] => {
  return defaultCategories.filter(category => category.type === type)
}

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId)
  return category?.color || '#6B7280'
}

export const getCategoryName = (categoryId: string): string => {
  const category = getCategoryById(categoryId)
  return category?.name || 'Sin categoría'
}

export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId)
  return category?.icon || '📋'
}