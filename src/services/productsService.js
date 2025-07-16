import { apiClient } from "../config/api"

export const productsService = {
  // Obtener todos los productos con filtros y paginación
  getProducts: async (filters = {}) => {
    try {
      console.log("productsService.getProducts called with filters:", filters)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const url = `/products?${params.toString()}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Response received:", response.data)

      if (response.data.success) {
        console.log("Processed products data:", response.data.data.length, "products")
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
        }
      } else {
        // Verificar si la respuesta es un array directamente (compatibilidad con versión anterior)
        const productsData = Array.isArray(response.data) ? response.data : []
        if (productsData.length > 0) {
          console.log("Processed products data (legacy format):", productsData.length, "products")
          return { success: true, data: productsData, pagination: null }
        }

        return {
          success: false,
          message: response.data.message || "Error al obtener productos",
          error: response.data,
          data: [],
          pagination: null,
        }
      }
    } catch (error) {
      console.error("Error in productsService.getProducts:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener productos",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // FUNCIÓN: Búsqueda específica para modales (sin paginación)
  search: async (term) => {
    try {
      const response = await apiClient.get(`/products/search?search=${encodeURIComponent(term)}&limit=50`)
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar productos",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener un producto por ID
  getProductById: async (id) => {
    try {
      console.log("productsService.getProductById called with ID:", id)

      const productId = Number.parseInt(id)
      if (!id || isNaN(productId) || productId < 1) {
        console.error("ID de producto inválido:", id)
        return {
          success: false,
          message: "ID de producto inválido",
        }
      }

      const response = await apiClient.get(`/products/${productId}`)
      console.log("Product details response:", response.data)

      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.getProductById:", error)
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
      console.log("productsService.getProductByCode called with code:", code)
      const response = await apiClient.get(`/products/code/${code}`)
      console.log("Product by code response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.getProductByCode:", error)
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
      console.log("productsService.createProduct called with data:", productData)
      const response = await apiClient.post("/products", productData)
      console.log("Create product response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.createProduct:", error)
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
      console.log("productsService.updateProduct called:", { id, productData })
      const response = await apiClient.put(`/products/${id}`, productData)
      console.log("Update product response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.updateProduct:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar producto",
        error: error.response?.data,
      }
    }
  },

  // Actualizar solo los precios de un producto
  updateProductPrices: async (id, priceData) => {
    try {
      console.log("productsService.updateProductPrices called:", { id, priceData })
      const response = await apiClient.put(`/products/${id}/prices`, priceData)
      console.log("Update product prices response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.updateProductPrices:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar precios del producto",
        error: error.response?.data,
      }
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      console.log("productsService.deleteProduct called with ID:", id)
      const response = await apiClient.delete(`/products/${id}`)
      console.log("Delete product response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.deleteProduct:", error)
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
      console.log("productsService.getProductPriceBreakdown called with ID:", id)
      const response = await apiClient.get(`/products/${id}/price-breakdown`)
      console.log("Price breakdown response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.getProductPriceBreakdown:", error)
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
      console.log("productsService.validateProductCode called:", { code, excludeId })
      const response = await apiClient.post("/products/validate-code", { code, excludeId })
      console.log("Validate code response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in productsService.validateProductCode:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al validar código",
        error: error.response?.data,
      }
    }
  },

  // Búsqueda de productos para dashboard (mantener compatibilidad)
  searchProducts: async (filters = {}) => {
    try {
      console.log("productsService.searchProducts called with filters:", filters)

      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const url = `/products/search?${params.toString()}`
      console.log("Making search request to:", url)

      const response = await apiClient.get(url)
      console.log("Search response received:", response.data)

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          searchTerm: response.data.searchTerm,
          totalResults: response.data.totalResults,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error en la búsqueda de productos",
          data: [],
        }
      }
    } catch (error) {
      console.error("Error in productsService.searchProducts:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error en la búsqueda de productos",
        data: [],
      }
    }
  },
}

export default productsService
