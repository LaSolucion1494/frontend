import { apiClient } from "../config/api"

export const suppliersService = {
  // Obtener todos los proveedores con filtros y paginación
  getSuppliers: async (filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/suppliers?${params.toString()}`)
      return { success: true, data: response.data.data, pagination: response.data.pagination }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener proveedores",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Obtener un proveedor por ID
  getSupplierById: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener proveedor",
        error: error.response?.data,
      }
    }
  },

  // Buscar proveedores por término (nombre, CUIT, teléfono, email)
  async search(term) {
    try {
      const response = await apiClient.get(`/suppliers/search?term=${encodeURIComponent(term)}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar proveedores",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Crear un nuevo proveedor
  createSupplier: async (supplierData) => {
    try {
      const response = await apiClient.post("/suppliers", supplierData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear proveedor",
        error: error.response?.data,
      }
    }
  },

  // Actualizar un proveedor
  updateSupplier: async (id, supplierData) => {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, supplierData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar proveedor",
        error: error.response?.data,
      }
    }
  },

  // Eliminar un proveedor
  deleteSupplier: async (id) => {
    try {
      const response = await apiClient.delete(`/suppliers/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar proveedor",
        error: error.response?.data,
      }
    }
  },
}

export default suppliersService
