# 📋 Instrucciones para Implementar Categorías Fijas - Backend

**Proyecto:** BookKeeping API  
**Desarrollador Backend:** [Nombre de tu amigo]  
**Desarrollador Frontend:** [Tu nombre]  
**Fecha:** 11 de Febrero de 2026  
**Prioridad:** Alta  
**Tiempo estimado:** 2-3 horas

---

## 🎯 Objetivo

Implementar un sistema de categorías fijas y predefinidas para transacciones que:
- Son globales para todos los usuarios
- No se pueden crear, modificar ni eliminar por usuarios normales
- Se dividen en 6 categorías de Ingresos y 6 de Gastos
- En el futuro, un admin podrá gestionarlas desde un panel

---

## 📊 Estado Actual

Actualmente tienes:
- ✅ Tabla `Categories` con columna `UserId`
- ✅ Endpoints CRUD completos en `CategoryController`
- ✅ Servicio `CategoryService` con métodos CRUD
- ✅ 14 categorías insertadas asociadas al primer usuario

**Problema:** Las categorías están asociadas a usuarios específicos y se pueden modificar.

**Solución:** Convertir a categorías globales y protegerlas.

---

## 🔧 Cambios Requeridos

### **Resumen de Cambios:**
1. Modificar el modelo `Category` (agregar campos nuevos)
2. Crear migración para actualizar la base de datos
3. Actualizar categorías existentes con script SQL
4. Modificar `CategoryController` (eliminar endpoints de modificación)
5. Actualizar `CategoryService` (simplificar métodos)
6. Probar los endpoints

---

## 📝 Paso 1: Modificar el Modelo Category

**Archivo:** `Models/Category.cs`

**Cambios:**
- Eliminar `UserId` y relación con `User`
- Agregar `IsSystemDefault` (para proteger categorías del sistema)
- Agregar `DisplayOrder` (para ordenar en el dropdown)
- Agregar `UpdatedAt` (para auditoría)

```csharp
namespace WebApplication2.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        public string Name { get; set; }
        
        public int Type { get; set; } // 0 = Income (Ingreso), 1 = Expense (Gasto)
        
        public bool IsActive { get; set; }
        
        // NUEVO: Indica si es una categoría predefinida del sistema
        public bool IsSystemDefault { get; set; }
        
        // NUEVO: Orden de visualización en el dropdown
        public int DisplayOrder { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        // NUEVO: Fecha de última actualización
        public DateTime? UpdatedAt { get; set; }
        
        // ELIMINAR: public int UserId { get; set; }
        // ELIMINAR: public User User { get; set; }
    }
}
```

---

## 📝 Paso 2: Actualizar CategoryDto

**Archivo:** `Dto/CategoryDto.cs`

```csharp
namespace WebApplication2.Dto
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public bool IsActive { get; set; }
        public bool IsSystemDefault { get; set; } // NUEVO
        public int DisplayOrder { get; set; } // NUEVO
    }
}
```

---

## 📝 Paso 3: Actualizar AppDbContext

**Archivo:** `Data/AppDbContext.cs`

**Cambios en OnModelCreating:**

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    // Configurar User
    modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

    // MODIFICAR: Configurar Category (eliminar índice con UserId)
    modelBuilder.Entity<Category>()
        .HasIndex(c => new { c.Name, c.Type })
        .IsUnique();

    // Configurar Transaction
    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.User)
        .WithMany()
        .HasForeignKey(t => t.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<Transaction>(entity =>
    {
        entity.Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");
        entity.Property(t => t.DebitAmount)
            .HasColumnType("decimal(18,2)");
        entity.Property(t => t.CreditAmount)
            .HasColumnType("decimal(18,2)");
    });

    // Configurar Account
    modelBuilder.Entity<Account>(entity =>
    {
        entity.HasOne(a => a.User)
            .WithMany(u => u.Accounts)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    });

    // Configurar relaciones de Transaction con Accounts
    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.Account)
        .WithMany(a => a.Transactions)
        .HasForeignKey(t => t.AccountId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.DebitAccount)
        .WithMany(a => a.DebitTransactions)
        .HasForeignKey(t => t.DebitAccountId)
        .OnDelete(DeleteBehavior.Restrict);

    modelBuilder.Entity<Transaction>()
        .HasOne(t => t.CreditAccount)
        .WithMany(a => a.CreditTransactions)
        .HasForeignKey(t => t.CreditAccountId)
        .OnDelete(DeleteBehavior.Restrict);
}
```

---

## 📝 Paso 4: Crear Migración

**Comando en terminal:**

```bash
cd BookKeeping
dotnet ef migrations add UpdateCategoriesToGlobal
```

**Esto creará una migración que:**
- Elimina la columna `UserId` de `Categories`
- Agrega la columna `IsSystemDefault`
- Agrega la columna `DisplayOrder`
- Agrega la columna `UpdatedAt`
- Elimina el índice único con `UserId`
- Crea nuevo índice único con `Name` y `Type`

**⚠️ IMPORTANTE:** NO ejecutes `dotnet ef database update` todavía. Primero necesitamos preparar los datos.

---

## 📝 Paso 5: Preparar Script SQL para Actualizar Datos

**Archivo:** `update-categories-to-global.sql` (crear este archivo)

```sql
USE BookKeepingDB;
GO

