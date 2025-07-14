"use client"

import { useState, useCallback } from "react"
import { dashboardService } from "../services/dashboardService"
import toast from "react-hot-toast"

export const useDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentSales, setRecentSales] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await dashboardService.getDashboardData()

      if (result.success) {
        setStats(result.data.stats)
        setRecentSales(result.data.recentSales)
        setLowStockProducts(result.data.lowStockProducts)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar datos del dashboard"
      setError(message)
      toast.error(message)
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const result = await dashboardService.getStats()
      if (result.success) {
        setStats(result.data)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Error al cargar estadísticas")
      console.error("Stats error:", error)
    }
  }, [])

  const fetchQuickSummary = useCallback(async () => {
    try {
      const result = await dashboardService.getQuickSummary()
      if (result.success) {
        return result.data
      } else {
        toast.error(result.message)
        return null
      }
    } catch (error) {
      toast.error("Error al cargar resumen rápido")
      console.error("Quick summary error:", error)
      return null
    }
  }, [])

  const fetchTopProducts = useCallback(async (days = 30, limit = 10) => {
    try {
      const result = await dashboardService.getTopProducts(days, limit)
      if (result.success) {
        return result.data
      } else {
        toast.error(result.message)
        return []
      }
    } catch (error) {
      toast.error("Error al cargar productos más vendidos")
      console.error("Top products error:", error)
      return []
    }
  }, [])

  const fetchSystemAlerts = useCallback(async () => {
    try {
      const result = await dashboardService.getSystemAlerts()
      if (result.success) {
        return result.data
      } else {
        toast.error(result.message)
        return []
      }
    } catch (error) {
      toast.error("Error al cargar alertas del sistema")
      console.error("System alerts error:", error)
      return []
    }
  }, [])

  return {
    stats,
    recentSales,
    lowStockProducts,
    loading,
    error,
    fetchDashboardData,
    fetchStats,
    fetchQuickSummary,
    fetchTopProducts,
    fetchSystemAlerts,
  }
}
