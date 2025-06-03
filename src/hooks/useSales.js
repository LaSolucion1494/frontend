// useSales.js
"use client"

import { useState, useEffect, useCallback } from "react"
import { salesService } from "../services/salesService"
import toast from "react-hot-toast"

export const useSales = (initialFilters = {}) => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const fetchSales = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await salesService.getSales(finalFilters)

        if (result.success) {
          setSales(result.data)
        } else {
          setError(result.message)
          toast.error(result.message)
        }
      } catch (error) {
        const message = "Error al cargar ventas"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  const getSaleById = async (id) => {
    setLoading(true)
    try {
      const result = await salesService.getSaleById(id)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const createSale = async (saleData) => {
    setLoading(true)
    try {
      const result = await salesService.createSale(saleData)

      if (result.success) {
        toast.success("Venta creada exitosamente")
        await fetchSales() // Recargar la lista
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const cancelSale = async (id, motivo = "") => {
    setLoading(true)
    try {
      const result = await salesService.cancelSale(id, motivo)

      if (result.success) {
        toast.success("Venta anulada exitosamente")
        await fetchSales() // Recargar la lista
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al anular venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const getSalesStats = async (customFilters = {}) => {
    setLoading(true)
    try {
      const finalFilters = { ...filters, ...customFilters }
      const result = await salesService.getSalesStats(finalFilters)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener estadísticas de ventas"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const getSalesByClient = async (clientId, limit = 20) => {
    setLoading(true)
    try {
      const result = await salesService.getSalesByClient(clientId, limit)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener ventas del cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Función para calcular estadísticas locales
  const getLocalStats = useCallback(() => {
    const stats = {
      total: sales.length,
      completadas: sales.filter(s => s.estado === 'completada').length,
      anuladas: sales.filter(s => s.estado === 'anulada').length,
      montoTotal: sales.filter(s => s.estado === 'completada').reduce((sum, s) => sum + parseFloat(s.total || 0), 0),
    }
    return stats
  }, [sales])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  return {
    sales,
    loading,
    error,
    filters,
    fetchSales,
    getSaleById,
    createSale,
    cancelSale,
    getSalesStats,
    getSalesByClient,
    updateFilters,
    clearFilters,
    getLocalStats,
    refetch: fetchSales,
  }
}

export default useSales