export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  description?: string
}

// Predefined categories for small businesses in the US
export const defaultCategories: Category[] = [
  // Income Categories
  {
    id: 'income-sales',
    name: 'Ventas de Productos',
    type: 'income',
    color: '#10B981',
    icon: '💰',
    description: 'Ingresos por venta de productos físicos o digitales'
  },
  {
    id: 'income-services',
    name: 'Servicios Prestados',
    type: 'income',
    color: '#059669',
    icon: '🛠️',
    description: 'Ingresos por prestación de servicios profesionales'
  },
  {
    id: 'income-consulting',
    name: 'Consultoría',
    type: 'income',
    color: '#047857',
    icon: '💼',
    description: 'Ingresos por servicios de consultoría y asesoría'
  },
  {
    id: 'income-freelance',
    name: 'Trabajo Freelance',
    type: 'income',
    color: '#065F46',
    icon: '💻',
    description: 'Ingresos por trabajo independiente o por proyectos'
  },
  {
    id: 'income-subscriptions',
    name: 'Suscripciones',
    type: 'income',
    color: '#064E3B',
    icon: '🔄',
    description: 'Ingresos recurrentes por suscripciones'
  },
  {
    id: 'income-commissions',
    name: 'Comisiones',
    type: 'income',
    color: '#10B981',
    icon: '🤝',
    description: 'Ingresos por comisiones de ventas o referidos'
  },
  {
    id: 'income-rental',
    name: 'Ingresos por Alquiler',
    type: 'income',
    color: '#059669',
    icon: '🏠',
    description: 'Ingresos por alquiler de propiedades o equipos'
  },
  {
    id: 'income-investments',
    name: 'Inversiones',
    type: 'income',
    color: '#047857',
    icon: '📈',
    description: 'Rendimientos de inversiones y dividendos'
  },
  {
    id: 'income-grants',
    name: 'Subvenciones',
    type: 'income',
    color: '#065F46',
    icon: '🎯',
    description: 'Subvenciones gubernamentales o privadas'
  },
  {
    id: 'income-other',
    name: 'Otros Ingresos',
    type: 'income',
    color: '#064E3B',
    icon: '💵',
    description: 'Otros tipos de ingresos no categorizados'
  },

  // Expense Categories
  {
    id: 'expense-office-supplies',
    name: 'Suministros de Oficina',
    type: 'expense',
    color: '#EF4444',
    icon: '📝',
    description: 'Papelería, materiales de oficina y suministros'
  },
  {
    id: 'expense-marketing',
    name: 'Marketing y Publicidad',
    type: 'expense',
    color: '#DC2626',
    icon: '📢',
    description: 'Gastos en publicidad, marketing digital y promociones'
  },
  {
    id: 'expense-travel',
    name: 'Viajes de Negocios',
    type: 'expense',
    color: '#B91C1C',
    icon: '✈️',
    description: 'Gastos de viaje, hospedaje y transporte de negocios'
  },
  {
    id: 'expense-utilities',
    name: 'Servicios Públicos',
    type: 'expense',
    color: '#991B1B',
    icon: '⚡',
    description: 'Electricidad, agua, gas, internet y teléfono'
  },
  {
    id: 'expense-software',
    name: 'Software y Licencias',
    type: 'expense',
    color: '#7F1D1D',
    icon: '💻',
    description: 'Licencias de software, aplicaciones y herramientas digitales'
  },
  {
    id: 'expense-equipment',
    name: 'Equipos y Hardware',
    type: 'expense',
    color: '#6B1D1D',
    icon: '🖥️',
    description: 'Compra de equipos, computadoras y hardware'
  },
  {
    id: 'expense-professional',
    name: 'Servicios Profesionales',
    type: 'expense',
    color: '#5B1D1D',
    icon: '👨‍💼',
    description: 'Abogados, contadores, consultores externos'
  },
  {
    id: 'expense-rent',
    name: 'Alquiler de Oficina',
    type: 'expense',
    color: '#4B1D1D',
    icon: '🏢',
    description: 'Alquiler de oficina, local comercial o espacio de trabajo'
  },
  {
    id: 'expense-insurance',
    name: 'Seguros',
    type: 'expense',
    color: '#3B1D1D',
    icon: '🛡️',
    description: 'Seguros de negocio, responsabilidad civil y otros'
  },
  {
    id: 'expense-taxes',
    name: 'Impuestos',
    type: 'expense',
    color: '#2B1D1D',
    icon: '🏛️',
    description: 'Impuestos federales, estatales y locales'
  },
  {
    id: 'expense-payroll',
    name: 'Nómina y Beneficios',
    type: 'expense',
    color: '#1B1D1D',
    icon: '👥',
    description: 'Salarios, beneficios y gastos de personal'
  },
  {
    id: 'expense-inventory',
    name: 'Inventario',
    type: 'expense',
    color: '#EF4444',
    icon: '📦',
    description: 'Compra de inventario y materias primas'
  },
  {
    id: 'expense-shipping',
    name: 'Envíos y Logística',
    type: 'expense',
    color: '#DC2626',
    icon: '🚚',
    description: 'Gastos de envío, logística y distribución'
  },
  {
    id: 'expense-banking',
    name: 'Gastos Bancarios',
    type: 'expense',
    color: '#B91C1C',
    icon: '🏦',
    description: 'Comisiones bancarias, intereses y gastos financieros'
  },
  {
    id: 'expense-training',
    name: 'Capacitación',
    type: 'expense',
    color: '#991B1B',
    icon: '📚',
    description: 'Cursos, capacitación y desarrollo profesional'
  },
  {
    id: 'expense-maintenance',
    name: 'Mantenimiento',
    type: 'expense',
    color: '#7F1D1D',
    icon: '🔧',
    description: 'Mantenimiento de equipos, reparaciones y servicios'
  },
  {
    id: 'expense-meals',
    name: 'Comidas de Negocios',
    type: 'expense',
    color: '#6B1D1D',
    icon: '🍽️',
    description: 'Comidas de negocios y entretenimiento de clientes'
  },
  {
    id: 'expense-other',
    name: 'Otros Gastos',
    type: 'expense',
    color: '#5B1D1D',
    icon: '📋',
    description: 'Otros gastos operativos no categorizados'
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