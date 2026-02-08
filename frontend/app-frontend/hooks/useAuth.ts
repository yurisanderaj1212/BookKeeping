'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  isAuthenticated, 
  getCurrentUser, 
  clearAuthData, 
  isProtectedRoute, 
  isAuthRoute,
  type User 
} from '@/lib/auth'

/**
 * Hook personalizado para manejar autenticación y protección de rutas
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [pathname])

  const checkAuthStatus = () => {
    setIsLoading(true)
    
    try {
      const authenticated = isAuthenticated()
      const currentUser = getCurrentUser()
      
      if (authenticated && currentUser) {
        setUser(currentUser)
        
        // Si está autenticado y trata de acceder a rutas de auth, redirigir al dashboard
        if (isAuthRoute(pathname)) {
          router.replace('/dashboard')
          return
        }
      } else {
        setUser(null)
        
        // Si no está autenticado y trata de acceder a rutas protegidas, redirigir al login
        if (isProtectedRoute(pathname)) {
          router.replace('/auth/login')
          return
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setUser(null)
      clearAuthData()
      
      if (isProtectedRoute(pathname)) {
        router.replace('/auth/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthData()
    setUser(null)
    router.replace('/auth/login')
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    checkAuthStatus
  }
}