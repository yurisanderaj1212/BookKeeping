/**
 * Utilidades de autenticación para el frontend
 * Maneja la validación de tokens JWT y estado de autenticación
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

/**
 * Verifica si el usuario está autenticado
 * Comprueba la existencia y validez del token JWT
 */
export function isAuthenticated(): boolean {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      return false
    }
    
    // Decodificar el payload del JWT para verificar expiración
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp < currentTime) {
      // Token expirado, limpiar localStorage
      clearAuthData()
      return false
    }
    
    return true
  } catch (error) {
    // Si hay error al decodificar el token, considerarlo inválido
    console.error('Error validating token:', error)
    clearAuthData()
    return false
  }
}

/**
 * Obtiene el token de autenticación actual
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * Obtiene los datos del usuario actual
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
}

/**
 * Limpia todos los datos de autenticación del localStorage
 */
export function clearAuthData(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Verifica si una ruta requiere autenticación
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/transactions',
    '/employees',
    '/reports',
    '/analytics',
    '/settings',
    '/week-close',
    '/notifications'
  ]
  
  return protectedRoutes.some(route => pathname.startsWith(route))
}

/**
 * Verifica si una ruta es de autenticación (login, register, etc.)
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ]
  
  return authRoutes.some(route => pathname.startsWith(route))
}

/**
 * Guarda los datos del usuario en localStorage
 */
export function saveUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user))
}