-- Paso 1: Eliminar todas las transacciones existentes (porque tienen FK a Categories)
DELETE FROM Transactions;
PRINT 'Transacciones eliminadas';
GO

-- Paso 2: Eliminar todas las categorías existentes
DELETE FROM Categories;
PRINT 'Categorías antiguas eliminadas';
GO

-- Paso 3: Resetear el Identity de Categories
DBCC CHECKIDENT ('Categories', RESEED, 0);
PRINT 'Identity reseteado';
GO

-- Paso 4: Insertar las 12 categorías fijas del sistema
-- Categorías de Ingresos (Type = 0)
INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Ventas', 0, 1, 1, 1, GETDATE()),
('Servicios', 0, 1, 1, 2, GETDATE()),
('Consultoría', 0, 1, 1, 3, GETDATE()),
('Inversiones', 0, 1, 1, 4, GETDATE()),
('Comisiones', 0, 1, 1, 5, GETDATE()),
('Otros Ingresos', 0, 1, 1, 6, GETDATE());

PRINT '6 categorías de Ingresos insertadas';
GO

-- Categorías de Gastos (Type = 1)
INSERT INTO Categories (Name, Type, IsActive, IsSystemDefault, DisplayOrder, CreatedAt) VALUES
('Oficina', 1, 1, 1, 1, GETDATE()),
('Marketing', 1, 1, 1, 2, GETDATE()),
('Software', 1, 1, 1, 3, GETDATE()),
('Servicios Públicos', 1, 1, 1, 4, GETDATE()),
('Transporte', 1, 1, 1, 5, GETDATE()),
('Otros Gastos', 1, 1, 1, 6, GETDATE());

PRINT '6 categorías de Gastos insertadas';
GO

-- Paso 5: Verificar las categorías insertadas
SELECT Id, Name, Type, IsSystemDefault, DisplayOrder, IsActive 
FROM Categories 
ORDER BY Type, DisplayOrder;
GO

PRINT 'Script completado exitosamente';
PRINT 'Total de categorías: 12 (6 Ingresos + 6 Gastos)';
```

---

## 📝 Paso 6: Ejecutar Migración y Script

**Ejecutar en este orden:**

```bash
# 1. Aplicar la migración (esto modifica la estructura de la tabla)
cd BookKeeping
dotnet ef database update

# 2. Ejecutar el script SQL (esto inserta las categorías)
sqlcmd -S "DESKTOP-I00GPUV\SQLEXPRESS" -d BookKeepingDB -E -i update-categories-to-global.sql
```

**Verificar que todo funcionó:**

```bash
sqlcmd -S "DESKTOP-I00GPUV\SQLEXPRESS" -d BookKeepingDB -E -Q "SELECT Id, Name, Type, IsSystemDefault FROM Categories ORDER BY Type, DisplayOrder"
```

**Resultado esperado:**
```
Id  Name                  Type  IsSystemDefault
1   Ventas                0     1
2   Servicios             0     1
3   Consultoría           0     1
4   Inversiones           0     1
5   Comisiones            0     1
6   Otros Ingresos        0     1
7   Oficina               1     1
8   Marketing             1     1
9   Software              1     1
10  Servicios Públicos    1     1
11  Transporte            1     1
12  Otros Gastos          1     1
```

---

## 📝 Paso 7: Actualizar CategoryController

**Archivo:** `Controllers/CategoryController.cs`

**Cambios:**
- Hacer GET público (sin autenticación)
- Eliminar endpoints POST, PUT, DELETE (por ahora)
- Simplificar la lógica

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication2.Dto;
using WebApplication2.Services;

namespace WebApplication2.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        /// <summary>
        /// Obtener todas las categorías activas
        /// </summary>
        /// <param name="type">Filtro opcional: 0 = Ingresos, 1 = Gastos</param>
        [HttpGet]
        [AllowAnonymous] // CAMBIO: Ya no requiere autenticación
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll([FromQuery] int? type)
        {
            try
            {
                var categories = await _categoryService.GetAllAsync(type);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categorías", error = ex.Message });
            }
        }

        /// <summary>
        /// Obtener una categoría por ID
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous] // CAMBIO: Ya no requiere autenticación
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                
                if (category == null)
                    return NotFound(new { message = $"Categoría con ID {id} no encontrada" });
                
                return Ok(category);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener categoría", error = ex.Message });
            }
        }

        // ELIMINAR ESTOS ENDPOINTS (por ahora, se agregarán en el panel de admin):
        // - POST /api/category
        // - PUT /api/category/{id}
        // - DELETE /api/category/{id}
    }
}
```

---

## 📝 Paso 8: Actualizar CategoryService

