# 📋 Requerimiento: Categorías Fijas Predefinidas

**Cliente:** Sistema de BookKeeping  
**Fecha:** 11 de Febrero de 2026  
**Prioridad:** Alta

---

## 🎯 Requerimiento del Cliente

El cliente necesita que las categorías sean **completamente fijas y predefinidas**:

- **5-6 categorías de Ingresos** (incluyendo "Otros")
- **5-6 categorías de Gastos** (incluyendo "Otros")
- **NO se pueden crear** nuevas categorías
- **NO se pueden modificar** las existentes
- **NO se pueden eliminar** ninguna categoría
- Son las **mismas para todos los usuarios**
- El usuario solo puede **seleccionar** de estas categorías al crear transacciones

**Razón:** El cliente quiere que los usuarios trabajen rápido sin perder tiempo creando categorías. Si su caso no está en la lista, selecciona "Otros".

---

## 📊 Categorías Propuestas

### **Ingresos (Type = 0)**
1. Ventas
2. Servicios
3. Consultoría
4. Inversiones
5. Comisiones
6. **Otros Ingresos** ⭐

### **Gastos (Type = 1)**
1. Oficina
2. Marketing
3. Software
4. Servicios Públicos
5. Transporte
6. **Otros Gastos** ⭐

**Total:** 12 categorías fijas

---

## 🔧 Implementación en el Backend

### **Opción 1: Categorías Globales (RECOMENDADA)**

Las categorías NO pertenecen a ningún usuario específico. Son globales para todo el sistema.

#### Modificar el Modelo Category:

```csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Type { get; set; } // 0 = Income, 1 = Expense
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // ELIMINAR: public int UserId { get; set; }
    // ELIMINAR: public User User { get; set; }
}
```

#### Script SQL para Crear Categorías Fijas:

```sql
-- Limpiar categorías existentes (si las hay)
DELETE FROM Transactions; -- Primero eliminar transacciones por FK
DELETE FROM Categories;

-- Resetear el Identity
DBCC CHECKIDENT ('Categories', RESEED, 0);

-- Insertar categorías fijas de Ingresos (Type = 0)
INSERT INTO Categories (Name, Type, IsActive, CreatedAt) VALUES
('Ventas', 0, 1, GETDATE()),
('Servicios', 0, 1, GETDATE()),
('Consultoría', 0, 1, GETDATE()),
('Inversiones', 0, 1, GETDATE()),
('Comisiones', 0, 1, GETDATE()),
('Otros Ingresos', 0, 1, GETDATE());

-- Insertar categorías fijas de Gastos (Type = 1)
INSERT INTO Categories (Name, Type, IsActive, CreatedAt) VALUES
('Oficina', 1, 1, GETDATE()),
('Marketing', 1, 1, GETDATE()),
('Software', 1, 1, GETDATE()),
('Servicios Públicos', 1, 1, GETDATE()),
('Transporte', 1, 1, GETDATE()),
('Otros Gastos', 1, 1, GETDATE());

-- Verificar
SELECT Id, Name, Type FROM Categories ORDER BY Type, Id;
```

#### Modificar CategoryController:

```csharp
// GET: api/category
[HttpGet]
[AllowAnonymous] // CAMBIAR: Ya no requiere autenticación
public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll([FromQuery] int? type)
{
    var categories = await _categoryService.GetAllAsync(type);
    return Ok(categories);
}

// GET: api/category/{id}
[HttpGet("{id}")]
[AllowAnonymous] // CAMBIAR: Ya no requiere autenticación
public async Task<ActionResult<CategoryDto>> GetById(int id)
{
    var category = await _categoryService.GetByIdAsync(id);
    
    if (category == null)
        return NotFound(new { message = $"Categoría con ID {id} no encontrada" });
    
    return Ok(category);
}

// ELIMINAR ESTOS ENDPOINTS (ya no se necesitan):
// - POST /api/category (crear)
// - PUT /api/category/{id} (actualizar)
// - DELETE /api/category/{id} (eliminar)
```

#### Modificar CategoryService:

