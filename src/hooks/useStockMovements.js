"use client"

import { useState, useCallback, useEffect } from "react"
import { stockMovementsService } from "../services/stockMovementsService"
import toast from "react-hot-toast"

export const useStockMovements = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados integrados de filtros y paginación
  const [filters, setFilters] = useState({
    search: "",
    productId: "",
    tipo: "todos", // CAMBIO: Inicializar tipo a "todos"
    fechaInicio: "",
    fechaFin: "",
    limit: 20, // Límite por defecto
    offset: 0,
    ...initialFilters,
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialFilters.limit || 20,
  })

  // Estados para diferentes tipos de datos
  const [movements, setMovements] = useState([])

  // Función para actualizar filtros y resetear paginación
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    if (newFilters.offset === undefined) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }))
    }
  }, [])

  // Función para manejar cambio de página
  const handlePageChange = useCallback(
    (page) => {
      const newOffset = (page - 1) * filters.limit
      setFilters((prev) => ({ ...prev, offset: newOffset }))
      setPagination((prev) => ({ ...prev, currentPage: page }))
    },
    [filters.limit],
  )

  // Obtener movimientos de stock CON PAGINACIÓN
  const fetchMovements = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = {
          ...filters,
          ...customFilters,
        }

        // CAMBIO: Convertir "todos" a cadena vacía para la API si es necesario
        if (finalFilters.tipo === "todos") {
          finalFilters.tipo = ""
        }

        console.log("Hook: Fetching movements with filters:", finalFilters) // Para debug

        const result = await stockMovementsService.getStockMovements(finalFilters)

        if (result.success) {
          setMovements(result.data.movements || [])

          // Actualizar información de paginación si está disponible
          if (result.pagination) {
            console.log("Hook: Pagination received:", result.pagination) // Para debug
            setPagination((prev) => ({
              ...prev,
              ...result.pagination,
            }))
          }

          return { success: true, data: result.data }
        } else {
          setError(result.message)
          setMovements([])
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar movimientos"
        setError(message)
        setMovements([])
        if (!customFilters.silent) {
          toast.error(message)
        }
        return { success: false, message }
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  // useEffect para auto-refresh cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMovements({ silent: true })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Crear movimiento de stock
  const createStockMovement = async (movementData) => {
    setLoading(true)
    try {
      const result = await stockMovementsService.createStockMovement(movementData)

      if (result.success) {
        toast.success("Movimiento de stock creado exitosamente")
        await fetchMovements({ silent: true })
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear movimiento de stock"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener movimientos de un producto específico CON PAGINACIÓN
  const fetchProductMovements = useCallback(
    async (productId, customFilters = {}) => {
      if (!productId || productId < 1) {
        toast.error("ID de producto inválido")
        return { success: false, message: "ID de producto inválido" }
      }

      setLoading(true)
      setError(null)

      try {
        const finalFilters = {
          ...customFilters,
          limit: filters.limit,
          offset: filters.offset,
        }

        const result = await stockMovementsService.getProductMovements(productId, finalFilters)

        if (result.success) {
          // Actualizar información de paginación si está disponible
          if (result.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...result.pagination,
            }))
          }

          return { success: true, data: result.data, pagination: result.pagination }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar movimientos del producto"
        if (!customFilters.silent) {
          toast.error(message)
        }
        return { success: false, message }
      } finally {
        setLoading(false)
      }
    },
    [filters.limit, filters.offset],
  )

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      productId: "",
      tipo: "todos", // CAMBIO: Limpiar a "todos"
      fechaInicio: "",
      fechaFin: "",
      limit: 20,
      offset: 0,
    })
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
    })
  }, [])

  return {
    // Estados
    loading,
    error,
    filters,
    pagination,
    movements,

    // Funciones principales
    fetchMovements,
    createStockMovement,
    fetchProductMovements,

    // Funciones de paginación
    updateFilters,
    handlePageChange,
    clearFilters,

    // Aliases para compatibilidad
    refetch: fetchMovements,
  }
}

export default useStockMovements
