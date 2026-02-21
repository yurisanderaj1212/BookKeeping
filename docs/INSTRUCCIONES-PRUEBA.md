# 🧪 Instrucciones para Probar la Integración

**Fecha:** 9 de Febrero de 2026  
**Estado:** ✅ CORS configurado - Listo para probar

---

## 🎯 Objetivo

Probar que el frontend y backend se comunican correctamente y que el flujo de autenticación funciona de principio a fin.

---

## 📋 Pre-requisitos

Antes de empezar, verifica que tienes:

- ✅ .NET SDK 8.0 instalado
- ✅ Node.js instalado
- ✅ SQL Server LocalDB instalado
- ✅ CORS ya configurado en `BookKeeping/Program.cs` ✅

---

## 🚀 Paso 1: Iniciar el Backend

### Opción A: Desde la terminal

```bash
# Navegar a la carpeta del backend
cd BookKeeping

# Restaurar paquetes (primera vez)
dotnet restore

# Aplicar migraciones a la base de datos (primera vez)
dotnet ef database update

# Iniciar el backend
dotnet run
```

### Opción B: Desde Visual Studio

1. Abrir `BookKeeping/WebApplication2.csproj` en Visual Studio
2. Presionar F5 o click en "Run"

### ✅ Verificación

Deberías ver algo como:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5088
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Probar Swagger:**
- Abrir navegador en: `https://localhost:5088/swagger`
- Deberías ver la documentación de la API

---

## 🚀 Paso 2: Iniciar el Frontend

### Abrir una NUEVA terminal (dejar el backend corriendo)

```bash
# Navegar a la carpeta del frontend
cd BookKeeping/frontend/app-frontend

# Instalar dependencias (primera vez)
npm install

# Iniciar el frontend
npm run dev
```

### ✅ Verificación

Deberías ver algo como:

```
  ▲ Next.js 16.1.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.3s
```

---

## 🧪 Paso 3: Probar el Registro

### 3.1 Abrir la página de registro

1. Abrir navegador en: `http://localhost:3000/auth/register`
2. Abrir DevTools (F12) → Pestaña "Console"

### 3.2 Llenar el formulario

**Datos de prueba:**
- **Nombre:** Juan
- **Apellido:** Pérez
- **Email:** juan@test.com
- **Contraseña:** Test123!
- **Confirmar contraseña:** Test123!
- **[✓] Acepto términos**

### 3.3 Enviar el formulario

1. Click en "Crear cuenta"
2. **Observar en DevTools:**
   - ✅ NO debe aparecer error de CORS
   - ✅ En la pestaña "Network" debe aparecer:
     - Request a `http://localhost:5088/api/auth/register`
     - Status: `200 OK`
   - ✅ Debe redirigir a `/auth/login`

### ❌ Si ves error de CORS:

```
Access to fetch at 'http://localhost:5088/api/auth/register' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solución:**
1. Verificar que el backend se reinició después de agregar CORS
2. Detener el backend (Ctrl+C)
3. Volver a iniciar: `dotnet run`

---

## 🧪 Paso 4: Probar el Login

### 4.1 Llenar el formulario de login

**Usar los mismos datos del registro:**
- **Email:** juan@test.com
- **Contraseña:** Test123!

### 4.2 Iniciar sesión

1. Click en "Iniciar sesión"
2. **Observar en DevTools:**
   - ✅ En "Network" debe aparecer:
     - Request a `http://localhost:5088/api/auth/login`
     - Status: `200 OK`
     - Response con `token` y `user`
   - ✅ En "Application" → "Local Storage" → `http://localhost:3000`:
     - Key: `token` → Value: `eyJhbGciOiJIUzI1NiIs...`
     - Key: `user` → Value: `{"id":1,"email":"juan@test.com",...}`
   - ✅ Debe redirigir a `/dashboard`

### 4.3 Verificar el Dashboard

1. Deberías estar en `http://localhost:3000/dashboard`
2. Deberías ver el nombre del usuario: "Juan Pérez"
3. El sidebar debería mostrar las opciones del menú

---

## 🧪 Paso 5: Probar Protección de Rutas

### 5.1 Probar Logout

1. En el dashboard, buscar el botón de "Logout" o "Cerrar sesión"
2. Click en logout
3. **Verificar:**
   - ✅ Debe redirigir a `/auth/login`
   - ✅ En DevTools → Application → Local Storage:
     - `token` y `user` deben haber desaparecido

### 5.2 Probar acceso sin autenticación

1. Estando en `/auth/login`, intentar acceder directamente a:
   - `http://localhost:3000/dashboard`
2. **Verificar:**
   - ✅ Debe redirigir automáticamente a `/auth/login`

### 5.3 Probar acceso con autenticación

1. Hacer login nuevamente
2. Intentar acceder a `/auth/login` directamente
3. **Verificar:**
   - ✅ Debe redirigir automáticamente a `/dashboard`

