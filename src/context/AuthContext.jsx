"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authService } from "../services/authService"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [initialized, setInitialized] = useState(false)

  const clearAuthState = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    // Limpiar cookies del lado del cliente
    document.cookie = "token-jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname
    document.cookie = "token-jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
  }, [])

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Verificar si existe el token en las cookies
      const hasToken = document.cookie.includes("token-jwt=")

      if (!hasToken) {
        clearAuthState()
        setInitialized(true)
        return
      }

      const result = await authService.checkSession()

      if (result.success && result.data?.user) {
        setUser(result.data.user)
        setIsAuthenticated(true)
        setError(null)
      } else {
        // Si el servidor dice que no hay sesión válida, limpiar todo
        clearAuthState()
      }
    } catch (error) {
      console.error("Error checking session:", error)
      // En caso de error, limpiar el estado de autenticación
      clearAuthState()
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [clearAuthState])

  // Solo verificar sesión una vez al montar
  useEffect(() => {
    if (!initialized) {
      checkSession()
    }
  }, [checkSession, initialized])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(credentials)

      if (result.success && result.data) {
        setUser(result.data)
        setIsAuthenticated(true)
        toast.success(`¡Bienvenido ${result.data.nombre}!`, {
          icon: "🎉",
        })
        return { success: true }
      } else {
        const errorMessage = result.message || "Error al iniciar sesión"
        setError(errorMessage)
        toast.error(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      console.error("Error en login:", error)
      const message = "Error al iniciar sesión"
      setError(message)
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.register(userData)

      if (result.success) {
        toast.success("¡Usuario registrado exitosamente! 🎉", {
          icon: "✅",
        })
        return { success: true }
      } else {
        const errorMessage = result.message || "Error al registrar usuario"
        setError(errorMessage)
        toast.error(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      console.error("Error en register:", error)
      const message = "Error al registrar usuario"
      setError(message)
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      toast.success("Sesión cerrada correctamente")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
    } finally {
      clearAuthState()
      setLoading(false)
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    initialized,
    login,
    register,
    logout,
    clearAuthState,
    checkSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
