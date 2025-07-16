"use client"

import { useState, useCallback, useEffect } from "react"
import { presupuestosService } from "../services/presupuestosService"
import toast from "react-hot-toast"
import { extractExactDateTime } from "../lib/date-utils"

export const usePresupuestosReports = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [presupuestos, setPresupuestos] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    cliente: "",
    numeroPresupuesto: "",
    estado: "todos",
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

  // Obtener presupuestos con información de pagos y paginación
  const fetchPresupuestos = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        console.log("Fetching presupuestos with filters:", finalFilters)
        const result = await presupuestosService.getPresupuestos(finalFilters)

        if (result.success) {
          // Procesar cada presupuesto para obtener información de pagos y detalles completos
          const presupuestosWithDetails = await Promise.all(
            result.data.map(async (presupuesto) => {
              try {
                // Obtener detalles completos del presupuesto incluyendo pagos y detalles de productos
                const detailResult = await presupuestosService.getPresupuestoById(presupuesto.id)
                if (detailResult.success) {
                  return {
                    ...presupuesto,
                    pagos: detailResult.data.pagos || [],
                    detalles: detailResult.data.detalles || [],
                  }
                }
                return {
                  ...presupuesto,
                  pagos: [],
                  detalles: [],
                }
              } catch (error) {
                console.warn(`Error al obtener detalles de presupuesto ${presupuesto.id}:`, error)
                return {
                  ...presupuesto,
                  pagos: [],
                  detalles: [],
                }
              }
            }),
          )

          console.log("Presupuestos with details loaded:", presupuestosWithDetails.length)
          setPresupuestos(presupuestosWithDetails)
          if (result.pagination) {
            setPagination(result.pagination)
          }
          return { success: true, data: presupuestosWithDetails }
        } else {
          console.error("Error from presupuestosService:", result.message)
          setError(result.message)
          setPresupuestos([])
          toast.error(result.message)
          return { success: false, message: result.message }
        }
      } catch (error) {
        console.error("Error in fetchPresupuestos:", error)
        const message = "Error al cargar presupuestos"
        setError(message)
        setPresupuestos([])
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
    fetchPresupuestos()
  }, [filters, fetchPresupuestos])

  // Obtener estadísticas
  const fetchStats = useCallback(
    async (customFilters = {}) => {
      try {
        const finalFilters = { ...filters, ...customFilters }
        console.log("Fetching stats with filters:", finalFilters)
        const result = await presupuestosService.getPresupuestosStats(finalFilters)

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

  // Obtener un presupuesto por ID
  const getPresupuestoById = async (id) => {
    setLoading(true)
    try {
      console.log("Getting presupuesto by ID:", id)
      const result = await presupuestosService.getPresupuestoById(id)

      if (result.success) {
        console.log("Presupuesto details loaded:", result.data)
        return { success: true, data: result.data }
      } else {
        console.error("Error getting presupuesto:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error in getPresupuestoById:", error)
      const message = "Error al obtener presupuesto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Exportar presupuestos
  const exportPresupuestos = async (customFilters = {}) => {
    try {
      setLoading(true)
      const finalFilters = { ...filters, ...customFilters }
      console.log("Exporting presupuestos with filters:", finalFilters)

      const result = await presupuestosService.getPresupuestos(finalFilters)

      if (result.success) {
        // Crear CSV
        const headers = ["Presupuesto", "Fecha", "Cliente", "Total", "Estado", "Método de Pago"]
        const csvContent = [
          headers.join(","),
          ...result.data.map((presupuesto) => {
            const paymentMethod =
              presupuesto.pagos?.length > 1 ? "Varios métodos" : presupuesto.pagos?.[0]?.tipo_pago || "No especificado"

            return [
              presupuesto.numero_presupuesto,
              extractExactDateTime(presupuesto.fecha_creacion).date,
              `"${presupuesto.cliente_nombre || "Cliente no especificado"}"`,
              presupuesto.total,
              presupuesto.estado,
              paymentMethod,
            ].join(",")
          }),
        ].join("\n")

        // Descargar archivo
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `presupuestos_${new Date().toISOString().split("T")[0]}.csv`)
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
      console.error("Error in exportPresupuestos:", error)
      const message = "Error al exportar reporte"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Función para anular un presupuesto
  const cancelPresupuesto = async (id, motivo) => {
    setLoading(true)
    try {
      console.log("Cancelling presupuesto with ID:", id, "Motivo:", motivo)
      const result = await presupuestosService.cancelPresupuesto(id, motivo)

      if (result.success) {
        toast.success(result.message || "Presupuesto anulado exitosamente")
        // Refrescar la lista de presupuestos y estadísticas después de la anulación
        await fetchPresupuestos({ offset: 0 })
        await fetchStats()
        return { success: true, data: result.data }
      } else {
        console.error("Error cancelling presupuesto:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error in cancelPresupuesto hook:", error)
      const message = error.message || "Error al anular presupuesto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    presupuestos,
    stats,
    pagination,
    fetchPresupuestos,
    fetchStats,
    getPresupuestoById,
    exportPresupuestos,
    cancelPresupuesto,
    updateFilters,
    handlePageChange,
    refetch: fetchPresupuestos,
  }
}

export default usePresupuestosReports
