import { apiClient } from "../config/api"

export const categoriesService = {
  // Obtener todas las categorías con filtros y paginación
  getCategories: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/categories?${params.toString()}`)
      return { success: true, data: response.data.data, pagination: response.data.pagination }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener categorías",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Crear una nueva categoría
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post("/categories", categoryData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear categoría",
        error: error.response?.data,
      }
    }
  },

  // Actualizar una categoría
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar categoría",
        error: error.response?.data,
      }
    }
  },

  // Eliminar una categoría
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/categories/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar categoría",
        error: error.response?.data,
      }
    }
  },
}

export default categoriesService
