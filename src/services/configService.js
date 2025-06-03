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

  // Obtener una configuración específica
  getConfigByKey: async (key) => {
    try {
      const response = await apiClient.get(`/config/${key}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener configuración",
        error: error.response?.data,
      }
    }
  },

  // Actualizar configuración
  updateConfig: async (configs) => {
    try {
      const response = await apiClient.put("/config", { configs })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar configuración",
        error: error.response?.data,
      }
    }
  },

  // Actualizar una configuración específica
  updateConfigByKey: async (key, valor) => {
    try {
      const response = await apiClient.put(`/config/${key}`, { valor })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar configuración",
        error: error.response?.data,
      }
    }
  },
}

export default configService
