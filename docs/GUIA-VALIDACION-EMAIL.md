# 📧 Guía Completa: Validación de Emails

**Proyecto:** BookKeeping  
**Fecha:** 11 de Febrero de 2026  
**Problema:** Actualmente se pueden registrar emails falsos como `asdf@asdf.com`

---

## 🎯 Niveles de Validación

### **Nivel 1: Validación Básica (Actual) ⚠️**
```
Valida: usuario@dominio.com ✅
Permite: asdf@asdf.com ❌ (email falso)
Permite: test@test.test ❌ (dominio inexistente)
```

### **Nivel 2: Validación de Formato Estricta ✅**
```
Valida: usuario@gmail.com ✅
Rechaza: asdf@asdf ❌ (sin TLD válido)
Rechaza: @gmail.com ❌ (sin usuario)
Rechaza: usuario@.com ❌ (sin dominio)
```

### **Nivel 3: Verificación de Dominio ✅✅**
```
Valida: usuario@gmail.com ✅ (dominio existe)
Rechaza: usuario@asdfqwerty123.com ❌ (dominio no existe)
```

### **Nivel 4: Verificación de Email Real ✅✅✅**
```
Envía email de confirmación
Usuario debe hacer clic en el link
Solo entonces la cuenta se activa
```

---

## 🏆 Solución Recomendada

**Implementar Nivel 2 + Nivel 4:**
- **Nivel 2:** Validación estricta de formato (Frontend + Backend)
- **Nivel 4:** Email de confirmación (Backend)

**Razón:** Es el estándar de la industria (Gmail, Facebook, Twitter, etc.)

---

## 💻 Implementación Nivel 2: Validación de Formato Estricta

### **Frontend (Tu parte)**

#### **1. Crear función de validación de email**

Crear archivo: `lib/validators.ts`

```typescript
/**
 * Valida el formato de un email usando regex estricto
 * Basado en el estándar RFC 5322
 */
export function isValidEmail(email: string): boolean {
  // Regex estricto para validar emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Validaciones adicionales
  const [localPart, domain] = email.split('@')
  
  // El local part no puede estar vacío
  if (!localPart || localPart.length === 0) {
    return false
  }
  
  // El local part no puede tener más de 64 caracteres
  if (localPart.length > 64) {
    return false
  }
  
  // El dominio no puede estar vacío
  if (!domain || domain.length === 0) {
    return false
  }
  
  // El dominio debe tener al menos un punto
  if (!domain.includes('.')) {
    return false
  }
  
  // El TLD (top-level domain) debe tener al menos 2 caracteres
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return false
  }
  
  // El dominio no puede empezar o terminar con guión
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return false
  }
  
  return true
}

/**
 * Obtiene un mensaje de error descriptivo para emails inválidos
 */
export function getEmailErrorMessage(email: string): string {
  if (!email || email.trim().length === 0) {
    return 'El email es requerido'
  }
  
  if (!email.includes('@')) {
    return 'El email debe contener @'
  }
  
  const [localPart, domain] = email.split('@')
  
  if (!localPart || localPart.length === 0) {
    return 'El email debe tener un nombre de usuario antes del @'
  }
  
  if (localPart.length > 64) {
    return 'El nombre de usuario es demasiado largo (máximo 64 caracteres)'
  }
  
  if (!domain || domain.length === 0) {
    return 'El email debe tener un dominio después del @'
  }
  
  if (!domain.includes('.')) {
    return 'El dominio debe contener al menos un punto (ej: gmail.com)'
  }
  
  const tld = domain.split('.').pop()
  if (!tld || tld.length < 2) {
    return 'El dominio debe tener una extensión válida (ej: .com, .net, .org)'
  }
  
  if (domain.startsWith('-') || domain.endsWith('-')) {
    return 'El dominio no puede empezar o terminar con guión'
  }
  
  return 'El formato del email no es válido'
}

/**
 * Lista de dominios de email comunes para sugerencias
 */
export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'zoho.com',
  'mail.com'
]

/**
 * Sugiere correcciones para emails con errores comunes
 */
export function suggestEmailCorrection(email: string): string | null {
  if (!email.includes('@')) {
    return null
  }
  
  const [localPart, domain] = email.split('@')
  
  if (!domain) {
    return null
  }
  
  // Correcciones comunes de dominios
  const corrections: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com'
  }
  
  const correctedDomain = corrections[domain.toLowerCase()]
  
  if (correctedDomain) {
    return `${localPart}@${correctedDomain}`
  }
  
  return null
}
```