---

## 🧪 Paso 6: Probar Casos de Error

### 6.1 Login con credenciales incorrectas

1. Ir a `/auth/login`
2. Intentar login con:
   - Email: juan@test.com
   - Password: PasswordIncorrecto123!
3. **Verificar:**
   - ✅ Debe mostrar error: "Email o contraseña incorrectos"
   - ✅ NO debe redirigir
   - ✅ NO debe guardar token

### 6.2 Registro con email duplicado

1. Ir a `/auth/register`
2. Intentar registrar con el mismo email: juan@test.com
3. **Verificar:**
   - ✅ Debe mostrar error: "Este email ya está registrado"
   - ✅ NO debe redirigir

### 6.3 Registro con contraseña débil

1. Ir a `/auth/register`
2. Intentar registrar con:
   - Email: nuevo@test.com
   - Password: 12345678 (sin mayúsculas, símbolos)
3. **Verificar:**
   - ✅ Debe mostrar error: "La contraseña es demasiado débil"
   - ✅ El indicador de fuerza debe mostrar "Débil"

---

## ✅ Checklist de Pruebas

### Backend
- [ ] Backend inicia sin errores
- [ ] Swagger accesible en `https://localhost:5088/swagger`
- [ ] Base de datos creada y migrada

### Frontend
- [ ] Frontend inicia sin errores
- [ ] Página de registro carga correctamente
- [ ] Página de login carga correctamente

### Registro
- [ ] Formulario de registro funciona
- [ ] Validaciones del frontend funcionan
- [ ] Request llega al backend sin error de CORS
- [ ] Usuario se crea en la base de datos
- [ ] Redirige a login después del registro exitoso
- [ ] Muestra error si email ya existe

### Login
- [ ] Formulario de login funciona
- [ ] Request llega al backend sin error de CORS
- [ ] Token se guarda en localStorage
- [ ] Usuario se guarda en localStorage
- [ ] Redirige a dashboard después del login exitoso
- [ ] Muestra error con credenciales incorrectas

### Protección de Rutas
- [ ] Dashboard solo accesible con autenticación
- [ ] Logout limpia token y redirige a login
- [ ] No puede acceder a /auth/login si ya está autenticado
- [ ] Redirige a login si intenta acceder a ruta protegida sin auth

### DevTools
- [ ] No hay errores de CORS en la consola
- [ ] Requests aparecen en Network con status 200
- [ ] Token y user se guardan en Local Storage
- [ ] Token se limpia al hacer logout

---

## 🐛 Troubleshooting

### Error: "Cannot connect to SQL Server"

**Solución:**
```bash
# Verificar que SQL Server LocalDB está instalado
sqllocaldb info

# Si no está instalado, instalar SQL Server Express LocalDB
# https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb
```

### Error: "Port 5088 already in use"

**Solución:**
```bash
# Encontrar el proceso usando el puerto
netstat -ano | findstr :5088

# Matar el proceso (reemplazar PID con el número que aparece)
taskkill /PID <PID> /F
```

### Error: "Port 3000 already in use"

**Solución:**
```bash
# Encontrar el proceso usando el puerto
netstat -ano | findstr :3000

# Matar el proceso
taskkill /PID <PID> /F
```

### Error de CORS persiste

**Solución:**
1. Verificar que `BookKeeping/Program.cs` tiene las líneas de CORS
2. Detener completamente el backend (Ctrl+C)
3. Reiniciar: `dotnet run`
4. Limpiar caché del navegador (Ctrl+Shift+Delete)
5. Recargar la página (Ctrl+F5)

### Token no se guarda

**Solución:**
1. Abrir DevTools (F12)
2. Ir a Application → Local Storage
3. Verificar que no hay errores de permisos
4. Intentar en modo incógnito

---

## 📊 Resultados Esperados

### ✅ Todo funciona correctamente si:

1. **Backend:**
   - Inicia sin errores
   - Responde en `https://localhost:5088`
   - Swagger funciona

2. **Frontend:**
   - Inicia sin errores
   - Carga en `http://localhost:3000`
   - No hay errores de CORS en consola

3. **Flujo completo:**
   - Registro → Login → Dashboard → Logout
   - Todo funciona sin errores
   - Token se guarda y se limpia correctamente
   - Protección de rutas funciona

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. ✅ **Fase 1 completada:** Autenticación funcionando
2. 📝 **Fase 2:** Integrar transacciones
3. 📝 **Fase 3:** Integrar categorías
4. 📝 **Fase 4:** Integrar cuentas

---

## 📞 Ayuda

Si encuentras algún problema que no puedes resolver:

1. Revisa la consola del backend por errores
2. Revisa DevTools del navegador por errores
3. Verifica que ambos servidores estén corriendo
4. Verifica que las URLs sean correctas

---

**¡Buena suerte con las pruebas! 🚀**
