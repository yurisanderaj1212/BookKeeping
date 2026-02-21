# 📚 Documentación Completa del Backend API - BookKeeping

## 🎯 Información General

**Base URL:** `http://localhost:5088` (o el puerto configurado en launchSettings.json)  
**Autenticación:** JWT Bearer Token  
**Base de Datos:** SQL Server LocalDB  
**Framework:** ASP.NET Core 8.0

---

## 🔐 Autenticación (AuthController)

### 1. Registro de Usuario
**Endpoint:** `POST /api/auth/register`  
**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Validaciones:**
- Email único y formato válido
- Password mínimo 8 caracteres
- Debe incluir: mayúsculas, minúsculas, números y símbolos
- Las contraseñas deben coincidir

**Response Success (200):**
```json
"Usuario registrado exitosamente."
```

**Response Error (400):**
```json
{
  "Password": ["La contraseña es demasiado débil..."],
  "ConfirmPassword": ["Las contraseñas no coinciden."]
}
```

---

### 2. Login de Usuario
**Endpoint:** `POST /api/auth/login`  
**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "Password123!"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-02-10T15:30:00Z",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

**Response Error (401):**
```json
"Credenciales inválidas."
```

**Notas:**
- El token expira en 1 hora
- Usar el token en header: `Authorization: Bearer {token}`

---

## 💰 Transacciones (TransactionsController)

**Base Route:** `/api/transactions`  
**Autenticación:** Requerida (JWT)

### 1. Crear Transacción
**Endpoint:** `POST /api/transactions`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": 0,  // 0 = Income, 1 = Expense
  "amount": 1500.50,
  "categoryId": 1,
  "description": "Venta de producto",
  "date": "2025-02-09",
  "accountId": 1,
  "debitAmount": 1500.50,
  "creditAmount": 0
}
```

**Response Success (201):**
```json
{
  "id": 1,
  "type": 0,
  "amount": 1500.50,
  "categoryId": 1,
  "description": "Venta de producto",
  "date": "2025-02-09T00:00:00Z",
  "createdAt": "2025-02-09T10:30:00Z"
}
```

---

### 2. Obtener Todas las Transacciones
**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "type": 0,
    "amount": 1500.50,
    "categoryId": 1,
    "categoryName": "Ventas",
    "description": "Venta de producto",
    "date": "2025-02-09T00:00:00Z",
    "createdAt": "2025-02-09T10:30:00Z"
  },
  {
    "id": 2,
    "type": 1,
    "amount": 500.00,
    "categoryId": 5,
    "categoryName": "Oficina",
    "description": "Compra de suministros",
    "date": "2025-02-08T00:00:00Z",
    "createdAt": "2025-02-08T14:20:00Z"
  }
]
```

---

### 3. Actualizar Transacción
**Endpoint:** `PUT /api/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": 0,
  "amount": 1600.00,
  "categoryId": 1,
  "description": "Venta de producto actualizada",
  "date": "2025-02-09"
}
```

**Response Success (200):**
```json
{
  "id": 1,
  "type": 0,
  "amount": 1600.00,
  "categoryId": 1,
  "description": "Venta de producto actualizada",
  "date": "2025-02-09T00:00:00Z"
}
```

**Response Error (404):**
```json
"Transacción no encontrada"
```

---

### 4. Eliminar Transacción
**Endpoint:** `DELETE /api/transactions/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (204):**
```
No Content
```

**Response Error (404):**
```json
"Transacción no encontrada"
```

---

## 📂 Categorías (CategoryController)

**Base Route:** `/api/category`  
**Autenticación:** Requerida (excepto /default)

### 1. Obtener Todas las Categorías
**Endpoint:** `GET /api/category`

**Query Parameters:**
- `type` (opcional): 0 = Income, 1 = Expense

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Ventas",
    "type": 0,
    "isActive": true
  },
  {
    "id": 2,
    "name": "Servicios",
    "type": 0,
    "isActive": true
  },
  {
    "id": 5,
    "name": "Oficina",
    "type": 1,
    "isActive": true
  }
]
```

