import axios from "axios"

// Configuración base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4486/api"

// Instancia de axios configurada
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// Variable para controlar redirects
let isRedirecting = false

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir en rutas protegidas, no en login/register
    const currentPath = window.location.pathname
    const isAuthRoute = currentPath === "/login" || currentPath === "/register"

    if (error.response?.status === 401 && !isRedirecting && !isAuthRoute) {
      isRedirecting = true

      // Limpiar cookies
      document.cookie = "token-jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Redirigir después de un delay
      setTimeout(() => {
        window.location.href = "/login"
        isRedirecting = false
      }, 100)
    }
    return Promise.reject(error)
  },
)

export default apiClient
