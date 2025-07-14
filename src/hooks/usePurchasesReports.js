"use client"

import { useState, useCallback, useEffect } from "react"
import { apiClient } from "../config/api"
import toast from "react-hot-toast"

export const usePurchasesReports = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [purchases, setPurchases] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    proveedor: "",
    numeroCompra: "",
    estado: "todos",
    tipoPago: "todos",
    limit: 10,
    offset: 0,
    ...initialFilters,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  // Obtener compras con información de pagos y paginación
  const fetchPurchases = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const params = new URLSearchParams()

        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "" && value !== "todos") {
            params.append(key, value)
          }
        })

        const url = `/purchases/reports?${params}`
        console.log("Fetching purchases from:", url) // DEBUG

        const response = await apiClient.get(url)

        if (response.data.success) {
          // Procesar cada compra para obtener información de pagos
          const purchasesWithPayments = response.data.data.map((purchase) => ({
            ...purchase,
            pagos: purchase.pagos || [],
            detalles: purchase.detalles || [],
          }))

          setPurchases(purchasesWithPayments)
          if (response.data.pagination) {
            setPagination(response.data.pagination)
          }
          return { success: true, data: purchasesWithPayments }
        } else {
          setError(response.data.message || "Error al cargar compras")
          setPurchases([])
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error("Error fetching purchases:", error)
        const errorMessage = error.response?.data?.message || "Error de conexión con el servidor"
        setError(errorMessage)
        setPurchases([])
        toast.error(errorMessage)
        return { success: false, message: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const handlePageChange = useCallback(
    (page) => {
      const newOffset = (page - 1) * filters.limit
      updateFilters({ offset: newOffset })
    },
    [filters.limit, updateFilters],
  )

  useEffect(() => {
    fetchPurchases()
  }, [filters, fetchPurchases])

  // Obtener estadísticas
  const fetchStats = useCallback(
    async (customFilters = {}) => {
      try {
        const finalFilters = { ...filters, ...customFilters }
        const params = new URLSearchParams()

        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value && value !== "todos") {
            // Solo incluir fechas para estadísticas
            if (key === "fechaInicio" || key === "fechaFin") {
              params.append(key, value)
            }
          }
        })

        const url = `/purchases/stats?${params}`
        console.log("Fetching stats from:", url) // DEBUG

        const response = await apiClient.get(url)

        if (response.data.success) {
          setStats(response.data.data)
          return { success: true, data: response.data.data }
        } else {
          console.error("Error fetching stats:", response.data.message)
          return { success: false, message: response.data.message }
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
        const errorMessage = error.response?.data?.message || "Error al obtener estadísticas"
        toast.error(errorMessage)
        return { success: false, message: errorMessage }
      }
    },
    [filters],
  )

  const getPurchaseById = async (purchaseId) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/purchases/${purchaseId}`)

      if (response.data.success) {
        return { success: true, data: response.data.data }
      } else {
        toast.error(response.data.message)
        return { success: false, message: response.data.message }
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error)
      const message = error.response?.data?.message || "Error al cargar detalles"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const receivePurchaseItems = async (purchaseId, receiveData) => {
    try {
      const response = await apiClient.post(`/purchases/${purchaseId}/receive`, receiveData)

      if (response.data.success) {
        // Actualizar la lista de compras
        setPurchases((prev) =>
          prev.map((purchase) =>
            purchase.id === purchaseId ? { ...purchase, estado: response.data.data.estado } : purchase,
          ),
        )
        toast.success("Productos recibidos exitosamente")
        // Refrescar datos después de recibir productos
        await fetchPurchases({ offset: 0 })
      }

      return response.data
    } catch (error) {
      console.error("Error receiving purchase items:", error)
      const message = error.response?.data?.message || "Error al recibir productos"
      toast.error(message)
      return { success: false, message }
    }
  }

  const exportPurchases = async (customFilters = {}) => {
    try {
      const finalFilters = { ...filters, ...customFilters }
      const params = new URLSearchParams()

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases/export?${params}`)

      if (response.data.success) {
        toast.success(response.data.message || "Función de exportación en desarrollo")
      } else {
        toast.error(response.data.message || "Error al exportar reporte")
      }
    } catch (error) {
      console.error("Error exporting purchases:", error)
      toast.error("Error al exportar reporte")
    }
  }

  return {
    purchases,
    stats,
    loading,
    error,
    pagination,
    fetchPurchases,
    fetchStats,
    getPurchaseById,
    receivePurchaseItems,
    exportPurchases,
    updateFilters,
    handlePageChange,
    refetch: fetchPurchases,
  }
}