```csharp
public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    // Obtener todas las categorías (opcionalmente filtradas por tipo)
    public async Task<List<CategoryDto>> GetAllAsync(int? type = null)
    {
        var query = _context.Categories
            .Where(c => c.IsActive);

        if (type.HasValue)
        {
            query = query.Where(c => c.Type == type.Value);
        }

        var categories = await query
            .OrderBy(c => c.Type)
            .ThenBy(c => c.Id)
            .ToListAsync();

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Type = c.Type,
            IsActive = c.IsActive
        }).ToList();
    }

    // Obtener categoría por ID
    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

        if (category == null)
            return null;

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            IsActive = category.IsActive
        };
    }

    // ELIMINAR ESTOS MÉTODOS:
    // - CreateAsync
    // - UpdateAsync
    // - DeleteAsync
}
```

#### Actualizar AppDbContext:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // ELIMINAR: Índice único con UserId
    // modelBuilder.Entity<Category>()
    //    .HasIndex(c => new { c.UserId, c.Name, c.Type })
    //    .IsUnique();

    // AGREGAR: Índice único solo con Name y Type
    modelBuilder.Entity<Category>()
        .HasIndex(c => new { c.Name, c.Type })
        .IsUnique();

    // ... resto de configuraciones ...
}
```

#### Crear Migración:

```bash
# Eliminar la columna UserId de Categories
dotnet ef migrations add RemoveUserIdFromCategories
dotnet ef database update
```

---

### **Opción 2: Categorías por Usuario (Alternativa)**

Si prefieres que cada usuario tenga su propia copia de las categorías (pero sin poder modificarlas):

#### Mantener el Modelo Category con UserId:

```csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Type { get; set; }
    public int UserId { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemCategory { get; set; } // true = no se puede modificar
    public DateTime CreatedAt { get; set; }
    
    public User User { get; set; }
}
```

#### Crear Categorías al Registrar Usuario:

```csharp
// En AuthController.Register, después de crear el usuario:
private async Task CreateFixedCategoriesForUser(int userId)
{
    var fixedCategories = new[]
    {
        // Ingresos
        new Category { Name = "Ventas", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Servicios", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Consultoría", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Inversiones", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Comisiones", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Otros Ingresos", Type = 0, UserId = userId, IsActive = true, IsSystemCategory = true },
        
        // Gastos
        new Category { Name = "Oficina", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Marketing", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Software", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Servicios Públicos", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Transporte", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true },
        new Category { Name = "Otros Gastos", Type = 1, UserId = userId, IsActive = true, IsSystemCategory = true }
    };
    
    await _context.Categories.AddRangeAsync(fixedCategories);
    await _context.SaveChangesAsync();
}
```

#### Eliminar Endpoints de Modificación:

```csharp
// ELIMINAR del CategoryController:
// - POST /api/category
// - PUT /api/category/{id}
// - DELETE /api/category/{id}

// MANTENER solo:
// - GET /api/category (con filtro por UserId)
// - GET /api/category/{id}
```

---

## 🎯 Comparación de Opciones

| Aspecto | Opción 1: Global | Opción 2: Por Usuario |
|---------|------------------|----------------------|
| **Simplicidad** | ✅ Más simple | ❌ Más complejo |
| **Performance** | ✅ Mejor (12 registros totales) | ❌ Peor (12 × usuarios) |
| **Mantenimiento** | ✅ Más fácil | ❌ Más difícil |
| **Escalabilidad** | ✅ Mejor | ❌ Peor |
| **Personalización futura** | ❌ Difícil | ✅ Más fácil |

**Recomendación:** **Opción 1 (Global)** - Es más simple, eficiente y cumple exactamente con el requerimiento del cliente.

---

## 📱 Impacto en el Frontend

### Lo que NO cambia:
- El servicio `categoryService.ts` sigue funcionando igual
- El componente `TransactionForm` sigue funcionando igual
- La carga de categorías sigue siendo la misma

### Lo que cambia:
- Ya no se necesita el modal de "Crear nueva categoría"
- El dropdown solo muestra las 12 categorías fijas
- No hay opción de "+ Crear nueva categoría"

### Código del Frontend (simplificado):

```typescript
// En TransactionForm.tsx
<select
  value={formData.category}
  onChange={(e) => handleInputChange('category', e.target.value)}
  disabled={loadingCategories}
  className="w-full px-3 py-2 border rounded-lg"
>
  <option value="">
    {loadingCategories ? 'Cargando...' : 'Seleccionar categoría'}
  </option>
  
  {categories[formData.type as keyof typeof categories].map((category) => (
    <option key={category.value} value={category.value}>
      {category.label}
    </option>
  ))}
</select>
```

**Nota:** "Otros Ingresos" y "Otros Gastos" aparecen como opciones normales en la lista, no requieren tratamiento especial.

---

## ✅ Ventajas de Esta Solución

1. **Simplicidad:** No hay lógica compleja de creación/edición/eliminación
2. **Velocidad:** El usuario selecciona rápido de una lista fija
3. **Consistencia:** Todos los usuarios usan las mismas categorías
4. **Performance:** Solo 12 registros en la tabla Categories
5. **Mantenimiento:** Fácil de mantener y actualizar
6. **Reportes:** Más fácil generar reportes consolidados

---

## 🚀 Pasos de Implementación

### Backend:
1. ✅ Decidir entre Opción 1 (Global) u Opción 2 (Por Usuario)
2. ✅ Modificar el modelo Category según la opción elegida
3. ✅ Crear migración para actualizar la base de datos
4. ✅ Ejecutar script SQL para insertar las 12 categorías fijas
5. ✅ Eliminar endpoints POST, PUT, DELETE de CategoryController
6. ✅ Modificar CategoryService para eliminar métodos de modificación
7. ✅ Probar que GET /api/category devuelve las 12 categorías

### Frontend:
1. ✅ Verificar que el servicio categoryService.getAll() funciona
2. ✅ Verificar que TransactionForm carga las categorías
3. ✅ Eliminar cualquier código de "Crear nueva categoría" (si existe)
4. ✅ Probar crear transacciones con cada categoría

---

## 🧪 Pruebas Sugeridas

1. ✅ Verificar que existen exactamente 12 categorías en la BD
2. ✅ Crear transacción con categoría "Ventas"
3. ✅ Crear transacción con categoría "Otros Ingresos"
4. ✅ Crear transacción con categoría "Oficina"
5. ✅ Crear transacción con categoría "Otros Gastos"
6. ✅ Verificar que no se pueden crear nuevas categorías
7. ✅ Verificar que no se pueden modificar categorías existentes
8. ✅ Verificar que no se pueden eliminar categorías

---

## 📝 Preguntas Frecuentes

**P: ¿Qué pasa si el cliente quiere agregar más categorías en el futuro?**  
R: Se ejecuta un script SQL para insertar las nuevas categorías. Es un cambio controlado por el equipo de desarrollo.

**P: ¿Qué pasa si un usuario necesita una categoría que no está en la lista?**  
R: Selecciona "Otros Ingresos" u "Otros Gastos" según corresponda.

**P: ¿Se pueden desactivar categorías?**  
R: Sí, cambiando el campo `IsActive` a `false` en la base de datos. Pero esto debe ser una decisión del equipo de desarrollo, no del usuario.

**P: ¿Las categorías son las mismas en español e inglés?**  
R: Por ahora sí. Si se necesita internacionalización, se puede agregar una tabla de traducciones más adelante.

---

## 🎯 Resumen Ejecutivo

**Requerimiento:** Categorías fijas y predefinidas que no se pueden modificar.

**Solución Recomendada:** 12 categorías globales (6 ingresos + 6 gastos) compartidas por todos los usuarios.

**Impacto:**
- Backend: Simplificar CategoryController y CategoryService
- Frontend: Eliminar funcionalidad de crear categorías personalizadas
- Base de datos: 12 registros fijos en la tabla Categories

**Tiempo estimado:** 2-3 horas de desarrollo + pruebas

---

**Documento preparado para:** Desarrollador Backend  
**Preparado por:** Equipo Frontend  
**Fecha:** 11 de Febrero de 2026
