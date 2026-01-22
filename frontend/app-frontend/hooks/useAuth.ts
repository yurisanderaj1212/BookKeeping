'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { authService } from '../services/authService'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  occupation?: string
  role: string
  isEmailVerified: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => void
  loginWithMicrosoft: () => void
  loginWithApple: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true)
    try {
      const response = await authService.login({ email, password, rememberMe })
      
      if (response.success && response.data) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any) => {
    setIsLoading(true)
    try {
      const response = await authService.register(userData)
      
      if (response.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Registration failed' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await authService.forgotPassword({ email })
      
      if (response.success) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Failed to send reset email' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const loginWithGoogle = () => {
    authService.loginWithGoogle()
  }

  const loginWithMicrosoft = () => {
    authService.loginWithMicrosoft()
  }

  const loginWithApple = () => {
    authService.loginWithApple()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithApple,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    return <Component {...props} />
  }
}