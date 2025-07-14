"use client"

import { useState, useEffect, useCallback } from "react"
import { cashClosingService } from "../services/cashClosingService"
import toast from "react-hot-toast"

export const useCashClosing = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pendingClosingData, setPendingClosingData] = useState(null)
  const [cashClosings, setCashClosings] = useState([])
  const [selectedClosing, setSelectedClosing] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuarioId: "",
    tipoCierre: "",
  })

  // Estados para el rango de fecha y hora del cierre actual
  const today = new Date().toISOString().split("T")[0]
  const defaultStartTime = "07:00"
  const defaultEndTime = "22:00"

  const [currentClosingRange, setCurrentClosingRange] = useState({
    startDate: today,
    startTime: defaultStartTime,
    endDate: today,
    endTime: defaultEndTime,
  })

  // Estado para el tipo de cierre actual
  const [currentClosingType, setCurrentClosingType] = useState("full") // 'ventas_only' o 'full'

  // Función para obtener datos pendientes - ahora acepta parámetros directamente
  const fetchPendingCashClosingData = useCallback(async (startDate, startTime, endDate, endTime, closingType) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cashClosingService.getPendingCashClosingData(
        startDate,
        startTime,
        endDate,
        endTime,
        closingType,
      )
      if (result.success) {
        setPendingClosingData(result.data)
        if (result.message) {
          toast.success(result.message)
        } else {
          toast.success("Datos de cierre de caja actualizados.")
        }
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      setError("Error al cargar los datos para el cierre de caja.")
      toast.error("Error al cargar los datos para el cierre de caja.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para obtener historial de cierres
  const fetchCashClosings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await cashClosingService.getCashClosings(filters)
      if (result.success) {
        setCashClosings(result.data)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      setError("Error al cargar el historial de cierres de caja.")
      toast.error("Error al cargar el historial de cierres de caja.")
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Función para realizar cierre de caja
  const performCashClosing = useCallback(
    async (closingData) => {
      setLoading(true)
      setError(null)
      try {
        const result = await cashClosingService.createCashClosing({
          ...closingData,
          tipoCierre: currentClosingType,
        })
        if (result.success) {
          toast.success(result.message)
          fetchCashClosings() // Recargar historial
          return true
        } else {
          setError(result.message)
          toast.error(result.message)
          return false
        }
      } catch (err) {
        setError("Error al realizar el cierre de caja.")
        toast.error("Error al realizar el cierre de caja.")
        return false
      } finally {
        setLoading(false)
      }
    },
    [currentClosingType, fetchCashClosings],
  )

  // Función para obtener detalles de un cierre específico
  const getCashClosingDetails = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const result = await cashClosingService.getCashClosingById(id)
      if (result.success) {
        setSelectedClosing(result.data)
        return { success: true, data: result.data }
      } else {
        setError(result.message)
        toast.error(result.message)
        return { success: false }
      }
    } catch (err) {
      setError("Error al obtener los detalles del cierre de caja.")
      toast.error("Error al obtener los detalles del cierre de caja.")
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      fechaInicio: "",
      fechaFin: "",
      usuarioId: "",
      tipoCierre: "",
    })
    toast.success("Filtros limpiados.")
  }, [])

  // Efecto para cargar el historial al montar y cuando cambian los filtros
  useEffect(() => {
    fetchCashClosings()
  }, [fetchCashClosings])

  return {
    loading,
    error,
    pendingClosingData,
    cashClosings,
    selectedClosing,
    filters,
    currentClosingRange,
    setCurrentClosingRange,
    currentClosingType,
    setCurrentClosingType,
    fetchPendingCashClosingData,
    performCashClosing,
    fetchCashClosings,
    getCashClosingDetails,
    updateFilters,
    clearFilters,
    formatCurrency: cashClosingService.formatCurrency,
    formatDate: cashClosingService.formatDate,
    formatDateTime: cashClosingService.formatDateTime,
    getPaymentMethodLabel: cashClosingService.getPaymentMethodLabel,
    getMovementTypeLabel: cashClosingService.getMovementTypeLabel,
    getClosingTypeLabel: cashClosingService.getClosingTypeLabel,
    setSelectedClosing,
  }
}
