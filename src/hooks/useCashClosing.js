"use client"

import { useState, useCallback } from "react"
import { cashClosingService } from "../services/cashClosingService"
import toast from "react-hot-toast"

export const useCashClosing = () => {
  const [closings, setClosings] = useState([])
  const [dailySummary, setDailySummary] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener resumen diario de ventas
  const fetchDailySummary = useCallback(async (fecha = null) => {
    setLoading(true)
    setError(null)

    try {
      const result = await cashClosingService.getDailySummary(fecha)

      if (result.success) {
        setDailySummary(result.data)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar resumen diario"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear un nuevo cierre de caja
  const createClosing = async (closingData) => {
    setLoading(true)
    try {
      const result = await cashClosingService.createClosing(closingData)

      if (result.success) {
        toast.success("Cierre de caja creado exitosamente")
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al crear cierre de caja"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener todos los cierres con filtros
  const fetchClosings = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await cashClosingService.getClosings(filters)

      if (result.success) {
        setClosings(result.data)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (error) {
      const message = "Error al cargar cierres de caja"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener un cierre por ID
  const getClosingById = async (id) => {
    setLoading(true)
    try {
      const result = await cashClosingService.getClosingById(id)

      if (result.success) {
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener detalles del cierre"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas
  const fetchStats = useCallback(async (filters = {}) => {
    try {
      const result = await cashClosingService.getStats(filters)

      if (result.success) {
        setStats(result.data)
      } else {
        console.error("Error al obtener estadísticas:", result.message)
      }
    } catch (error) {
      console.error("Error al obtener estadísticas:", error)
    }
  }, [])

  return {
    closings,
    dailySummary,
    stats,
    loading,
    error,
    fetchDailySummary,
    createClosing,
    fetchClosings,
    getClosingById,
    fetchStats,
    refetch: fetchClosings,
  }
}

export default useCashClosing
