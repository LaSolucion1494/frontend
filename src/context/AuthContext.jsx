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

  const clearAuthState = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
    // Limpiar cookies
    document.cookie = "token-jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  }, [])

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)

      // Verificar si existe el token en las cookies antes de hacer la petición
      const cookies = document.cookie.split(";")
      const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("token-jwt="))

      if (!tokenCookie || tokenCookie.split("=")[1].trim() === "") {
        // No hay token, limpiar estado
        clearAuthState()
        return
      }

      const result = await authService.checkSession()
      if (result.success && result.data && result.data.user) {
        setUser(result.data.user)
        setIsAuthenticated(true)
        setError(null)
      } else {
        // Token inválido o expirado
        clearAuthState()
      }
    } catch (error) {
      // Error en la verificación, limpiar estado
      clearAuthState()
      console.error("Error checking session:", error)
    } finally {
      setLoading(false)
    }
  }, [clearAuthState])

  // Solo verificar sesión una vez al montar
  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      const result = await authService.login(credentials)
      if (result.success) {
        setUser(result.data)
        setIsAuthenticated(true)
        toast.success(`¡Bienvenido ${result.data.nombre}!`, {
          icon: "🎉",
        })
        return { success: true }
      } else {
        setError(result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
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
        setError(result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
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
      await authService.logout()
      toast.success("Sesión cerrada correctamente")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      clearAuthState()
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearAuthState,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
