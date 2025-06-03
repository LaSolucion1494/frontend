import { apiClient } from "../config/api"

export const cashClosingService = {
  // Obtener resumen diario de ventas
  async getDailySummary(fecha = null) {
    try {
      const params = new URLSearchParams()
      if (fecha) {
        params.append("fecha", fecha)
      }

      const response = await apiClient.get(`/cash-closing/daily-summary?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen diario",
        error: error.response?.data,
      }
    }
  },

  // Crear un nuevo cierre de caja
  async createClosing(closingData) {
    try {
      const response = await apiClient.post("/cash-closing", closingData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear cierre de caja",
        error: error.response?.data,
      }
    }
  },

  // Obtener todos los cierres con filtros
  async getClosings(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cash-closing?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cierres de caja",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener un cierre por ID
  async getClosingById(id) {
    try {
      const response = await apiClient.get(`/cash-closing/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cierre de caja",
        error: error.response?.data,
      }
    }
  },

  // Obtener estadísticas
  async getStats(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cash-closing/stats?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
        data: null,
      }
    }
  },
}
