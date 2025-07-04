"use client"

import { useState, useCallback } from "react"
import { salesService } from "../services/salesService"
import toast from "react-hot-toast"
import { extractExactDateTime } from "../lib/date-utils"

export const useSalesReports = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState(null)

  // CORREGIDO: Obtener ventas con información de pagos
  const fetchSales = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await salesService.getSales(filters)

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
              return sale
            } catch (error) {
              console.warn(`Error al obtener detalles de venta ${sale.id}:`, error)
              return sale
            }
          }),
        )

        setSales(salesWithPayments)
        return { success: true, data: salesWithPayments }
      } else {
        setError(result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al cargar ventas"
      setError(message)
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener estadísticas
  const fetchStats = useCallback(async (filters = {}) => {
    try {
      const result = await salesService.getSalesStats(filters)

      if (result.success) {
        setStats(result.data.estadisticas_generales)
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener estadísticas"
      toast.error(message)
      return { success: false, message }
    }
  }, [])

  // Obtener una venta por ID
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

  // Exportar ventas
  const exportSales = async (filters = {}) => {
    try {
      setLoading(true)

      // Simular exportación (aquí puedes implementar la lógica real)
      const result = await salesService.getSales(filters)

      if (result.success) {
        // Crear CSV
        const headers = ["Factura", "Fecha", "Cliente", "Total", "Estado", "Método de Pago"]
        const csvContent = [
          headers.join(","),
          ...result.data.map((sale) =>
            [
              sale.numero_factura,
              extractExactDateTime(sale.fecha_creacion).date,
              `"${sale.cliente_nombre || "Cliente no especificado"}"`,
              sale.total,
              sale.estado,
              sale.pagos?.length > 1 ? "Varios métodos" : sale.pagos?.[0]?.tipo_pago || "No especificado",
            ].join(","),
          ),
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
      const message = "Error al exportar reporte"
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
    fetchSales,
    fetchStats,
    getSaleById,
    exportSales,
  }
}

export default useSalesReports
