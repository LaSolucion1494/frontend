"use client"

import { useState, useCallback, useEffect } from "react"
import { salesService } from "../services/salesService"
import toast from "react-hot-toast"
import { extractExactDateTime } from "../lib/date-utils"

export const useSalesReports = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    cliente: "",
    numeroFactura: "",
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

  // Obtener ventas con información de pagos y paginación
  const fetchSales = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        console.log("Fetching sales with filters:", finalFilters)
        const result = await salesService.getSales(finalFilters)

        if (result.success) {
          // Procesar cada venta para obtener información de pagos
          const salesWithPayments = await Promise.all(
            result.data.map(async (sale) => {
              try {
                // Obtener detalles completos de la venta incluyendo pagos
                const detailResult = await salesService.getSaleById(sale.id)
                if (detailResult.success) {
                  return {
                    ...sale,
                    pagos: detailResult.data.pagos || [],
                    detalles: detailResult.data.detalles || [],
                  }
                }
                return {
                  ...sale,
                  pagos: [],
                  detalles: [],
                }
              } catch (error) {
                console.warn(`Error al obtener detalles de venta ${sale.id}:`, error)
                return {
                  ...sale,
                  pagos: [],
                  detalles: [],
                }
              }
            }),
          )

          console.log("Sales with payments loaded:", salesWithPayments.length)
          setSales(salesWithPayments)
          if (result.pagination) {
            setPagination(result.pagination)
          }
          return { success: true, data: salesWithPayments }
        } else {
          console.error("Error from salesService:", result.message)
          setError(result.message)
          setSales([])
          toast.error(result.message)
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error("Error in fetchSales:", error)
        const message = "Error al cargar ventas"
        setError(message)
        setSales([])
        toast.error(message)
        return { success: false, message }
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
    fetchSales()
  }, [filters, fetchSales])

  // Obtener estadísticas
  const fetchStats = useCallback(
    async (customFilters = {}) => {
      try {
        const finalFilters = { ...filters, ...customFilters }
        console.log("Fetching stats with filters:", finalFilters)
        const result = await salesService.getSalesStats(finalFilters)

        if (result.success) {
          console.log("Stats loaded:", result.data)
          setStats(result.data)
          return { success: true, data: result.data }
        } else {
          console.error("Error fetching stats:", result.message)
          toast.error(result.message)
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error("Error in fetchStats:", error)
        const message = "Error al obtener estadísticas"
        toast.error(message)
        return { success: false, message }
      }
    },
    [filters],
  )

  // Obtener una venta por ID
  const getSaleById = async (id) => {
    setLoading(true)
    try {
      console.log("Getting sale by ID:", id)
      const result = await salesService.getSaleById(id)

      if (result.success) {
        console.log("Sale details loaded:", result.data)
        return { success: true, data: result.data }
      } else {
        console.error("Error getting sale:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error in getSaleById:", error)
      const message = "Error al obtener venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Exportar ventas
  const exportSales = async (customFilters = {}) => {
    try {
      setLoading(true)
      const finalFilters = { ...filters, ...customFilters }
      console.log("Exporting sales with filters:", finalFilters)

      const result = await salesService.getSales(finalFilters)

      if (result.success) {
        // Crear CSV
        const headers = ["Factura", "Fecha", "Cliente", "Total", "Estado", "Método de Pago"]
        const csvContent = [
          headers.join(","),
          ...result.data.map((sale) => {
            const paymentMethod =
              sale.pagos?.length > 1 ? "Varios métodos" : sale.pagos?.[0]?.tipo_pago || "No especificado"

            return [
              sale.numero_factura,
              extractExactDateTime(sale.fecha_creacion).date,
              `"${sale.cliente_nombre || "Cliente no especificado"}"`,
              sale.total,
              sale.estado,
              paymentMethod,
            ].join(",")
          }),
        ].join("\n")

        // Descargar archivo
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `ventas_${new Date().toISOString().split("T")[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Reporte exportado exitosamente")
        return { success: true }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error in exportSales:", error)
      const message = "Error al exportar reporte"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para anular una venta
  const cancelSale = async (id, motivo) => {
    setLoading(true)
    try {
      console.log("Cancelling sale with ID:", id, "Motivo:", motivo)
      const result = await salesService.cancelSale(id, motivo)

      if (result.success) {
        toast.success(result.message || "Venta anulada exitosamente")
        // Refrescar la lista de ventas y estadísticas después de la anulación
        await fetchSales({ offset: 0 })
        await fetchStats()
        return { success: true, data: result.data }
      } else {
        console.error("Error cancelling sale:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error in cancelSale hook:", error)
      const message = error.message || "Error al anular venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    sales,
    stats,
    pagination,
    fetchSales,
    fetchStats,
    getSaleById,
    exportSales,
    cancelSale,
    updateFilters,
    handlePageChange,
    refetch: fetchSales,
  }
}

export default useSalesReports
