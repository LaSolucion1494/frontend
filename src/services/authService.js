import { apiClient } from "../lib/api" // Importar la instancia de Axios

class AuthService {
  async login(credentials) {
    try {
      const response = await apiClient.post("/auth/login", credentials)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error en login:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión o credenciales inválidas",
      }
    }
  }

  async register(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      console.error("Error en register:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al registrar usuario",
      }
    }
  }

  async checkSession() {
    try {
      const response = await apiClient.get("/auth/check-session")
      return {
        success: true,
        data: {
          user: response.data.user,
        },
      }
    } catch (error) {
      console.error("Error checking session:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Sesión no válida o error de conexión",
      }
    }
  }

  async logout() {
    try {
      await apiClient.post("/auth/logout")
      return true
    } catch (error) {
      console.error("Error en logout:", error)
      return false
    }
  }
}

export const authService = new AuthService()
