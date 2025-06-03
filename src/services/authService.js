import { apiClient } from "../config/api"

export const authService = {
  // Iniciar sesión
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
        error: error.response?.data,
      }
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al registrar usuario",
        error: error.response?.data,
      }
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      const response = await apiClient.post("/auth/logout")
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al cerrar sesión",
        error: error.response?.data,
      }
    }
  },

  // Verificar sesión activa
  checkSession: async () => {
    try {
      const response = await apiClient.get("/auth/check-session")
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Sesión no válida",
        error: error.response?.data,
      }
    }
  },
}

export default authService
