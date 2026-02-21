# 📋 Plan de Implementación: Categorías Predefinidas

**Objetivo:** Tener 5 categorías predefinidas por tipo (Ingresos/Gastos) + opción "Otros" que permita crear categorías personalizadas.

---

## 🎯 División de Responsabilidades

### **Backend (Tu amigo debe implementar):**

#### 1. Modificar el Modelo Category
Agregar el campo `IsSystemCategory` al modelo:

```csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Type { get; set; } // 0 = Income, 1 = Expense
    public int UserId { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemCategory { get; set; } // NUEVO
    public DateTime CreatedAt { get; set; }
    
    public User User { get; set; }
}
```

#### 2. Actualizar el DTO CategoryDto
```csharp
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Type { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemCategory { get; set; } // NUEVO
}
```

#### 3. Crear Método para Categorías por Defecto
En el servicio de usuarios o en el AuthController, al registrar un usuario:

```csharp
private async Task CreateDefaultCategoriesForUser(int userId)
{
    var defaultCategories = new[]
    {
        // Ingresos (Type = 0)
        new Category { Name = "Ventas", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Servicios", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Consultoría", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Inversiones", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Otros Ingresos", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        
        // Gastos (Type = 1)
        new Category { Name = "Oficina", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Marketing", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Software", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Servicios Públicos", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow },
        new Category { Name = "Otros Gastos", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true, CreatedAt = DateTime.UtcNow }
    };
    
    await _context.Categories.AddRangeAsync(defaultCategories);
    await _context.SaveChangesAsync();
}
```

#### 4. Llamar al Método en el Registro
En `AuthController.Register`:

```csharp
[HttpPost("register")]
public async IActionResult Register([FromBody] RegisterRequest request)
{
    // ... validaciones existentes ...
    
    // Crear usuario
    var user = new User { /* ... */ };
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    
    // NUEVO: Crear categorías por defecto
    await CreateDefaultCategoriesForUser(user.Id);
    
    return Ok("Usuario registrado exitosamente.");
}
```

#### 5. Modificar DELETE de Categorías
No permitir eliminar categorías del sistema:

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    var category = await _categoryService.GetByIdAsync(id);
    
    if (category == null)
        return NotFound(new { message = $"Categoría con ID {id} no encontrada" });
    
    // NUEVO: Verificar si es categoría del sistema
    if (category.IsSystemCategory)
        return BadRequest(new { message = "No se pueden eliminar las categorías predefinidas del sistema" });
    
    await _categoryService.DeleteAsync(id);
    return NoContent();
}
```

#### 6. Crear Migración
```bash
dotnet ef migrations add AddIsSystemCategoryField
dotnet ef database update
```

#### 7. Script SQL para Actualizar Categorías Existentes
```sql
-- Marcar las categorías existentes como del sistema
UPDATE Categories 
SET IsSystemCategory = 1 
WHERE Name IN ('Ventas', 'Servicios', 'Consultoría', 'Inversiones', 'Otros Ingresos',
               'Oficina', 'Marketing', 'Software', 'Servicios Públicos', 'Otros Gastos');

