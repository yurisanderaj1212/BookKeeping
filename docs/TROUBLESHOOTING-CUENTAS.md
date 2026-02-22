# 🔧 TROUBLESHOOTING: Problemas con Cuentas

**Fecha:** 21 de Febrero de 2026

---

## 🐛 PROBLEMA 1: Error "El nombre de columna 'UpdatedAt' no es válido"

### **Síntomas:**
- Error: "Error obteniendo cuentas"
- Error SQL: "El nombre de columna 'UpdatedAt' no es válido"
- No se cargan las cuentas

### **Causa:**
La tabla `Accounts` en la base de datos no tiene la columna `UpdatedAt`, pero el modelo C# sí la tiene.

### **Solución:**

#### **Paso 1: Detener el backend**
```bash
# En la terminal donde corre el backend, presionar:
Ctrl + C
```

#### **Paso 2: Ejecutar script SQL**

**Opción A: Usando SQL Server Management Studio (SSMS)**
1. Abrir SSMS
2. Conectar a `DESKTOP-I00GPUV\SQLEXPRESS`
3. Abrir el archivo `BookKeeping/add-updatedat-to-accounts.sql`
4. Ejecutar (F5)

**Opción B: Usando sqlcmd desde terminal**
```bash
# Desde la carpeta BookKeeping
sqlcmd -S DESKTOP-I00GPUV\SQLEXPRESS -d BookKeeping -i add-updatedat-to-accounts.sql
```

**Debe mostrar:**
```
✅ Columna UpdatedAt agregada exitosamente a la tabla Accounts
✅ Script completado exitosamente
```

#### **Paso 3: Reiniciar el backend**
```bash
# En la carpeta BookKeeping
dotnet run
```

**Debe mostrar:**
```
Now listening on: http://localhost:5088
```

#### **Paso 4: Probar en el frontend**
1. Ir a `http://localhost:3000/accounts`
2. Las cuentas deben cargar sin errores

---

## 🐛 PROBLEMA 2: Error al obtener cuentas (otros casos)

### **Síntomas:**
- Error: "Error obteniendo cuentas"
- No se cargan las cuentas

### **Causas Posibles:**

#### **1. Backend no está corriendo**
**Verificar:**
```bash
# En la carpeta BookKeeping
dotnet run
```

**Debe mostrar:**
```
Now listening on: http://localhost:5088
```

#### **2. Usuario no autenticado**
**Verificar en DevTools Console:**
```javascript
// Verificar que hay token
localStorage.getItem('token')

// Verificar que hay usuario
localStorage.getItem('user')
```

**Si no hay token:**
- Ir a `/auth/login`
- Iniciar sesión nuevamente

#### **3. URL del API incorrecta**
**Verificar archivo `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5088/api
```

**Debe ser exactamente esa URL**

#### **4. CORS bloqueando requests**
**Verificar en DevTools Console:**
- Si ves error de CORS, el backend necesita configuración

**Solución:**
El backend ya tiene CORS configurado en `Program.cs`

---

## 🐛 PROBLEMA 3: Modal se ve mal (solo una barra)

### **Síntomas:**
- Al hacer clic en "Nueva Cuenta"
- Solo aparece una barra pequeña en el centro
- No se ve el formulario completo

### **Causa:**
- Problema de z-index y posicionamiento CSS

### **Solución Aplicada:**
Ya se arregló en `AccountForm.tsx`:
- Agregado `z-[9999]` al contenedor principal
- Agregado `relative z-10` al modal
- Agregado span invisible para centrado correcto

---

## 🔍 PASOS DE DEBUGGING

### **Paso 1: Verificar Backend**

```bash
# Terminal 1 - Backend
cd BookKeeping
dotnet run
```

**Debe mostrar:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5088
```

### **Paso 2: Verificar Frontend**

```bash
# Terminal 2 - Frontend
cd BookKeeping/frontend/app-frontend
npm run dev
```

**Debe mostrar:**
```
  ▲ Next.js 16.1.4
  - Local:        http://localhost:3000
