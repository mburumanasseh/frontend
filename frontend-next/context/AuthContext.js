'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '../lib/clientApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const user = await meRequest()
      setCurrentUser(user)
      return user
    } catch {
      setCurrentUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (email, password) => {
    try {
      const user = await loginRequest(email, password)
      setCurrentUser(user)
      return { success: true, user }
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' }
    }
  }

  const register = async (payload) => {
    try {
      const user = await registerRequest(payload)
      setCurrentUser(user)
      return { success: true, user }
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' }
    }
  }

  const logout = async () => {
    await logoutRequest()
    setCurrentUser(null)
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [currentUser, loading, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
