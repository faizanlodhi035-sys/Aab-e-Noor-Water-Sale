import React, { createContext, useEffect, useState } from 'react'
import { login as apiLogin, logout as apiLogout } from '../api/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('auth_user')
    }
  }, [user])

  async function login({ email, password }) {
    try {
      const response = await apiLogin(email, password)

      if (response.success && response.data?.user) {
        setUser(response.data.user)

        return {
          success: true,
          user: response.data.user,
        }
      }

      return {
        success: false,
        message: response.message || 'Invalid credentials',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      }
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } catch {
      // Even if API logout fails, clear local session
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}