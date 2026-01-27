'use client'

import { ReactNode } from 'react'

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    company?: string
    occupation?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => void
  loginWithMicrosoft: () => void
  loginWithApple: () => void
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simplified version - just return children for now
  return children
}

export function useAuth(): AuthContextType {
  // Simplified version for now
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: async () => ({ success: false }),
    register: async () => ({ success: false }),
    logout: async () => {},
    forgotPassword: async () => ({ success: false }),
    loginWithGoogle: () => {},
    loginWithMicrosoft: () => {},
    loginWithApple: () => {},
  }
}