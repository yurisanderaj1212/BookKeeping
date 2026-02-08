# Frontend-Backend Integration Example

## Cómo actualizar las páginas de autenticación para usar el backend

### 1. Actualizar el Layout Principal

```tsx
// app/layout.tsx
import { AuthProvider } from './hooks/useAuth'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 2. Actualizar la página de Login

```tsx
// app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login, loginWithGoogle, loginWithMicrosoft, loginWithApple, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const result = await login(email, password, rememberMe)
    
    if (result.success) {
      router.push('/dashboard') // Redirect to dashboard
    } else {
      setError(result.error || 'Login failed')
    }
  }

  const handleSocialLogin = (provider: string) => {
    switch (provider) {
      case 'google':
        loginWithGoogle()
        break
      case 'microsoft':
        loginWithMicrosoft()
        break
      case 'apple':
        loginWithApple()
        break
    }
  }

  // Rest of the component remains the same...
  // Just replace the console.log calls with actual API calls
}
```

### 3. Actualizar la página de Register

```tsx
// app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const { register, loginWithGoogle, loginWithMicrosoft } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    occupation: '',
    customOccupation: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    const result = await register(formData)
    
    if (result.success) {
      setSuccess('Registration successful! Please check your email to verify your account.')
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } else {
      setError(result.error || 'Registration failed')
    }
  }

  // Rest of the component remains the same...
}
```

### 4. Crear página de Dashboard protegida

```tsx
// app/dashboard/page.tsx
'use client'

import { useAuth, withAuth } from '../../hooks/useAuth'

function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    // User will be redirected to login automatically
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.firstName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-500">Dashboard content will go here</p>
          </div>
        </div>
      </main>
    </div>
  )
}

// Protect the dashboard with authentication
export default withAuth(DashboardPage)
```

### 5. Manejar OAuth Callbacks

```tsx
// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '../../../services/authService'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        // Handle OAuth error
        router.push(`/auth/login?error=${encodeURIComponent(error)}`)
        return
      }

      if (token) {
        // Handle successful OAuth login
        // The backend should return user data and tokens in the URL or set cookies
        try {
          // Parse token data or make API call to get user info
          // This depends on how your backend handles OAuth callbacks
          router.push('/dashboard')
        } catch (error) {
          router.push('/auth/login?error=oauth_failed')
        }
      } else {
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  )
}
```

### 6. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
NEXT_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
```

### 7. Middleware para rutas protegidas

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is authenticated for protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  
  // Get token from cookies or headers
  const token = request.cookies.get('refreshToken')?.value
  
  if (isDashboard && !token) {
    // Redirect to login if trying to access dashboard without token
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  if (isAuthPage && token) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}
```

## Flujo de Trabajo Recomendado

### Para el desarrollador Frontend:
1. Implementar las páginas de autenticación con mock data primero
2. Crear los servicios y hooks de autenticación
3. Integrar con el backend cuando esté listo
4. Probar todos los flujos de autenticación

### Para el desarrollador Backend:
1. Configurar la estructura básica del proyecto .NET
2. Implementar los endpoints de autenticación básicos
3. Agregar OAuth providers
4. Implementar seguridad y validaciones
5. Documentar la API con Swagger

### Coordinación entre ambos:
1. **Definir el contrato de API** (ya está en backend-integration-guide.md)
2. **Acordar formato de errores** y códigos de respuesta
3. **Configurar CORS** correctamente
4. **Probar integración** con herramientas como Postman
5. **Manejar casos edge** (tokens expirados, errores de red, etc.)

## Testing de la Integración

### 1. Casos de prueba para Login:
- ✅ Login exitoso con credenciales válidas
- ❌ Login fallido con credenciales inválidas
- ❌ Login con email no verificado
- ❌ Login con demasiados intentos fallidos
- ✅ OAuth login exitoso
- ❌ OAuth login cancelado

### 2. Casos de prueba para Register:
- ✅ Registro exitoso con datos válidos
- ❌ Registro con email ya existente
- ❌ Registro con contraseña débil
- ❌ Registro sin aceptar términos
- ✅ Verificación de email

### 3. Casos de prueba para Token Management:
- ✅ Refresh token automático
- ❌ Token expirado sin refresh token
- ✅ Logout exitoso
- ❌ Acceso a rutas protegidas sin token

Esta estructura te permitirá trabajar de manera coordinada con tu amigo que desarrolla el backend, asegurando que ambas partes funcionen perfectamente juntas.