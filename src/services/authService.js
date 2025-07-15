const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

class AuthService {
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para las cookies
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data,
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al iniciar sesión",
        }
      }
    } catch (error) {
      console.error("Error en login:", error)
      return {
        success: false,
        message: "Error de conexión",
      }
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        return {
          success: true,
          data: data,
        }
      } else {
        return {
          success: false,
          message: data.message || "Error al registrar usuario",
        }
      }
    } catch (error) {
      console.error("Error en register:", error)
      return {
        success: false,
        message: "Error de conexión",
      }
    }
  }

  async checkSession() {
    try {
      const response = await fetch(`${API_URL}/auth/check-session`, {
        method: "GET",
        credentials: "include", // Importante para enviar las cookies
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          data: {
            user: data.user,
          },
        }
      } else {
        return {
          success: false,
          message: "Sesión no válida",
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
      return {
        success: false,
        message: "Error de conexión",
      }
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      return response.ok
    } catch (error) {
      console.error("Error en logout:", error)
      return false
    }
  }
}

export const authService = new AuthService()
