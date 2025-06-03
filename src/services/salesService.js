import { apiClient } from "../config/api"

export const salesService = {
  // Obtener todas las ventas con filtros
  async getSales(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/sales?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener estadísticas de ventas
  async getSalesStats(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          // Solo incluir fechaInicio y fechaFin para las estadísticas
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const response = await apiClient.get(`/sales/stats?${params.toString()}`)
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

  // Obtener una venta por ID
  async getSaleById(id) {
    try {
      const response = await apiClient.get(`/sales/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener venta",
        error: error.response?.data,
      }
    }
  },

  // Crear una nueva venta
  async createSale(saleData) {
    try {
      const response = await apiClient.post("/sales", saleData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear venta",
        error: error.response?.data,
      }
    }
  },

  // Anular una venta
  async cancelSale(id, motivo) {
    try {
      const response = await apiClient.patch(`/sales/${id}/cancel`, { motivo })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular venta",
        error: error.response?.data,
      }
    }
  },

  // Obtener ventas por cliente
  async getSalesByClient(clientId, limit = 20) {
    try {
      const response = await apiClient.get(`/sales/client/${clientId}?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas del cliente",
        error: error.response?.data,
        data: [],
      }
    }
  },
}
