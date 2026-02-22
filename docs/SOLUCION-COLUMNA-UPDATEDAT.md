# 🔧 SOLUCIÓN: Agregar columna UpdatedAt a tabla Accounts

**Fecha:** 21 de Febrero de 2026  
**Problema:** Error SQL "El nombre de columna 'UpdatedAt' no es válido"

---

## 📋 RESUMEN DEL PROBLEMA

- **Síntoma:** Error al cargar cuentas en `/accounts`
- **Error:** "Error obteniendo cuentas"
- **Causa:** La tabla `Accounts` en SQL Server no tiene la columna `UpdatedAt`
- **Modelo C#:** Sí tiene la propiedad `UpdatedAt`
- **Backend:** Está corriendo, por lo que no podemos crear migración

---

## ✅ SOLUCIÓN PASO A PASO

### **Paso 1: Detener el backend**

```bash
# En la terminal donde corre el backend (puerto 5088)
# Presionar: Ctrl + C
```

**Verificar que se detuvo:**
- No debe aparecer "Now listening on: http://localhost:5088"

---

### **Paso 2: Ejecutar script SQL**

Ya creamos el archivo: `BookKeeping/add-updatedat-to-accounts.sql`

#### **Opción A: SQL Server Management Studio (SSMS)**

1. Abrir SSMS
2. Conectar a: `DESKTOP-I00GPUV\SQLEXPRESS`
3. File > Open > File
4. Seleccionar: `BookKeeping/add-updatedat-to-accounts.sql`
5. Presionar F5 o clic en "Execute"

#### **Opción B: sqlcmd (desde terminal)**

```bash
# Desde la carpeta BookKeeping
sqlcmd -S DESKTOP-I00GPUV\SQLEXPRESS -d BookKeeping -i add-updatedat-to-accounts.sql
```

#### **Resultado esperado:**

```
✅ Columna UpdatedAt agregada exitosamente a la tabla Accounts
✅ Script completado exitosamente
```

---

### **Paso 3: Verificar que se agregó la columna**

#### **Opción A: SSMS**

```sql
-- En SSMS, ejecutar:
USE BookKeeping
GO

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Accounts'
AND COLUMN_NAME = 'UpdatedAt'
```

**Debe retornar:**
```
COLUMN_NAME  DATA_TYPE   IS_NULLABLE
UpdatedAt    datetime2   NO
```

#### **Opción B: sqlcmd**

```bash
sqlcmd -S DESKTOP-I00GPUV\SQLEXPRESS -d BookKeeping -Q "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Accounts' AND COLUMN_NAME = 'UpdatedAt'"
```

---

### **Paso 4: Reiniciar el backend**

```bash
# En la carpeta BookKeeping
cd BookKeeping
dotnet run
```

**Debe mostrar:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5088
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

---

### **Paso 5: Probar en el frontend**

1. Ir a: `http://localhost:3000/accounts`
2. Abrir DevTools (F12) > Console
3. Buscar logs:
   ```
   🔍 Cargando cuentas...
   ✅ Cuentas cargadas: []
   ```

**Resultado esperado:**
- ✅ No hay errores
- ✅ Página carga correctamente
- ✅ Muestra "No hay cuentas registradas" (si no hay cuentas)

---

### **Paso 6: Probar crear una cuenta**

1. Clic en "Nueva Cuenta"
2. Llenar formulario:
   - Nombre: "Cuenta de Prueba"
   - Tipo: "Activo"
   - Subtipo: "Cuenta Bancaria"
   - Balance Inicial: 1000
   - Moneda: USD
3. Clic en "Crear Cuenta"

**Resultado esperado:**
- ✅ Cuenta se crea sin errores
- ✅ Aparece en la lista
- ✅ Modal se cierra automáticamente

---

## 🔍 VERIFICACIÓN FINAL

### **Checklist:**

- [ ] Backend corriendo en puerto 5088
- [ ] Frontend corriendo en puerto 3000
- [ ] Columna `UpdatedAt` existe en tabla `Accounts`
- [ ] Página `/accounts` carga sin errores
- [ ] Puede crear cuentas sin problemas
- [ ] Cuentas se muestran en la lista

---

## 📊 QUÉ HACE EL SCRIPT SQL

```sql
-- 1. Verifica si la columna ya existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE ...)

-- 2. Agrega la columna con valor por defecto
ALTER TABLE [dbo].[Accounts]
ADD [UpdatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE()

-- 3. Actualiza filas existentes
UPDATE [dbo].[Accounts]
SET [UpdatedAt] = [CreatedAt]
WHERE [UpdatedAt] IS NULL
```

**Resultado:**
- Todas las cuentas existentes tendrán `UpdatedAt = CreatedAt`
- Nuevas cuentas tendrán `UpdatedAt` automáticamente

---

## 🆘 SI ALGO SALE MAL

### **Error: "Cannot insert NULL into column 'UpdatedAt'"**

**Causa:** El script no se ejecutó correctamente

**Solución:**
```sql
-- Ejecutar manualmente:
ALTER TABLE [dbo].[Accounts]
ADD [UpdatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE()
```

### **Error: "Column 'UpdatedAt' already exists"**

**Causa:** La columna ya existe

**Solución:**
- Ignorar el error
- Continuar con Paso 4 (reiniciar backend)

### **Error: "Cannot connect to SQL Server"**

**Causa:** SQL Server no está corriendo

**Solución:**
1. Abrir "Services" (services.msc)
2. Buscar "SQL Server (SQLEXPRESS)"
3. Clic derecho > Start

---

## 📝 NOTAS IMPORTANTES

1. **No crear migración:** El backend está corriendo, archivo bloqueado
2. **Script es seguro:** Verifica antes de agregar columna
3. **Idempotente:** Puede ejecutarse múltiples veces sin problemas
4. **No afecta datos:** Solo agrega columna, no modifica datos existentes

---

**Desarrollado por:** Equipo Fullstack  
**Fecha:** 21 de Febrero de 2026  
**Estado:** SOLUCIÓN LISTA PARA APLICAR ✅
