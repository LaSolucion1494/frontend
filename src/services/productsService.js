import { apiClient } from "../config/api"

export const productsService = {
  // Obtener todos los productos con filtros
  getProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })
      const response = await apiClient.get(`/products?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener productos",
        error: error.response?.data,
      }
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener producto",
        error: error.response?.data,
      }
    }
  },

  // Buscar producto por código
  getProductByCode: async (code) => {
    try {
      const response = await apiClient.get(`/products/code/${code}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar producto por código",
        error: error.response?.data,
      }
    }
  },

  // Crear un nuevo producto
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post("/products", productData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear producto",
        error: error.response?.data,
      }
    }
  },

  // Actualizar un producto
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar producto",
        error: error.response?.data,
      }
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar producto",
        error: error.response?.data,
      }
    }
  },

  // Obtener desglose de cálculo de precios de un producto
  getProductPriceBreakdown: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}/price-breakdown`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener desglose de precios",
        error: error.response?.data,
      }
    }
  },

  // Validar código único
  validateProductCode: async (code, excludeId = null) => {
    try {
      const response = await apiClient.post("/products/validate-code", { code, excludeId })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al validar código",
        error: error.response?.data,
      }
    }
  },
}

export default productsService