```

### **Paso 3: Verificar Autenticación**

1. Abrir DevTools (F12)
2. Ir a Console
3. Ejecutar:
```javascript
console.log('Token:', localStorage.getItem('token'))
console.log('User:', localStorage.getItem('user'))
```

**Debe mostrar:**
- Token: "eyJ..." (un JWT largo)
- User: {"id":1,"email":"..."}

**Si no hay token:**
1. Ir a `http://localhost:3000/auth/login`
2. Iniciar sesión
3. Volver a `/accounts`

### **Paso 4: Verificar Request**

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Recargar página `/accounts`
4. Buscar request a `/api/accounts/users/1`

**Verificar:**
- Status: Debe ser 200
- Response: Debe ser un array JSON
- Headers: Debe tener `Authorization: Bearer ...`

**Si Status es 401:**
- Token expirado o inválido
- Iniciar sesión nuevamente

**Si Status es 404:**
- URL incorrecta
- Verificar que backend esté en puerto 5088

**Si Status es 500:**
- Error en el backend
- Ver logs del backend en terminal

### **Paso 5: Probar Endpoint Manualmente**

**Usando curl:**
```bash
# Obtener token primero (reemplazar con tus credenciales)
curl -X POST http://localhost:5088/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tuPassword"}'

# Copiar el token de la respuesta

# Probar endpoint de cuentas (reemplazar TOKEN y USER_ID)
curl http://localhost:5088/api/accounts/users/1 \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Debe retornar:**
```json
[]
```
(Array vacío si no hay cuentas, o array con cuentas)

---

## ✅ SOLUCIONES RÁPIDAS

### **Solución 1: Reiniciar Todo**

```bash
# Detener backend (Ctrl+C)
# Detener frontend (Ctrl+C)

# Reiniciar backend
cd BookKeeping
dotnet run

# Reiniciar frontend (en otra terminal)
cd BookKeeping/frontend/app-frontend
npm run dev

# Limpiar caché del navegador
# DevTools > Application > Clear storage > Clear site data
```

### **Solución 2: Limpiar y Re-login**

```javascript
// En DevTools Console
localStorage.clear()
location.href = '/auth/login'
```

Luego iniciar sesión nuevamente.

### **Solución 3: Verificar Base de Datos**

```bash
# Verificar que la tabla Accounts existe
# Conectar a SQL Server Management Studio
# Ejecutar:
SELECT * FROM Accounts
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de reportar un problema, verificar:

- [ ] Backend está corriendo en puerto 5088
- [ ] Frontend está corriendo en puerto 3000
- [ ] Usuario está autenticado (hay token en localStorage)
- [ ] URL del API es correcta en `.env.local`
- [ ] No hay errores de CORS en console
- [ ] Base de datos está accesible
- [ ] Tabla Accounts existe en BD

---

## 🆘 SI NADA FUNCIONA

### **Opción 1: Verificar logs del backend**

En la terminal donde corre el backend, buscar errores:
```
fail: Microsoft.AspNetCore...
```

### **Opción 2: Agregar más logs**

En `accountService.ts`, ya agregamos logs:
```typescript
console.log('🔍 Cargando cuentas...')
console.log('✅ Cuentas cargadas:', data)
console.log('❌ Error:', err)
```

Revisar estos logs en DevTools Console.

### **Opción 3: Probar con Postman**

1. Abrir Postman
2. Crear request:
   - Method: GET
   - URL: `http://localhost:5088/api/accounts/users/1`
   - Headers: `Authorization: Bearer TU_TOKEN`
3. Send

Debe retornar 200 con array de cuentas.

---

## 🎯 RESULTADO ESPERADO

Después de arreglar:

1. **Página de cuentas carga sin errores**
2. **Modal se ve completo y centrado**
3. **Puede crear cuentas sin problemas**
4. **Cuentas se muestran en la lista**

---

**Desarrollado por:** Equipo Fullstack  
**Fecha:** 21 de Febrero de 2026  
**Estado:** GUÍA DE TROUBLESHOOTING ✅
