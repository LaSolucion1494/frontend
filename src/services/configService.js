import { apiClient } from "../config/api"

export const configService = {
  // Obtener toda la configuración
  getConfig: async () => {
    try {
      const response = await apiClient.get("/config")
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener configuración",
        error: error.response?.data,
      }
    }
  },

  // Actualizar una o varias configuraciones
  updateConfig: async (configs, recalculatePrices = false) => {
    try {
      const response = await apiClient.put("/config", { configs, recalculatePrices })
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar configuración",
        error: error.response?.data,
      }
    }
  },

  // Recalcular todos los precios de venta desde el endpoint de configuración
  recalculateAllPrices: async () => {
    try {
      const response = await apiClient.post("/config/recalculate-prices")
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al recalcular precios",
        error: error.response?.data,
      }
    }
  },
}

export default configService
