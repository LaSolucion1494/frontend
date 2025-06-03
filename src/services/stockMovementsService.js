import { apiClient } from "../config/api"

export const stockMovementsService = {
  // Obtener movimientos de stock
  getStockMovements: async (filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/stock-movements?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos de stock",
        error: error.response?.data,
      }
    }
  },

  // Crear un movimiento de stock
  createStockMovement: async (movementData) => {
    try {
      const response = await apiClient.post("/stock-movements", movementData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear movimiento de stock",
        error: error.response?.data,
      }
    }
  },

  // Obtener movimientos de un producto específico
  getProductMovements: async (productId, limit = 20) => {
    try {
      const response = await apiClient.get(`/stock-movements/product/${productId}?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos del producto",
        error: error.response?.data,
      }
    }
  },
}

export default stockMovementsService
