// Category Service - Maneja las operaciones con categorías del backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api'

// Interfaces
export interface CategoryDto {
  id: number
  name: string
  type: number // 0 = Income, 1 = Expense
  isActive: boolean
  isSystemDefault: boolean // true = categoría predefinida del sistema
  displayOrder: number // orden de visualización
}

export interface CreateCategoryDto {
  name: string
  type: number
  isActive: boolean
}

// Helper para obtener headers con autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Obtener todas las categorías (con filtro opcional por tipo)
export const getAll = async (type?: number): Promise<CategoryDto[]> => {
  try {
    const url = type !== undefined 
      ? `${API_URL}/category?type=${type}` 
      : `${API_URL}/category`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    if (!response.ok) {
      throw new Error('Error al obtener las categorías')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error in getAll categories:', error)
    throw error
  }
}

// Obtener categorías por defecto (sin autenticación)
export const getDefault = async (): Promise<CategoryDto[]> => {
  try {
    const response = await fetch(`${API_URL}/category/default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Error al obtener las categorías por defecto')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error in getDefault categories:', error)
    throw error
  }
}

// Obtener categoría por ID
export const getById = async (id: number): Promise<CategoryDto> => {
  try {
    const response = await fetch(`${API_URL}/category/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })

    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    if (response.status === 404) {
      throw new Error('Categoría no encontrada')
    }

    if (!response.ok) {
      throw new Error('Error al obtener la categoría')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error in getById category:', error)
    throw error
  }
}

// Crear nueva categoría
export const create = async (category: CreateCategoryDto): Promise<CategoryDto> => {
  try {
    const response = await fetch(`${API_URL}/category`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    })

    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    if (response.status === 409) {
      throw new Error('Ya existe una categoría con ese nombre')
    }

    if (!response.ok) {
      throw new Error('Error al crear la categoría')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error in create category:', error)
    throw error
  }
}

// Actualizar categoría existente
export const update = async (id: number, category: CreateCategoryDto): Promise<CategoryDto> => {
  try {
    const response = await fetch(`${API_URL}/category/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    })

    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    if (response.status === 404) {
      throw new Error('Categoría no encontrada')
    }

    if (!response.ok) {
      throw new Error('Error al actualizar la categoría')
    }

    return await response.json()
  } catch (error: any) {
    console.error('Error in update category:', error)
    throw error
  }
}

// Eliminar categoría
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/category/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (response.status === 401) {
      throw new Error('No autorizado. Por favor inicia sesión nuevamente.')
    }

    if (response.status === 404) {
      throw new Error('Categoría no encontrada')
    }

    if (!response.ok) {
      throw new Error('Error al eliminar la categoría')
    }
  } catch (error: any) {
    console.error('Error in delete category:', error)
    throw error
  }
}
