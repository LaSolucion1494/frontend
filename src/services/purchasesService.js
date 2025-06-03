import { apiClient } from "../config/api"

export const purchasesService = {
  // Obtener todas las compras con filtros
  getPurchases: async (filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras",
        error: error.response?.data,
      }
    }
  },

  // Obtener una compra por ID con sus detalles
  getPurchaseById: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compra",
        error: error.response?.data,
      }
    }
  },

  // Crear una nueva compra
  createPurchase: async (purchaseData) => {
    try {
      const response = await apiClient.post("/purchases", purchaseData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear compra",
        error: error.response?.data,
      }
    }
  },

  // Actualizar estado de una compra
  updatePurchaseStatus: async (id, statusData) => {
    try {
      const response = await apiClient.patch(`/purchases/${id}/status`, statusData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar estado de compra",
        error: error.response?.data,
      }
    }
  },

  // Recibir productos de una compra
  receivePurchaseItems: async (id, receiveData) => {
    try {
      const response = await apiClient.post(`/purchases/${id}/receive`, receiveData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al recibir productos",
        error: error.response?.data,
      }
    }
  },

  // Cancelar una compra
  cancelPurchase: async (id) => {
    try {
      const response = await apiClient.delete(`/purchases/${id}/cancel`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al cancelar compra",
        error: error.response?.data,
      }
    }
  },

  // Obtener estadísticas de compras (para dashboard)
  getPurchaseStats: async (filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases/stats?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
      }
    }
  },

  // Obtener compras pendientes de recepción
  getPendingPurchases: async () => {
    try {
      const response = await apiClient.get("/purchases?estado=pendiente")
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras pendientes",
        error: error.response?.data,
      }
    }
  },

  // Obtener compras por proveedor
  getPurchasesBySupplier: async (supplierId, filters = {}) => {
    try {
      const params = new URLSearchParams()
      params.append("proveedor", supplierId)

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras del proveedor",
        error: error.response?.data,
      }
    }
  },
}

export default purchasesService