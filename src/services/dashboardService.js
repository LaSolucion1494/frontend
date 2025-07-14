import { apiClient } from "../config/api"

export const dashboardService = {
  // Obtener datos completos del dashboard
  getDashboardData: async () => {
    try {
      console.log("dashboardService.getDashboardData called")
      const response = await apiClient.get("/dashboard")
      console.log("Dashboard data response:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener datos del dashboard",
        }
      }
    } catch (error) {
      console.error("Error in dashboardService.getDashboardData:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión al servidor",
      }
    }
  },

  // Obtener solo estadísticas
  getStats: async () => {
    try {
      console.log("dashboardService.getStats called")
      const response = await apiClient.get("/dashboard/stats")
      console.log("Dashboard stats response:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener estadísticas",
        }
      }
    } catch (error) {
      console.error("Error in dashboardService.getStats:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión al servidor",
      }
    }
  },

  // Obtener resumen rápido
  getQuickSummary: async () => {
    try {
      console.log("dashboardService.getQuickSummary called")
      const response = await apiClient.get("/dashboard/quick-summary")
      console.log("Quick summary response:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener resumen rápido",
        }
      }
    } catch (error) {
      console.error("Error in dashboardService.getQuickSummary:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión al servidor",
      }
    }
  },

  // Obtener productos más vendidos
  getTopProducts: async (days = 30, limit = 10) => {
    try {
      console.log("dashboardService.getTopProducts called:", { days, limit })
      const response = await apiClient.get(`/dashboard/top-products?days=${days}&limit=${limit}`)
      console.log("Top products response:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener productos más vendidos",
        }
      }
    } catch (error) {
      console.error("Error in dashboardService.getTopProducts:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión al servidor",
      }
    }
  },

  // Obtener alertas del sistema
  getSystemAlerts: async () => {
    try {
      console.log("dashboardService.getSystemAlerts called")
      const response = await apiClient.get("/dashboard/alerts")
      console.log("System alerts response:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener alertas del sistema",
        }
      }
    } catch (error) {
      console.error("Error in dashboardService.getSystemAlerts:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error de conexión al servidor",
      }
    }
  },
}

export default dashboardService
