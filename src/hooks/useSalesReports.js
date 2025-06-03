"use client"

import { useState, useCallback } from "react"
import { salesService } from "../services/salesService"
import toast from "react-hot-toast"

export const useSalesReports = () => {
  const [sales, setSales] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSales = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await salesService.getSales(filters)

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
  }, [])

  const fetchStats = useCallback(async (filters = {}) => {
    try {
      const result = await salesService.getSalesStats(filters)

      if (result.success) {
        setStats(result.data)
      } else {
        console.error("Error al obtener estadísticas:", result.message)
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
    }
  }, [])

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
      const message = "Error al obtener detalles de la venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const exportSales = async (filters = {}) => {
    setLoading(true)
    try {
      const result = await salesService.getSales(filters)

      if (result.success) {
        // Convertir datos a CSV
        const csvData = convertToCSV(result.data)
        downloadCSV(csvData, `reporte-ventas-${new Date().toISOString().split("T")[0]}.csv`)
        toast.success("Reporte exportado exitosamente")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Error al exportar reporte")
    } finally {
      setLoading(false)
    }
  }

  const convertToCSV = (data) => {
    if (!data.length) return ""

    const headers = [
      "Número Factura",
      "Fecha",
      "Cliente",
      "Subtotal",
      "Descuento",
      "Total",
      "Tipo Pago",
      "Estado",
      "Usuario",
      "Items",
    ]

    const rows = data.map((sale) => [
      sale.numero_factura,
      sale.fecha_venta,
      sale.cliente_nombre,
      sale.subtotal,
      sale.descuento,
      sale.total,
      sale.tipo_pago,
      sale.estado,
      sale.usuario_nombre,
      sale.total_items,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    return csvContent
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return {
    sales,
    stats,
    loading,
    error,
    fetchSales,
    fetchStats,
    getSaleById,
    exportSales,
  }
}

export default useSalesReports
