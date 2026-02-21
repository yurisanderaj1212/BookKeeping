# 🔄 Ejemplo de Integración Frontend-Backend

**Guía visual del flujo de autenticación**

---

## 📊 Diagrama del Flujo Actual

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 1. Abre navegador
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
│                  http://localhost:3000                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📄 /auth/register                                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Formulario de Registro                                  │    │
│  │ • Nombre: Juan                                          │    │
│  │ • Apellido: Pérez                                       │    │
│  │ • Email: juan@test.com                                  │    │
│  │ • Password: Test123!                                    │    │
│  │ • Confirmar: Test123!                                   │    │
│  │ • [✓] Acepto términos                                   │    │
│  │                                                          │    │
│  │ [Crear cuenta] ◄─── 2. Usuario llena formulario        │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         │ 3. Validaciones frontend               │
│                         │    ✓ Email válido                      │
│                         │    ✓ Password fuerte                   │
│                         │    ✓ Passwords coinciden               │
│                         │                                        │
│                         ▼                                        │
│  📤 fetch() - POST Request                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ URL: http://localhost:5088/api/auth/register            │    │
│  │ Method: POST                                            │    │
│  │ Headers: { Content-Type: application/json }            │    │
│  │ Body: {                                                 │    │
│  │   email: "juan@test.com",                              │    │
│  │   password: "Test123!",                                │    │
│  │   confirmPassword: "Test123!",                         │    │
│  │   firstName: "Juan",                                   │    │
│  │   lastName: "Pérez"                                    │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ 4. HTTP Request
                          │
                ┌─────────▼─────────┐
                │   ⚠️ CORS CHECK   │
                │                   │
                │ ❌ SIN CORS:      │
                │ Request bloqueado │
                │                   │
                │ ✅ CON CORS:      │
                │ Request permitido │
                └─────────┬─────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                        │
│                  http://localhost:5088                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 AuthController.cs                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ [HttpPost("register")]                                  │    │
│  │ public async Task<IActionResult> Register(...)          │    │
│  │ {                                                       │    │
│  │   // 5. Validaciones backend                           │    │
│  │   if (email ya existe)                                 │    │
│  │     return BadRequest("Email ya registrado");          │    │
│  │                                                         │    │
│  │   if (!IsPasswordStrong(password))                     │    │
│  │     return BadRequest("Password débil");               │    │
│  │                                                         │    │
│  │   // 6. Crear usuario                                  │    │
│  │   var user = new User {                                │    │
│  │     Email = request.Email,                             │    │
│  │     PasswordHash = BCrypt.HashPassword(password),      │    │
│  │     FirstName = request.FirstName,                     │    │
│  │     LastName = request.LastName                        │    │
│  │   };                                                    │    │
│  │                                                         │    │
│  │   // 7. Guardar en base de datos                      │    │
│  │   _context.Users.Add(user);                            │    │
│  │   await _context.SaveChangesAsync();                   │    │
│  │                                                         │    │
│  │   // 8. Respuesta exitosa                             │    │
│  │   return Ok("Usuario registrado exitosamente.");       │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  💾 SQL Server LocalDB                                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Tabla: Users                                            │    │
│  │ ┌────┬──────────────────┬──────────┬──────────┐       │    │
│  │ │ Id │ Email            │FirstName │ LastName │       │    │
│  │ ├────┼──────────────────┼──────────┼──────────┤       │    │
│  │ │ 1  │juan@test.com     │ Juan     │ Pérez    │       │    │
│  │ └────┴──────────────────┴──────────┴──────────┘       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ 9. HTTP Response
                          │    Status: 200 OK
                          │    Body: "Usuario registrado exitosamente."
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📥 Response Handler                                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ if (response.ok) {                                      │    │
│  │   // 10. Redirigir al login                            │    │
│  │   router.push('/auth/login')                           │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  📄 /auth/login                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Formulario de Login                                     │    │
│  │ • Email: juan@test.com                                  │    │
│  │ • Password: Test123!                                    │    │
│  │                                                          │    │
│  │ [Iniciar sesión] ◄─── 11. Usuario inicia sesión        │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  📤 fetch() - POST Request                                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ URL: http://localhost:5088/api/auth/login               │    │
│  │ Method: POST                                            │    │
│  │ Body: {                                                 │    │
│  │   email: "juan@test.com",                              │    │
│  │   password: "Test123!"                                 │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🎯 AuthController.cs                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ [HttpPost("login")]                                     │    │
│  │ public async Task<IActionResult> Login(...)             │    │
│  │ {                                                       │    │
│  │   // 12. Buscar usuario                                │    │
│  │   var user = await _context.Users                      │    │
│  │     .FirstOrDefaultAsync(u => u.Email == email);       │    │
│  │                                                         │    │
│  │   // 13. Verificar password                            │    │
│  │   if (!BCrypt.Verify(password, user.PasswordHash))     │    │
│  │     return Unauthorized("Credenciales inválidas");     │    │
│  │                                                         │    │
│  │   // 14. Generar JWT Token                             │    │
│  │   var token = GenerateJwtToken(user);                  │    │
│  │                                                         │    │
│  │   // 15. Respuesta con token                           │    │
│  │   return Ok(new {                                      │    │
│  │     token = "eyJhbGciOiJIUzI1NiIs...",                │    │
│  │     expiresAt = DateTime.UtcNow.AddHours(1),          │    │
│  │     user = new {                                       │    │
│  │       id = user.Id,                                    │    │
│  │       email = user.Email,                              │    │
│  │       firstName = user.FirstName,                      │    │
│  │       lastName = user.LastName                         │    │
│  │     }                                                   │    │
│  │   });                                                   │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ 16. HTTP Response
                          │     Status: 200 OK
                          │     Body: { token, expiresAt, user }
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📥 Response Handler                                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ if (response.ok) {                                      │    │
│  │   const result = await response.json()                 │    │
│  │                                                         │    │
│  │   // 17. Guardar token en localStorage                │    │
│  │   localStorage.setItem('token', result.token)          │    │
│  │   localStorage.setItem('user',                         │    │
│  │     JSON.stringify(result.user))                       │    │
│  │                                                         │    │
│  │   // 18. Redirigir al dashboard                        │    │
│  │   router.push('/dashboard')                            │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  📄 /dashboard                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ ✅ Usuario autenticado                                  │    │
│  │                                                          │    │
│  │ Bienvenido, Juan Pérez!                                 │    │
│  │                                                          │    │
│  │ [Dashboard] [Transacciones] [Reportes] [Logout]        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Peticiones Protegidas

**Una vez autenticado, todas las peticiones incluyen el token:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📤 fetch() - GET Request (Transacciones)                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ URL: http://localhost:5088/api/transactions             │    │
│  │ Method: GET                                             │    │
│  │ Headers: {                                              │    │
│  │   Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..."      │    │
│  │   Content-Type: "application/json"                     │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 JWT Middleware                                               │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 1. Extraer token del header Authorization              │    │
│  │ 2. Validar firma del token                             │    │
│  │ 3. Verificar expiración                                │    │
│  │ 4. Extraer claims (userId, email, etc.)                │    │
│  │                                                         │    │
│  │ ✅ Token válido → Continuar                            │    │
│  │ ❌ Token inválido → 401 Unauthorized                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  🎯 TransactionsController.cs                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ [Authorize] ◄─── Requiere autenticación                │    │
│  │ [HttpGet]                                               │    │
│  │ public async Task<IActionResult> GetAll()               │    │
│  │ {                                                       │    │
│  │   var userId = GetUserId(); // Del token JWT           │    │
│  │   var transactions = await _service                    │    │
│  │     .GetAllAsync(userId);                              │    │
│  │   return Ok(transactions);                             │    │
│  │ }                                                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ Response: 200 OK
                          │ Body: [ { transacciones... } ]
                          │
┌─────────────────────────▼────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📥 Mostrar transacciones en la UI                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Problema Actual: CORS

**Sin CORS configurado:**

```
FRONTEND                    BACKEND
localhost:3000             localhost:5088
     │                          │
     │  POST /api/auth/login    │
     ├─────────────────────────►│
     │                          │
     │  ❌ CORS ERROR           │
     │◄─────────────────────────┤
     │                          │
     
Error en consola:
"Access to fetch at 'http://localhost:5088/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy"
```

**Con CORS configurado:**

```
FRONTEND                    BACKEND
localhost:3000             localhost:5088
     │                          │
     │  POST /api/auth/login    │
     ├─────────────────────────►│
     │                          │ ✅ CORS permite
     │                          │    origin: localhost:3000
     │                          │
     │  ✅ 200 OK + Token       │
     │◄─────────────────────────┤
     │                          │
     
✅ Login exitoso!
```

---

## 📝 Código CORS Necesario

**En `BookKeeping/Program.cs`:**

```csharp
// ANTES de var app = builder.Build();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000")  // ← Frontend URL
            .AllowAnyMethod()                       // ← GET, POST, PUT, DELETE
            .AllowAnyHeader()                       // ← Content-Type, Authorization
            .AllowCredentials());                   // ← Cookies, tokens
});

// DESPUÉS de app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
```

---

## ✅ Verificación Visual

**Cómo saber si funciona:**

### ❌ Sin CORS (Error)
```
DevTools Console (F12):
┌────────────────────────────────────────────────────────┐
│ ❌ Access to fetch at 'http://localhost:5088/api/...'  │
│    from origin 'http://localhost:3000' has been        │
│    blocked by CORS policy                              │
└────────────────────────────────────────────────────────┘

Network Tab:
┌────────────────────────────────────────────────────────┐
│ Name: login                                            │
│ Status: (failed) net::ERR_FAILED                       │
│ Type: fetch                                            │
└────────────────────────────────────────────────────────┘
```

### ✅ Con CORS (Funciona)
```
DevTools Console (F12):
┌────────────────────────────────────────────────────────┐
│ ✅ (Sin errores de CORS)                               │
└────────────────────────────────────────────────────────┘

Network Tab:
┌────────────────────────────────────────────────────────┐
│ Name: login                                            │
│ Status: 200 OK                                         │
│ Type: fetch                                            │
│ Response: { token: "...", user: {...} }               │
└────────────────────────────────────────────────────────┘

Application Tab → Local Storage:
┌────────────────────────────────────────────────────────┐
│ Key: token                                             │
│ Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...        │
│                                                        │
│ Key: user                                              │
│ Value: {"id":1,"email":"juan@test.com",...}           │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Resumen

1. **Frontend** → Ya está listo ✅
2. **Backend** → Solo falta CORS ⚠️
3. **CORS** → 2 líneas de código 📝
4. **Resultado** → Todo funcionará 🚀

---

**¡Una vez que tu amigo agregue CORS, todo funcionará perfectamente!**
