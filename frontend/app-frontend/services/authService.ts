// Authentication Service - Frontend Integration Example
// This file shows how the frontend will integrate with the .NET backend

interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  company?: string
  occupation?: string
  customOccupation?: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface ForgotPasswordRequest {
  email: string
}

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

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

interface AuthResponse {
  success: boolean
  data?: {
    user: User
    tokens: AuthTokens
  }
  error?: {
    code: string
    message: string
    field?: string
  }
}

class AuthService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  private accessToken: string | null = null

  // Traditional Email/Password Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (data.success && data.data?.tokens) {
        this.setTokens(data.data.tokens)
        this.setUser(data.data.user)
      }

      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server'
        }
      }
    }
  }

  // User Registration
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server'
        }
      }
    }
  }

  // Forgot Password
  async forgotPassword(request: ForgotPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      return await response.json()
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server'
        }
      }
    }
  }

  // Social Login - Google
  async loginWithGoogle(): Promise<void> {
    window.location.href = `${this.baseURL}/auth/google`
  }

  // Social Login - Microsoft
  async loginWithMicrosoft(): Promise<void> {
    window.location.href = `${this.baseURL}/auth/microsoft`
  }

  // Social Login - Apple
  async loginWithApple(): Promise<void> {
    window.location.href = `${this.baseURL}/auth/apple`
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
      this.clearUser()
    }
  }

  // Refresh Token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return false

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (data.success && data.data?.tokens) {
        this.setTokens(data.data.tokens)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  // Token Management
  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('tokenExpiry', (Date.now() + tokens.expiresIn * 1000).toString())
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  private clearTokens(): void {
    this.accessToken = null
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiry')
  }

  // User Management
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  private clearUser(): void {
    localStorage.removeItem('user')
  }

  // Authentication State
  isAuthenticated(): boolean {
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    if (!tokenExpiry || !this.getRefreshToken()) return false
    
    return Date.now() < parseInt(tokenExpiry)
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  // HTTP Interceptor for API calls
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Check if token needs refresh
    const tokenExpiry = localStorage.getItem('tokenExpiry')
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry) - 60000) { // Refresh 1 minute before expiry
      await this.refreshToken()
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Handle 401 Unauthorized
    if (response.status === 401) {
      const refreshSuccess = await this.refreshToken()
      if (refreshSuccess) {
        // Retry request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        })
      } else {
        // Refresh failed, redirect to login
        this.clearTokens()
        this.clearUser()
        window.location.href = '/auth/login'
      }
    }

    return response
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService