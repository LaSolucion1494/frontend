"use client"

import { createContext, useContext, useState, useEffect } from "react"
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Intentar obtener el usuario actual desde la API
        const result = await authService.checkSession()

        if (result.success && result.data?.user) {
          setUser(result.data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error al verificar el estado de autenticación:", error)
        setUser(null)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(credentials)

      if (result.success && result.data) {
        setUser(result.data)
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
      await authService.logout()
      setUser(null)
      toast.success("Sesión cerrada correctamente")
      return true
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast.error("Error al cerrar sesión")
      setUser(null) // Limpiar el estado local aunque falle el logout
      return false
    }
  }

  // Valores que se proporcionarán a través del contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
