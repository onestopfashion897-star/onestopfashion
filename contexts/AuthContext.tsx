"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default auth context value
const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: () => {},
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    console.log('AuthContext: useEffect triggered')
    
    const initializeAuth = async () => {
      // Ensure we're on the client side before accessing localStorage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        console.log('AuthContext: Token from localStorage:', token ? token.substring(0, 20) + '...' : 'null')
        if (token) {
          await fetchUser(token)
        } else {
          console.log('AuthContext: No token found, setting loading to false')
          setLoading(false)
        }
      } else {
        console.log('AuthContext: Server side, setting loading to false')
        setLoading(false)
      }
    }
    
    initializeAuth()
  }, [])

  const fetchUser = async (token: string) => {
    try {
      console.log('AuthContext: Fetching user with token:', token.substring(0, 20) + '...')
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('AuthContext: Auth me response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('AuthContext: User data received:', data)
        console.log('AuthContext: Setting user state to:', data.data.user.name)
        setUser(data.data.user)
      } else {
        console.log('AuthContext: Auth me failed, removing token')
        localStorage.removeItem('authToken')
        setUser(null)
      }
    } catch (error) {
      console.error('AuthContext: Error fetching user:', error)
      localStorage.removeItem('authToken')
      setUser(null)
    } finally {
      console.log('AuthContext: Setting loading to false')
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data.user)
        localStorage.setItem('authToken', data.data.token)
        return true
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setUser(data.data.user)
        localStorage.setItem('authToken', data.data.token)
        return true
      } else {
        throw new Error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authToken')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
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
    console.warn('useAuth must be used within an AuthProvider, returning default context')
    return defaultAuthContext
  }
  return context
}