#### **2. Actualizar página de registro**

En `app/auth/register/page.tsx`, agregar la validación:

```typescript
import { isValidEmail, getEmailErrorMessage, suggestEmailCorrection } from '@/lib/validators'

// En la función de validación
const validateForm = () => {
  const newErrors: Record<string, string> = {}

  // Validar nombre
  if (!formData.firstName.trim()) {
    newErrors.firstName = 'El nombre es requerido'
  }

  // Validar apellido
  if (!formData.lastName.trim()) {
    newErrors.lastName = 'El apellido es requerido'
  }

  // Validar email con función estricta
  if (!formData.email.trim()) {
    newErrors.email = 'El email es requerido'
  } else if (!isValidEmail(formData.email)) {
    newErrors.email = getEmailErrorMessage(formData.email)
    
    // Sugerir corrección si hay un error común
    const suggestion = suggestEmailCorrection(formData.email)
    if (suggestion) {
      newErrors.email += `. ¿Quisiste decir ${suggestion}?`
    }
  }

  // ... resto de validaciones

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

#### **3. Agregar validación en tiempo real**

```typescript
const handleEmailBlur = () => {
  if (formData.email && !isValidEmail(formData.email)) {
    setErrors(prev => ({
      ...prev,
      email: getEmailErrorMessage(formData.email)
    }))
    
    // Mostrar sugerencia si hay error común
    const suggestion = suggestEmailCorrection(formData.email)
    if (suggestion) {
      showWarning(`¿Quisiste decir ${suggestion}?`)
    }
  }
}

// En el input de email
<input
  type="email"
  name="email"
  value={formData.email}
  onChange={handleInputChange}
  onBlur={handleEmailBlur}  // ← Agregar esto
  className="..."
/>
```

---

### **Backend (Tu amigo)**

#### **1. Validación en el modelo**

```csharp
using System.ComponentModel.DataAnnotations;

public class RegisterRequest
{
    [Required(ErrorMessage = "El nombre es requerido")]
    public string FirstName { get; set; }

