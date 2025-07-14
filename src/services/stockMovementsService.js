import { apiClient } from "../config/api"

export const stockMovementsService = {
  // Obtener movimientos de stock CON PAGINACIÓN
  getStockMovements: async (filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      console.log("Service: Fetching with params:", params.toString()) // Para debug

      const response = await apiClient.get(`/stock-movements?${params.toString()}`)

      // Calcular información de paginación
      const totalItems = response.data.data.total || 0 // CAMBIO: Acceder a data.total
      const limit = Number.parseInt(filters.limit) || 20
      const offset = Number.parseInt(filters.offset) || 0
      const currentPage = Math.floor(offset / limit) + 1
      const totalPages = Math.ceil(totalItems / limit)

      const pagination = {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      }

      console.log("Service: Calculated pagination:", pagination) // Para debug

      return {
        success: true,
        data: {
          movements: response.data.data.movements || [], // CAMBIO: Acceder a data.movements
          total: totalItems,
        },
        pagination: response.data.pagination || pagination, // CAMBIO: Usar paginación del backend si existe, sino la calculada
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos de stock",
        error: error.response?.data,
        data: { movements: [], total: 0 },
        pagination: null,
      }
    }
  },

  // Crear un movimiento de stock
  createStockMovement: async (movementData) => {
    try {
      const response = await apiClient.post("/stock-movements", movementData)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          message: response.data.message || "Movimiento creado exitosamente",
        }
      } else {
        return {
          success: true,
          data: response.data,
          message: "Movimiento creado exitosamente",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear movimiento de stock",
        error: error.response?.data,
      }
    }
  },

  // Obtener movimientos de un producto específico CON PAGINACIÓN
  getProductMovements: async (productId, filters = {}) => {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/stock-movements/product/${productId}?${params.toString()}`)

      // Si el backend no retorna paginación para movimientos de producto,
      // calculamos una paginación básica
      const movements = Array.isArray(response.data.data.movements) ? response.data.data.movements : [] // CAMBIO: Acceder a data.movements
      const totalItems = response.data.data.total || 0 // CAMBIO: Acceder a data.total
      const limit = Number.parseInt(filters.limit) || 20
      const offset = Number.parseInt(filters.offset) || 0
      const currentPage = Math.floor(offset / limit) + 1
      const totalPages = Math.ceil(totalItems / limit)

      const pagination = {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      }

      return {
        success: true,
        data: {
          movements,
          total: totalItems,
        },
        pagination: response.data.pagination || pagination, // CAMBIO: Usar paginación del backend si existe, sino la calculada
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos del producto",
        error: error.response?.data,
        data: { movements: [], total: 0 },
        pagination: null,
      }
    }
  },
}

export default stockMovementsService