**Archivo:** `Services/CategoryService.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using WebApplication2.Data;
using WebApplication2.Dto;
using WebApplication2.Models;

namespace WebApplication2.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtener todas las categorías activas, opcionalmente filtradas por tipo
        /// </summary>
        public async Task<List<CategoryDto>> GetAllAsync(int? type = null)
        {
            var query = _context.Categories
                .Where(c => c.IsActive);

            // Filtrar por tipo si se especifica
            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            var categories = await query
                .OrderBy(c => c.Type)
                .ThenBy(c => c.DisplayOrder)
                .ToListAsync();

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                IsActive = c.IsActive,
                IsSystemDefault = c.IsSystemDefault,
                DisplayOrder = c.DisplayOrder
            }).ToList();
        }

        /// <summary>
        /// Obtener una categoría por ID
        /// </summary>
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
                IsActive = category.IsActive,
                IsSystemDefault = category.IsSystemDefault,
                DisplayOrder = category.DisplayOrder
            };
        }

        // ELIMINAR ESTOS MÉTODOS (por ahora):
        // - CreateAsync
        // - UpdateAsync
        // - DeleteAsync
    }
}
```

**Archivo:** `Services/ICategoryService.cs`

```csharp
using WebApplication2.Dto;

namespace WebApplication2.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllAsync(int? type = null);
        Task<CategoryDto?> GetByIdAsync(int id);
        
        // ELIMINAR:
        // Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
        // Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto);
        // Task<bool> DeleteAsync(int id);
    }
}
```

---

## 📝 Paso 9: Probar los Endpoints

### **Prueba 1: Obtener todas las categorías**

```bash
curl -X GET "http://localhost:5088/api/category"
```

**Resultado esperado:** 12 categorías (6 ingresos + 6 gastos)

### **Prueba 2: Obtener solo categorías de Ingresos**

```bash
curl -X GET "http://localhost:5088/api/category?type=0"
```

**Resultado esperado:** 6 categorías de ingresos

### **Prueba 3: Obtener solo categorías de Gastos**

```bash
curl -X GET "http://localhost:5088/api/category?type=1"
```

**Resultado esperado:** 6 categorías de gastos

### **Prueba 4: Obtener categoría por ID**

```bash
curl -X GET "http://localhost:5088/api/category/1"
```

**Resultado esperado:** Categoría "Ventas"

### **Prueba 5: Verificar en Swagger**

1. Abrir: `http://localhost:5088/swagger`
2. Probar endpoint GET /api/category
3. Probar endpoint GET /api/category?type=0
4. Probar endpoint GET /api/category?type=1
5. Probar endpoint GET /api/category/{id}

---

## 📝 Paso 10: Probar Integración con Frontend

Una vez que hayas completado todos los pasos anteriores:

1. Reiniciar el backend: `dotnet run`
2. El frontend debería poder:
   - Cargar las categorías al abrir el formulario de transacciones
   - Mostrar 6 categorías cuando selecciona "Ingreso"
   - Mostrar 6 categorías cuando selecciona "Gasto"
   - Crear transacciones con cualquier categoría

---

## ✅ Checklist de Implementación

- [ ] Paso 1: Modificar modelo Category
- [ ] Paso 2: Actualizar CategoryDto
- [ ] Paso 3: Actualizar AppDbContext
- [ ] Paso 4: Crear migración
- [ ] Paso 5: Crear script SQL
- [ ] Paso 6: Ejecutar migración y script
- [ ] Paso 7: Actualizar CategoryController
- [ ] Paso 8: Actualizar CategoryService e ICategoryService
- [ ] Paso 9: Probar endpoints con curl/Swagger
- [ ] Paso 10: Probar integración con frontend

---

## 🐛 Solución de Problemas

### Problema: Error al ejecutar la migración
**Solución:** Asegúrate de que no haya transacciones que referencien las categorías antiguas. El script SQL las elimina primero.

### Problema: Las categorías no aparecen en el frontend
**Solución:** 
1. Verificar que el backend esté corriendo en puerto 5088
2. Verificar que existan las 12 categorías en la BD
3. Verificar que el endpoint GET /api/category responda correctamente
4. Revisar la consola del navegador para ver errores

### Problema: Error de FK al eliminar transacciones
**Solución:** El script SQL elimina primero las transacciones, luego las categorías.

---

## 📞 Contacto

Si tienes dudas o problemas durante la implementación:
- **Frontend Developer:** [Tu nombre/contacto]
- **Documentación:** Este archivo + `REQUERIMIENTO-CATEGORIAS-FIJAS.md`

---

## 🔮 Próximos Pasos (Futuro)

Una vez completada esta implementación, en el futuro se agregará:
1. Modelo `User` con campo `IsAdmin`
2. Panel de administración en el frontend
3. Endpoints protegidos para que el admin pueda:
   - Crear nuevas categorías
   - Editar categorías (excepto las del sistema)
   - Desactivar categorías
   - Reordenar categorías

Pero por ahora, con esta implementación el sistema estará funcional y listo para usar.

---

**Fecha de creación:** 11 de Febrero de 2026  
**Última actualización:** 11 de Febrero de 2026  
**Versión:** 1.0
