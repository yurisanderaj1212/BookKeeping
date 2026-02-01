import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de Next.js para protección de rutas
 * Se ejecuta antes de que se cargue cualquier página
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener el token de las cookies o headers (Next.js middleware no puede acceder a localStorage)
  // Por ahora, permitimos que las páginas se carguen y la validación se hará en el cliente
  
  // Lista de rutas protegidas
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
  
  // Lista de rutas de autenticación
  const authRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
  ]
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Por ahora, solo registramos en consola para debugging
  // La validación real del token se hará en el cliente usando el hook useAuth
  if (isProtectedRoute) {
    console.log(`[Middleware] Accessing protected route: ${pathname}`)
  }
  
  if (isAuthRoute) {
    console.log(`[Middleware] Accessing auth route: ${pathname}`)
  }
  
  // Permitir que la request continúe
  return NextResponse.next()
}

/**
 * Configuración del middleware
 * Define en qué rutas se debe ejecutar
 */
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - archivos con extensión (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}