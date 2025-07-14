"use client"

import { useState, useCallback, useEffect } from "react"
import { cuentaCorrienteService } from "../services/cuentaCorrienteService"
import toast from "react-hot-toast"

export const useCuentaCorriente = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados integrados de filtros y paginación con límite más pequeño por defecto
  const [filters, setFilters] = useState({
    cliente: "",
    fechaInicio: "",
    fechaFin: "",
    tipoPago: "",
    estado: "activo",
    conSaldo: "todos",
    limit: 10, // Cambiado de 50 a 10 por defecto
    offset: 0,
    ...initialFilters,
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialFilters.limit || 10, // Usar el límite inicial o 10 por defecto
  })

  // Estados para diferentes tipos de datos
  const [resumen, setResumen] = useState(null)
  const [pagos, setPagos] = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)

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

  // Obtener resumen de cuentas corrientes CON PAGINACIÓN
  const fetchResumen = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = {
          ...filters,
          ...customFilters,
        }

        console.log("Hook: Fetching resumen with filters:", finalFilters) // Para debug

        const result = await cuentaCorrienteService.getResumen(finalFilters)

        if (result.success) {
          setResumen(result.data)

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
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar resumen de cuenta corriente"
        setError(message)
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

  // Obtener pagos CON PAGINACIÓN
  const fetchPagos = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = {
          ...filters,
          ...customFilters,
        }

        const result = await cuentaCorrienteService.getPagos(finalFilters)

        if (result.success) {
          setPagos(result.data)

          // Actualizar información de paginación si está disponible
          if (result.pagination) {
            setPagination((prev) => ({
              ...prev,
              ...result.pagination,
            }))
          }

          return { success: true, data: result.data }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar pagos"
        setError(message)
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
      fetchResumen({ silent: true })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  // Registrar un pago
  const registrarPago = async (pagoData) => {
    setLoading(true)
    try {
      const result = await cuentaCorrienteService.registrarPago(pagoData)

      if (result.success) {
        toast.success(result.message || "Pago registrado exitosamente")
        await fetchResumen({ silent: true })
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al registrar pago"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Anular un pago
  const anularPago = async (id, motivo) => {
    if (!motivo || motivo.trim().length === 0) {
      toast.error("El motivo de anulación es obligatorio")
      return { success: false, message: "El motivo de anulación es obligatorio" }
    }

    setLoading(true)
    try {
      const result = await cuentaCorrienteService.anularPago(id, motivo.trim())

      if (result.success) {
        toast.success(result.message || "Pago anulado exitosamente")
        await Promise.all([fetchPagos({ silent: true }), fetchResumen({ silent: true })])
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al anular pago"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener pagos de un cliente específico CON PAGINACIÓN
  const getPagosByClient = async (clientId, customFilters = {}) => {
    if (!clientId || clientId < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const finalFilters = {
        ...customFilters,
        limit: filters.limit,
        offset: filters.offset,
      }

      const result = await cuentaCorrienteService.getPagosByClient(clientId, finalFilters)

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
      const message = "Error al obtener pagos del cliente"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener movimientos de un cliente específico CON PAGINACIÓN
  const getMovimientosByClient = async (clientId, customFilters = {}) => {
    if (!clientId || clientId < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await cuentaCorrienteService.getMovimientosByClient(clientId, customFilters)

      if (result.success) {
        setMovimientos(result.data.movimientos || [])
        setClienteSeleccionado(result.data.cliente)

        return { success: true, data: result.data, pagination: result.pagination }
      } else {
        if (!customFilters.silent) {
          toast.error(result.message)
        }
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener movimientos del cliente"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Crear ajuste manual
  const crearAjuste = async (ajusteData) => {
    setLoading(true)
    try {
      const result = await cuentaCorrienteService.crearAjuste(ajusteData)

      if (result.success) {
        toast.success(result.message || "Ajuste registrado exitosamente")
        await fetchResumen({ silent: true })
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al crear ajuste"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas
  const fetchEstadisticas = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await cuentaCorrienteService.getEstadisticas(finalFilters)

        if (result.success) {
          setEstadisticas(result.data)
          return { success: true, data: result.data }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas"
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

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      cliente: "",
      fechaInicio: "",
      fechaFin: "",
      tipoPago: "",
      estado: "activo",
      conSaldo: "todos",
      limit: 10, // Mantener límite pequeño
      offset: 0,
    })
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    })
  }, [])

  // Calcular estadísticas locales del resumen
  const getLocalStats = useCallback(() => {
    if (!resumen) return null

    return {
      totalCuentas: resumen.resumen?.total_cuentas || 0,
      cuentasConSaldo: resumen.resumen?.cuentas_con_saldo || 0,
      saldoTotal: resumen.resumen?.saldo_total || 0,
      saldoPromedio: resumen.resumen?.saldo_promedio || 0,
      limiteTotal: resumen.resumen?.limite_total || 0,
      pagosMesActual: resumen.resumen?.pagos_mes_actual || { total_pagos: 0, monto_total_pagos: 0 },
      ventasMesActual: resumen.resumen?.ventas_mes_actual || { total_ventas_cc: 0, monto_total_ventas_cc: 0 },
    }
  }, [resumen])

  // Formatear moneda
  const formatCurrency = useCallback((amount) => {
    return cuentaCorrienteService.formatCurrency(amount)
  }, [])

  // Formatear fecha
  const formatDate = useCallback((date) => {
    return cuentaCorrienteService.formatDate(date)
  }, [])

  // Formatear fecha y hora
  const formatDateTime = useCallback((date) => {
    return cuentaCorrienteService.formatDateTime(date)
  }, [])

  // Obtener tipos de pago disponibles
  const getPaymentTypes = useCallback(() => {
    return cuentaCorrienteService.getPaymentTypes()
  }, [])

  // Obtener tipos de ajuste disponibles
  const getAdjustmentTypes = useCallback(() => {
    return cuentaCorrienteService.getAdjustmentTypes()
  }, [])

  return {
    // Estados
    loading,
    error,
    filters,
    pagination,
    resumen,
    pagos,
    estadisticas,
    movimientos,
    clienteSeleccionado,

    // Funciones principales
    fetchResumen,
    fetchPagos,
    fetchEstadisticas,
    registrarPago,
    anularPago,
    getPagosByClient,
    getMovimientosByClient,
    crearAjuste,

    // Funciones de paginación
    updateFilters,
    handlePageChange,
    clearFilters,

    // Utilidades
    getLocalStats,
    formatCurrency,
    formatDate,
    formatDateTime,
    getPaymentTypes,
    getAdjustmentTypes,

    // Aliases para compatibilidad
    refetch: fetchResumen,
  }
}

export default useCuentaCorriente