-- Marcar el resto como personalizadas
UPDATE Categories 
SET IsSystemCategory = 0 
WHERE IsSystemCategory IS NULL;
```

---

### **Frontend (Tú debes implementar):**

#### 1. Actualizar Interface CategoryDto
En `services/categoryService.ts`:

```typescript
export interface CategoryDto {
  id: number
  name: string
  type: number // 0 = Income, 1 = Expense
  isActive: boolean
  isSystemCategory: boolean // NUEVO
}
```

#### 2. Modificar TransactionForm para Mostrar Categorías Ordenadas
En `components/transactions/TransactionForm.tsx`:

```typescript
// Cargar categorías del backend
useEffect(() => {
  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const allCategories = await categoryService.getAll()
      
      // Separar y ordenar por tipo: primero del sistema, luego personalizadas
      const incomeCategories = allCategories
        .filter(cat => cat.type === 0 && cat.isActive)
        .sort((a, b) => {
          // Primero las del sistema
          if (a.isSystemCategory && !b.isSystemCategory) return -1
          if (!a.isSystemCategory && b.isSystemCategory) return 1
          // Luego por nombre
          return a.name.localeCompare(b.name)
        })
        .map(cat => ({
          value: cat.id.toString(),
          label: cat.name,
          isSystem: cat.isSystemCategory
        }))
      
      const expenseCategories = allCategories
        .filter(cat => cat.type === 1 && cat.isActive)
        .sort((a, b) => {
          if (a.isSystemCategory && !b.isSystemCategory) return -1
          if (!a.isSystemCategory && b.isSystemCategory) return 1
          return a.name.localeCompare(b.name)
        })
        .map(cat => ({
          value: cat.id.toString(),
          label: cat.name,
          isSystem: cat.isSystemCategory
        }))
      
      setCategories({
        income: incomeCategories,
        expense: expenseCategories
      })
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories({ income: [], expense: [] })
    } finally {
      setLoadingCategories(false)
    }
  }

  if (isOpen) {
    loadCategories()
  }
}, [isOpen])
```

#### 3. Agregar Opción "Crear Nueva Categoría"
Modificar el select de categorías:

```typescript
{/* Category */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Categoría
  </label>
  <select
    value={formData.category}
    onChange={(e) => {
      if (e.target.value === 'create-new') {
        setShowCreateCategory(true)
      } else {
        handleInputChange('category', e.target.value)
      }
    }}
    disabled={loadingCategories}
    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
      errors.category ? 'border-red-500' : 'border-gray-300'
    } ${loadingCategories ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <option value="">
      {loadingCategories ? 'Cargando...' : 'Seleccionar'}
    </option>
    
    {/* Categorías del sistema */}
    {categories[formData.type as keyof typeof categories]
      .filter(cat => cat.isSystem)
      .map((category) => (
        <option key={category.value} value={category.value}>
          {category.label}
        </option>
      ))}
    
    {/* Separador si hay categorías personalizadas */}
    {categories[formData.type as keyof typeof categories].some(cat => !cat.isSystem) && (
      <option disabled>──────────</option>
    )}
    
    {/* Categorías personalizadas */}
    {categories[formData.type as keyof typeof categories]
      .filter(cat => !cat.isSystem)
      .map((category) => (
        <option key={category.value} value={category.value}>
          {category.label} (Personalizada)
        </option>
      ))}
    
    {/* Opción para crear nueva */}
    <option disabled>──────────</option>
    <option value="create-new">+ Crear nueva categoría</option>
  </select>
  {errors.category && (
    <p className="text-red-500 text-xs mt-1">{errors.category}</p>
  )}
</div>
```

#### 4. Crear Componente Modal para Nueva Categoría
Crear `components/categories/CreateCategoryModal.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import * as categoryService from '@/services/categoryService'

interface CreateCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCategoryCreated: (categoryId: number) => void
  type: 'income' | 'expense'
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
  type
}: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryName.trim()) {
      setError('El nombre de la categoría es requerido')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const newCategory = await categoryService.create({
        name: categoryName.trim(),
        type: type === 'income' ? 0 : 1,
        isActive: true
      })
      
      onCategoryCreated(newCategory.id)
      setCategoryName('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Error al crear la categoría')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Crear Nueva Categoría de {type === 'income' ? 'Ingreso' : 'Gasto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Comisiones, Transporte, etc."
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

#### 5. Integrar Modal en TransactionForm
```typescript
const [showCreateCategory, setShowCreateCategory] = useState(false)

const handleCategoryCreated = async (categoryId: number) => {
  // Recargar categorías
  await loadCategories()
  // Seleccionar la nueva categoría
  handleInputChange('category', categoryId.toString())
}

// En el JSX, agregar el modal
<CreateCategoryModal
  isOpen={showCreateCategory}
  onClose={() => setShowCreateCategory(false)}
  onCategoryCreated={handleCategoryCreated}
  type={formData.type as 'income' | 'expense'}
/>
```

---

## 🎯 Flujo de Usuario Final

1. **Usuario crea una transacción:**
   - Selecciona tipo (Ingreso/Gasto)
   - Ve las 5 categorías predefinidas primero
   - Ve sus categorías personalizadas (si tiene)
   - Ve la opción "+ Crear nueva categoría"

2. **Si selecciona "Crear nueva categoría":**
   - Se abre un modal
   - Ingresa el nombre de la categoría
   - Se crea en el backend
   - Se recarga la lista de categorías
   - Se selecciona automáticamente la nueva categoría

3. **Si selecciona "Otros Ingresos" u "Otros Gastos":**
   - Puede usarla directamente
   - O puede crear una categoría más específica

---

## ✅ Ventajas de Esta Arquitectura

1. **Categorías consistentes:** Todos los usuarios tienen las mismas 5 categorías base
2. **Flexibilidad:** Los usuarios pueden crear categorías personalizadas
3. **Protección:** Las categorías del sistema no se pueden eliminar
4. **Escalabilidad:** Fácil agregar más categorías predefinidas en el futuro
5. **UX mejorada:** Categorías ordenadas (sistema primero, personalizadas después)

---

## 📝 Checklist de Implementación

### Backend (Tu amigo):
- [ ] Agregar campo `IsSystemCategory` al modelo Category
- [ ] Actualizar CategoryDto
- [ ] Crear método `CreateDefaultCategoriesForUser`
- [ ] Llamar al método en el registro de usuarios
- [ ] Modificar DELETE para proteger categorías del sistema
- [ ] Crear y aplicar migración
- [ ] Actualizar categorías existentes con script SQL

### Frontend (Tú):
- [ ] Actualizar interface CategoryDto
- [ ] Modificar carga de categorías para ordenar por tipo
- [ ] Agregar opción "Crear nueva categoría" en el select
- [ ] Crear componente CreateCategoryModal
- [ ] Integrar modal en TransactionForm
- [ ] Probar flujo completo

---

## 🧪 Pruebas Sugeridas

1. Registrar un nuevo usuario y verificar que tenga las 10 categorías
2. Crear una transacción con categoría predefinida
3. Crear una categoría personalizada
4. Crear una transacción con categoría personalizada
5. Intentar eliminar una categoría del sistema (debe fallar)
6. Eliminar una categoría personalizada (debe funcionar)

---

**Nota:** Esta es la arquitectura más limpia y escalable. El backend maneja la lógica de negocio (categorías predefinidas, validaciones) y el frontend maneja la experiencia de usuario (ordenamiento, creación de personalizadas).
