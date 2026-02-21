# 📋 Plan de Integración - Fase 2: Transacciones

**Fecha:** 9 de Febrero de 2026  
**Estado:** ✅ Fase 1 Completada - Iniciando Fase 2

---

## ✅ Fase 1: Autenticación (COMPLETADA)

- [x] CORS configurado
- [x] Archivos duplicados resueltos
- [x] Base de datos conectada
- [x] Registro funcionando
- [x] Login funcionando
- [x] Token JWT guardándose correctamente
- [x] Protección de rutas funcionando

---

## 🎯 Fase 2: Integración de Transacciones

### Objetivo:
Conectar el frontend con los endpoints de transacciones del backend para permitir crear, listar, editar y eliminar transacciones.

---

## 📊 Endpoints Disponibles (Backend)

### 1. Listar Transacciones
```
GET /api/transactions
Headers: Authorization: Bearer {token}
Response: Array de transacciones del usuario
```

### 2. Crear Transacción
```
POST /api/transactions
Headers: Authorization: Bearer {token}
Body: {
  type: 0 | 1,  // 0 = Income, 1 = Expense
  amount: number,
  categoryId: number,
  description: string,
  date: string,
  accountId: number,
  debitAmount: number,
  creditAmount: number
}
Response: Transacción creada
```

### 3. Actualizar Transacción
```
PUT /api/transactions/{id}
Headers: Authorization: Bearer {token}
Body: {
  type: 0 | 1,
  amount: number,
  categoryId: number,
  description: string,
  date: string
}
Response: Transacción actualizada
```

### 4. Eliminar Transacción
```
DELETE /api/transactions/{id}
Headers: Authorization: Bearer {token}
Response: 204 No Content
```

---

## 🔧 Tareas a Realizar

### Tarea 1: Crear `transactionService.ts` ⬅️ **EMPEZAR AQUÍ**

**Ubicación:** `BookKeeping/frontend/app-frontend/services/transactionService.ts`

**Contenido:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5088/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface CreateTransactionDto {
  type: 0 | 1;  // 0 = Income, 1 = Expense
  amount: number;
  categoryId: number;
  description: string;
  date: string;
  accountId: number;
  debitAmount: number;
  creditAmount: number;
}

export interface UpdateTransactionDto {
  type: 0 | 1;
  amount: number;
  categoryId: number;
  description: string;
  date: string;
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
}

export const transactionService = {
  async getAll(): Promise<TransactionDto[]> {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener transacciones');
    }
    
    return response.json();
  },

  async create(transaction: CreateTransactionDto): Promise<TransactionDto> {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear transacción');
    }
    
    return response.json();
  },

  async update(id: number, transaction: UpdateTransactionDto): Promise<TransactionDto> {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar transacción');
    }
    
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar transacción');
    }
  }
};
```

---

### Tarea 2: Actualizar `TransactionList.tsx`

**Ubicación:** `BookKeeping/frontend/app-frontend/components/transactions/TransactionList.tsx`

**Cambios:**
1. Importar `transactionService`
2. Reemplazar datos mock con llamada a `transactionService.getAll()`
3. Agregar estado de loading
4. Agregar manejo de errores
5. Implementar función de eliminar con `transactionService.delete()`

---

### Tarea 3: Actualizar `TransactionForm.tsx`

**Ubicación:** `BookKeeping/frontend/app-frontend/components/transactions/TransactionForm.tsx`

**Cambios:**
1. Importar `transactionService`
2. Implementar función de crear con `transactionService.create()`
3. Implementar función de editar con `transactionService.update()`
4. Agregar validaciones
5. Agregar manejo de errores

---

### Tarea 4: Actualizar página de transacciones

**Ubicación:** `BookKeeping/frontend/app-frontend/app/transactions/page.tsx`

**Cambios:**
1. Conectar con los servicios
2. Implementar refresh después de crear/editar/eliminar
3. Agregar estados de loading
4. Agregar manejo de errores

---

## 🧪 Plan de Pruebas

### Prueba 1: Listar Transacciones
1. Ir a `/transactions`
2. Verificar que carga las transacciones de la base de datos
3. Verificar que muestra loading mientras carga
4. Verificar que maneja errores si no hay conexión

### Prueba 2: Crear Transacción
1. Click en "Nueva Transacción"
2. Llenar formulario
3. Guardar
4. Verificar que aparece en la lista
5. Verificar que se guardó en la base de datos

### Prueba 3: Editar Transacción
1. Click en editar una transacción
2. Modificar datos
3. Guardar
4. Verificar que se actualizó en la lista
5. Verificar que se actualizó en la base de datos

### Prueba 4: Eliminar Transacción
1. Click en eliminar una transacción
2. Confirmar
3. Verificar que desaparece de la lista
4. Verificar que se eliminó de la base de datos

---

## 📝 Checklist de Integración

### Servicios
- [ ] Crear `transactionService.ts`
- [ ] Definir interfaces TypeScript
- [ ] Implementar función `getAll()`
- [ ] Implementar función `create()`
- [ ] Implementar función `update()`
- [ ] Implementar función `delete()`

### Componentes
- [ ] Actualizar `TransactionList.tsx`
- [ ] Actualizar `TransactionForm.tsx`
- [ ] Actualizar `page.tsx`
- [ ] Agregar estados de loading
- [ ] Agregar manejo de errores

### Pruebas
- [ ] Probar listar transacciones
- [ ] Probar crear transacción
- [ ] Probar editar transacción
- [ ] Probar eliminar transacción
- [ ] Verificar que el token se envía correctamente
- [ ] Verificar que maneja errores 401 (token expirado)

---

## 🎯 Siguiente Fase

Una vez completada la Fase 2 (Transacciones), continuaremos con:

### Fase 3: Categorías
- Crear `categoryService.ts`
- Conectar formularios de categorías
- Probar CRUD completo

### Fase 4: Cuentas
- Crear `accountService.ts`
- Implementar gestión de cuentas
- Probar CRUD completo

---

## 📚 Recursos

### Documentación del Backend:
- `BACKEND-API-DOCUMENTATION.md` - Documentación completa de endpoints

### Ejemplos de Código:
- `authService.ts` - Referencia para estructura de servicios
- `login/page.tsx` - Referencia para manejo de errores

---

## 🚀 Empezar Ahora

**Siguiente paso:** Crear `transactionService.ts`

¿Quieres que empiece a crear el servicio de transacciones?