---

### 2. Obtener Categorías por Defecto
**Endpoint:** `GET /api/category/default`  
**Autenticación:** No requerida

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Ventas",
    "type": 0,
    "isActive": true
  },
  {
    "id": 2,
    "name": "Servicios",
    "type": 0,
    "isActive": true
  }
]
```

---

### 3. Obtener Categoría por ID
**Endpoint:** `GET /api/category/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "id": 1,
  "name": "Ventas",
  "type": 0,
  "isActive": true
}
```

**Response Error (404):**
```json
{
  "message": "Categoría con ID 1 no encontrada"
}
```

---

### 4. Crear Categoría
**Endpoint:** `POST /api/category`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Marketing Digital",
  "type": 1,
  "isActive": true
}
```

**Response Success (201):**
```json
{
  "id": 10,
  "name": "Marketing Digital",
  "type": 1,
  "isActive": true
}
```

**Response Error (409):**
```json
{
  "message": "Ya existe una categoría con ese nombre"
}
```

---

### 5. Actualizar Categoría
**Endpoint:** `PUT /api/category/{id}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Marketing Digital y Publicidad",
  "type": 1,
  "isActive": true
}
```

**Response Success (200):**
```json
{
  "id": 10,
  "name": "Marketing Digital y Publicidad",
  "type": 1,
  "isActive": true
}
```

---

### 6. Eliminar Categoría
**Endpoint:** `DELETE /api/category/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (204):**
```
No Content
```

**Response Error (404):**
```json
{
  "message": "Categoría con ID 10 no encontrada"
}
```

---

## 🏦 Cuentas (AccountsController)

**Base Route:** `/api/accounts`  
**Autenticación:** Requerida

### 1. Crear Cuenta
**Endpoint:** `POST /api/accounts/users/{userId}`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Cuenta Corriente Principal",
  "code": "1010",
  "type": "Asset",
  "subType": "CurrentAsset",
  "initialBalance": 10000.00,
  "description": "Cuenta principal de operaciones",
  "currency": "USD"
}
```

**Response Success (201):**
```json
{
  "id": 1,
  "name": "Cuenta Corriente Principal",
  "code": "1010",
  "type": "Asset",
  "subType": "CurrentAsset",
  "currentBalance": 10000.00,
  "currency": "USD",
  "isActive": true
}
```

---

### 2. Obtener Cuentas del Usuario
**Endpoint:** `GET /api/accounts/users/{userId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
[
  {
    "id": 1,
    "name": "Cuenta Corriente Principal",
    "code": "1010",
    "type": "Asset",
    "subType": "CurrentAsset",
    "currentBalance": 10000.00,
    "currency": "USD",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Caja Chica",
    "code": "1020",
    "type": "Asset",
    "subType": "CurrentAsset",
    "currentBalance": 500.00,
    "currency": "USD",
    "isActive": true
  }
]
```

---

