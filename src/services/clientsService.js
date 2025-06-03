import { apiClient } from "../config/api"

export const clientsService = {
  // Obtener todos los clientes con filtros opcionales
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/clientes?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener clientes",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Crear un nuevo cliente
  async create(clientData) {
    try {
      const response = await apiClient.post("/clientes", clientData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear cliente",
        error: error.response?.data,
      }
    }
  },

  // Actualizar un cliente
  async update(id, clientData) {
    try {
      const response = await apiClient.put(`/clientes/${id}`, clientData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar cliente",
        error: error.response?.data,
      }
    }
  },

  // Cambiar estado de un cliente
  async toggleStatus(id, activo) {
    try {
      const response = await apiClient.patch(`/clientes/${id}/toggle-status`, { activo })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al cambiar estado del cliente",
        error: error.response?.data,
      }
    }
  },

  // Eliminar un cliente
  async delete(id) {
    try {
      const response = await apiClient.delete(`/clientes/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar cliente",
        error: error.response?.data,
      }
    }
  },
}
