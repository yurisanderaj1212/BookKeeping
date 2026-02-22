/**
 * Servicio para gestionar transacciones
 * Conecta con el backend API para operaciones CRUD de transacciones
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Interfaces basadas en los DTOs del backend
export interface CreateTransactionDto {
  type: 0 | 1;  // 0 = Income (Ingreso), 1 = Expense (Gasto)
  amount: number;
  categoryId: number;
  description: string;
  date: string;  // Formato: YYYY-MM-DD
  accountId?: number;  // Opcional: cuenta asociada a la transacción
  notes?: string;
}

export interface UpdateTransactionDto {
  type?: 0 | 1;  // 0 = Income (Ingreso), 1 = Expense (Gasto)
  amount?: number;
  categoryId?: number;
  description?: string;
  date?: string;  // Formato: YYYY-MM-DD
  accountId?: number | null;  // Opcional: cuenta asociada (puede ser null para desasignar)
}

export interface TransactionDto {
  id: number;
  type: 0 | 1;
  amount: number;
  categoryId: number;
  categoryName?: string;
  description: string;
  date: string;
  createdAt: string;
  accountId?: number;  // Campo opcional para la cuenta asociada
  notes?: string;
}

/**
 * Obtener todas las transacciones del usuario autenticado
 */
export async function getAll(): Promise<TransactionDto[]> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      throw new Error('Error al obtener transacciones');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en getAll:', error);
    throw error;
  }
}

/**
 * Crear una nueva transacción
 */
export async function create(transaction: CreateTransactionDto): Promise<TransactionDto> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear transacción');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en create:', error);
    throw error;
  }
}

/**
 * Actualizar una transacción existente
 */
export async function update(id: number, transaction: UpdateTransactionDto): Promise<TransactionDto> {
  try {
    console.log('📤 Enviando actualización:', { id, transaction });
    
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    if (response.status === 404) {
      throw new Error('Transacción no encontrada');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error del servidor:', errorData);
      throw new Error(errorData.message || 'Error al actualizar transacción');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error en update:', error);
    throw error;
  }
}

/**
 * Eliminar una transacción
 */
export async function deleteTransaction(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    if (response.status === 404) {
      throw new Error('Transacción no encontrada');
    }
    
    if (!response.ok) {
      throw new Error('Error al eliminar transacción');
    }
  } catch (error) {
    console.error('Error en delete:', error);
    throw error;
  }
}