### 3. Obtener Balance de Cuenta
**Endpoint:** `GET /api/accounts/{accountId}/balance`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "accountId": 1,
  "accountName": "Cuenta Corriente Principal",
  "currentBalance": 10000.00,
  "currency": "USD",
  "lastUpdated": "2025-02-09T10:30:00Z"
}
```

---

### 4. Desactivar Cuenta
**Endpoint:** `DELETE /api/accounts/{accountId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (204):**
```
No Content
```

**Response Error (400):**
```json
{
  "message": "No se puede desactivar una cuenta con transacciones activas"
}
```

---

## 📊 Modelos de Datos

### TransactionType (Enum)
```csharp
0 = Income   // Ingreso
1 = Expense  // Gasto
```

### AccountType (Enum)
```csharp
Asset      // Activo
Liability  // Pasivo
Equity     // Patrimonio
Revenue    // Ingreso
Expense    // Gasto
```

### AccountSubType (Enum)
```csharp
CurrentAsset      // Activo Corriente
FixedAsset        // Activo Fijo
CurrentLiability  // Pasivo Corriente
LongTermLiability // Pasivo a Largo Plazo
OwnerEquity       // Patrimonio del Propietario
OperatingRevenue  // Ingreso Operativo
OperatingExpense  // Gasto Operativo
```

---

## 🔧 Configuración del Frontend

### 1. Actualizar authService.ts

```typescript
const API_URL = 'http://localhost:5088/api';

export const authService = {
  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en el registro');
    }
    
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Credenciales inválidas');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
```

### 2. Crear transactionService.ts

```typescript
const API_URL = 'http://localhost:5088/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const transactionService = {
  async getAll() {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener transacciones');
    return response.json();
  },

  async create(transaction: CreateTransactionDto) {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) throw new Error('Error al crear transacción');
    return response.json();
  },

  async update(id: number, transaction: UpdateTransactionDto) {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) throw new Error('Error al actualizar transacción');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al eliminar transacción');
  }
};
```

### 3. Crear categoryService.ts

```typescript
const API_URL = 'http://localhost:5088/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const categoryService = {
  async getAll(type?: number) {
    const url = type !== undefined 
      ? `${API_URL}/category?type=${type}` 
      : `${API_URL}/category`;
      
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener categorías');
    return response.json();
  },

  async getDefault() {
    const response = await fetch(`${API_URL}/category/default`);
    if (!response.ok) throw new Error('Error al obtener categorías por defecto');
    return response.json();
  },

  async create(category: CreateCategoryDto) {
    const response = await fetch(`${API_URL}/category`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(category)
    });
    
    if (!response.ok) throw new Error('Error al crear categoría');
    return response.json();
  }
};
```

---

## 🚀 Pasos para Iniciar el Backend

1. **Abrir el proyecto en Visual Studio o VS Code**
   ```bash
   cd BookKeeping
   ```

2. **Restaurar paquetes NuGet**
   ```bash
   dotnet restore
   ```

3. **Actualizar la base de datos**
   ```bash
   dotnet ef database update
   ```

4. **Ejecutar el proyecto**
   ```bash
   dotnet run
   ```

5. **Verificar que está corriendo**
   - Abrir: `https://localhost:5088/swagger`
   - Deberías ver la documentación Swagger con todos los endpoints

---

## 🔍 Testing con Swagger

1. Ir a `https://localhost:5088/swagger`
2. Probar el endpoint `/api/auth/register` para crear un usuario
3. Probar el endpoint `/api/auth/login` para obtener el token
4. Hacer clic en "Authorize" y pegar el token
5. Ahora puedes probar todos los endpoints protegidos

---

## ⚠️ Notas Importantes

1. **CORS**: Si el frontend está en un puerto diferente, necesitas configurar CORS en `Program.cs`
2. **Base de Datos**: Asegúrate de tener SQL Server LocalDB instalado
3. **JWT Secret**: Cambia la clave secreta en `appsettings.json` en producción
4. **HTTPS**: El backend usa HTTPS por defecto, asegúrate de confiar en el certificado de desarrollo

---

## 📝 Próximos Pasos de Integración

1. ✅ Actualizar `authService.ts` con los endpoints reales
2. ✅ Crear `transactionService.ts` para gestión de transacciones
3. ✅ Crear `categoryService.ts` para gestión de categorías
4. ✅ Actualizar componentes para usar los servicios reales
5. ✅ Implementar manejo de errores global
6. ✅ Agregar interceptores para el token JWT
7. ✅ Implementar refresh token si es necesario

---

**Fecha de actualización:** 9 de Febrero de 2025  
**Versión del Backend:** 1.0.0  
**Desarrollado por:** Equipo BookKeeping