    [Required(ErrorMessage = "El apellido es requerido")]
    public string LastName { get; set; }

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "El formato del email no es válido")]
    [RegularExpression(@"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
        ErrorMessage = "El formato del email no es válido")]
    public string Email { get; set; }

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    public string Password { get; set; }

    [Required(ErrorMessage = "Confirmar contraseña es requerido")]
    [Compare("Password", ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmPassword { get; set; }
}
```

#### **2. Validación adicional en el controlador**

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    // Validar modelo
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    // Validación adicional de email
    if (!IsValidEmailDomain(request.Email))
    {
        return BadRequest(new { message = "El dominio del email no es válido" });
    }

    // Verificar si el email ya existe
    var existingUser = await _context.Users
        .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
    
    if (existingUser != null)
    {
        return BadRequest(new { message = "Este email ya está registrado" });
    }

    // ... resto del código de registro
}

private bool IsValidEmailDomain(string email)
{
    var domain = email.Split('@')[1];
    
    // Lista de dominios bloqueados (temporales, desechables)
    var blockedDomains = new[] {
        "tempmail.com",
        "throwaway.email",
        "guerrillamail.com",
        "10minutemail.com",
        "mailinator.com"
    };
    
    return !blockedDomains.Contains(domain.ToLower());
}
```

---

## 📧 Implementación Nivel 4: Email de Confirmación

### **Backend (Tu amigo)**

#### **1. Agregar campos al modelo User**

```csharp
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // NUEVOS CAMPOS
    public bool EmailConfirmed { get; set; } = false;
    public string? EmailConfirmationToken { get; set; }
    public DateTime? EmailConfirmationTokenExpiry { get; set; }
}
```

#### **2. Modificar el registro para enviar email**

```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    // ... validaciones existentes ...

    // Crear usuario
    var user = new User
    {
        Email = request.Email.ToLower(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        FirstName = request.FirstName,
        LastName = request.LastName,
        IsActive = true,
        EmailConfirmed = false, // NUEVO
        EmailConfirmationToken = Guid.NewGuid().ToString(), // NUEVO
        EmailConfirmationTokenExpiry = DateTime.UtcNow.AddHours(24), // NUEVO
        CreatedAt = DateTime.UtcNow
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Enviar email de confirmación
    await SendConfirmationEmail(user);

    return Ok(new { 
        message = "Usuario registrado exitosamente. Por favor revisa tu email para confirmar tu cuenta." 
    });
}

private async Task SendConfirmationEmail(User user)
{
    var confirmationLink = $"https://tudominio.com/auth/confirm-email?token={user.EmailConfirmationToken}";
    
    var emailBody = $@"
        <h1>Bienvenido a BookKeeping</h1>
        <p>Hola {user.FirstName},</p>
        <p>Gracias por registrarte. Por favor confirma tu email haciendo clic en el siguiente enlace:</p>
        <a href='{confirmationLink}'>Confirmar Email</a>
        <p>Este enlace expira en 24 horas.</p>
    ";

    // Usar servicio de email (SendGrid, AWS SES, etc.)
    await _emailService.SendEmailAsync(user.Email, "Confirma tu email", emailBody);
}
```

#### **3. Crear endpoint para confirmar email**

```csharp
[HttpPost("confirm-email")]
[AllowAnonymous]
public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.EmailConfirmationToken == request.Token);

    if (user == null)
    {
        return BadRequest(new { message = "Token inválido" });
    }

    if (user.EmailConfirmationTokenExpiry < DateTime.UtcNow)
    {
        return BadRequest(new { message = "El token ha expirado" });
    }

    user.EmailConfirmed = true;
    user.EmailConfirmationToken = null;
    user.EmailConfirmationTokenExpiry = null;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Email confirmado exitosamente" });
}
```

#### **4. Modificar login para verificar email confirmado**

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
        return Unauthorized(new { message = "Credenciales inválidas" });
    }

    // NUEVO: Verificar email confirmado
    if (!user.EmailConfirmed)
    {
        return Unauthorized(new { 
            message = "Por favor confirma tu email antes de iniciar sesión",
            emailNotConfirmed = true
        });
    }

    // ... resto del código de login
}
```

---

### **Frontend (Tu parte)**

#### **1. Crear página de confirmación de email**

Crear archivo: `app/auth/confirm-email/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token no proporcionado')
      return
    }

    confirmEmail(token)
  }, [token])

  const confirmEmail = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5088/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      if (response.ok) {
        setStatus('success')
        setMessage('¡Email confirmado exitosamente!')
        setTimeout(() => router.push('/auth/login'), 3000)
      } else {
        const error = await response.json()
        setStatus('error')
        setMessage(error.message || 'Error al confirmar email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Confirmando email...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">{message}</h2>
            <p className="text-gray-600 mb-4">Redirigiendo al login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link href="/auth/login" className="text-primary-600 hover:underline">
              Volver al login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
```

#### **2. Actualizar mensaje después del registro**

En `app/auth/register/page.tsx`:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) {
    return
  }

  setIsLoading(true)

  try {
    const response = await fetch('http://localhost:5088/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      showSuccess('¡Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.')
      
      // Redirigir a página de "revisa tu email"
      setTimeout(() => router.push('/auth/check-email'), 2000)
    } else {
      const error = await response.json()
      showError(error.message || 'Error en el registro')
    }
  } catch (error) {
    showError('Error de conexión')
  } finally {
    setIsLoading(false)
  }
}
```

---

## 📊 Comparación de Niveles

| Nivel | Seguridad | Complejidad | UX | Recomendado |
|-------|-----------|-------------|-----|-------------|
| 1. Básico | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ❌ |
| 2. Formato Estricto | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| 3. Verificación DNS | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ |
| 4. Email Confirmación | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ |

---

## ✅ Recomendación Final

**Implementar Nivel 2 + Nivel 4:**

1. **Ahora (Nivel 2):** Validación estricta de formato
   - Rápido de implementar (1-2 horas)
   - Mejora inmediata
   - Bloquea emails obviamente falsos

2. **Después (Nivel 4):** Email de confirmación
   - Requiere servicio de email (SendGrid, AWS SES)
   - Estándar de la industria
   - Máxima seguridad

---

## 🚀 Plan de Implementación

### **Fase 1: Validación de Formato (Ahora)**
- [ ] Crear `lib/validators.ts` con funciones de validación
- [ ] Actualizar `register/page.tsx` con validación estricta
- [ ] Agregar validación en tiempo real (onBlur)
- [ ] Agregar sugerencias de corrección
- [ ] Tu amigo: Agregar validación en el backend

### **Fase 2: Email de Confirmación (Después)**
- [ ] Tu amigo: Agregar campos al modelo User
- [ ] Tu amigo: Configurar servicio de email
- [ ] Tu amigo: Crear endpoint de confirmación
- [ ] Crear página `confirm-email/page.tsx`
- [ ] Actualizar flujo de registro

---

¿Quieres que implemente la Fase 1 (Validación de Formato) ahora?
