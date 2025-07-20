"use client"

import { useState, useCallback, useEffect } from "react"
import { cotizacionesService } from "../services/cotizacionesService"
import toast from "react-hot-toast"

export const useCotizaciones = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    cliente: "",
    estado: "todos",
    limit: 50,
    offset: 0,
    ...initialFilters,
  })

  // Estados para diferentes tipos de datos
  const [cotizaciones, setCotizaciones] = useState([])
  const [selectedCotizacion, setSelectedCotizacion] = useState(null)
  const [cotizacionesStats, setCotizacionesStats] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })

  // Estados para el proceso de creación de cotización
  const [cotizacionInProgress, setCotizacionInProgress] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Obtener todas las cotizaciones
  const fetchCotizaciones = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await cotizacionesService.getCotizaciones(finalFilters)

        if (result.success) {
          const formattedCotizaciones = result.data.map((cotizacion) => ({
            ...cotizacion,
            subtotal_formatted: cotizacionesService.formatCurrency(cotizacion.subtotal),
            descuento_formatted: cotizacionesService.formatCurrency(cotizacion.descuento),
            interes_formatted: cotizacionesService.formatCurrency(cotizacion.interes),
            total_formatted: cotizacionesService.formatCurrency(cotizacion.total),
            fecha_cotizacion_formatted: cotizacionesService.formatDate(cotizacion.fecha_cotizacion),
            fecha_vencimiento_formatted: cotizacion.fecha_vencimiento
              ? cotizacionesService.formatDate(cotizacion.fecha_vencimiento)
              : null,
            fecha_creacion_formatted: cotizacionesService.formatDate(cotizacion.fecha_creacion),
            hora_creacion_formatted: new Date(cotizacion.fecha_creacion).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            estado_formatted: cotizacionesService.getEstadoCotizacion(cotizacion.estado),
            is_vencida: cotizacionesService.isCotizacionVencida(cotizacion.fecha_vencimiento),
            dias_restantes: cotizacionesService.getDiasRestantes(cotizacion.fecha_vencimiento),
          }))

          setCotizaciones(formattedCotizaciones)

          if (result.pagination) {
            setPagination(result.pagination)
          }

          return { success: true, data: formattedCotizaciones }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar cotizaciones"
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

  // Obtener una cotización por ID
  const getCotizacionById = async (id) => {
    const cotizacionId = Number.parseInt(id)
    if (!id || isNaN(cotizacionId) || cotizacionId < 1) {
      console.error("ID de cotización inválido:", id)
      toast.error("ID de cotización inválido")
      return { success: false, message: "ID de cotización inválido" }
    }

    setLoading(true)
    try {
      const result = await cotizacionesService.getCotizacionById(cotizacionId)

      if (result.success) {
        const formattedCotizacion = {
          ...result.data,
          subtotal_formatted: cotizacionesService.formatCurrency(result.data.subtotal),
          descuento_formatted: cotizacionesService.formatCurrency(result.data.descuento),
          interes_formatted: cotizacionesService.formatCurrency(result.data.interes),
          total_formatted: cotizacionesService.formatCurrency(result.data.total),
          fecha_cotizacion_formatted: cotizacionesService.formatDate(result.data.fecha_cotizacion),
          fecha_vencimiento_formatted: result.data.fecha_vencimiento
            ? cotizacionesService.formatDate(result.data.fecha_vencimiento)
            : null,
          hora_cotizacion_formatted: new Date(result.data.fecha_cotizacion).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          estado_formatted: cotizacionesService.getEstadoCotizacion(result.data.estado),
          is_vencida: cotizacionesService.isCotizacionVencida(result.data.fecha_vencimiento),
          dias_restantes: cotizacionesService.getDiasRestantes(result.data.fecha_vencimiento),

          detalles:
            result.data.detalles?.map((detalle) => ({
              ...detalle,
              precio_unitario_formatted: cotizacionesService.formatCurrency(detalle.precio_unitario),
              subtotal_formatted: cotizacionesService.formatCurrency(detalle.subtotal),
            })) || [],
        }

        setSelectedCotizacion(formattedCotizacion)

        return { success: true, data: formattedCotizacion }
      } else {
        console.error("Error al obtener cotización:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error en getCotizacionById:", error)
      const message = "Error al obtener cotización"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Crear una nueva cotización
  const createCotizacion = async (cotizacionData) => {
    setLoading(true)
    setValidationErrors([])

    try {
      // Validar datos de cotización
      const validation = validateCotizacionData(cotizacionData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0], errors: validation.errors }
      }

      setCotizacionInProgress(cotizacionData)

      const result = await cotizacionesService.createCotizacion(cotizacionData)

      if (result.success) {
        const cotizacionId = result.data?.data?.id || result.data?.id
        if (!cotizacionId) {
          console.error("No se recibió ID de cotización válido:", result.data)
          toast.error("Error: No se pudo obtener el ID de la cotización creada")
          return { success: false, message: "Error: No se pudo obtener el ID de la cotización creada" }
        }

        toast.success(result.message || "Cotización creada exitosamente")

        setCotizacionInProgress(null)
        setValidationErrors([])

        // Recargar datos
        Promise.all([
          fetchCotizaciones({ silent: true }),
          cotizacionesStats ? fetchCotizacionesStats({ silent: true }) : Promise.resolve(),
        ]).catch((error) => {
          console.warn("Error al recargar datos después de crear cotización:", error)
        })

        return {
          success: true,
          data: {
            ...result.data,
            id: cotizacionId,
          },
          message: result.message,
        }
      } else {
        console.error("Error al crear cotización:", result.message)
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
          errors: result.errors || [],
        }
      }
    } catch (error) {
      console.error("Error en createCotizacion:", error)
      const message = error.message || "Error al crear cotización"
      toast.error(message)
      setValidationErrors([message])
      return {
        success: false,
        message,
        errors: [message],
      }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar cotización
  const updateCotizacion = async (id, updateData) => {
    setLoading(true)
    try {
      const result = await cotizacionesService.updateCotizacion(id, updateData)

      if (result.success) {
        toast.success(result.message || "Cotización actualizada exitosamente")

        await Promise.all([
          fetchCotizaciones({ silent: true }),
          cotizacionesStats ? fetchCotizacionesStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedCotizacion && selectedCotizacion.id === id) {
          await getCotizacionById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al actualizar cotización"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado de cotización
  const updateCotizacionStatus = async (id, estado, motivo = "") => {
    setLoading(true)
    try {
      const result = await cotizacionesService.updateCotizacionStatus(id, estado, motivo)

      if (result.success) {
        toast.success(result.message || "Estado actualizado exitosamente")

        await Promise.all([
          fetchCotizaciones({ silent: true }),
          cotizacionesStats ? fetchCotizacionesStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedCotizacion && selectedCotizacion.id === id) {
          await getCotizacionById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al actualizar estado"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Anular cotización
  const cancelCotizacion = async (id, motivo) => {
    if (!motivo || motivo.trim().length === 0) {
      toast.error("El motivo de anulación es obligatorio")
      return { success: false, message: "El motivo de anulación es obligatorio" }
    }

    setLoading(true)
    try {
      const result = await cotizacionesService.cancelCotizacion(id, motivo.trim())

      if (result.success) {
        toast.success(result.message || "Cotización anulada exitosamente")

        await Promise.all([
          fetchCotizaciones({ silent: true }),
          cotizacionesStats ? fetchCotizacionesStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedCotizacion && selectedCotizacion.id === id) {
          await getCotizacionById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al anular cotización"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Convertir cotización a presupuesto
  const convertToPresupuesto = async (id) => {
    setLoading(true)
    try {
      const result = await cotizacionesService.convertToPresupuesto(id)

      if (result.success) {
        toast.success(result.message || "Cotización convertida a presupuesto exitosamente")

        await Promise.all([
          fetchCotizaciones({ silent: true }),
          cotizacionesStats ? fetchCotizacionesStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedCotizacion && selectedCotizacion.id === id) {
          await getCotizacionById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al convertir cotización"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas de cotizaciones
  const fetchCotizacionesStats = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await cotizacionesService.getCotizacionesStats(finalFilters)

        if (result.success) {
          const formattedStats = {
            ...result.data,
            estadisticas_generales: {
              ...result.data.estadisticas_generales,
              total_cotizado_formatted: cotizacionesService.formatCurrency(
                result.data.estadisticas_generales?.total_cotizado || 0,
              ),
              promedio_cotizacion_formatted: cotizacionesService.formatCurrency(
                result.data.estadisticas_generales?.promedio_cotizacion || 0,
              ),
              total_aceptado_formatted: cotizacionesService.formatCurrency(
                result.data.estadisticas_generales?.total_aceptado || 0,
              ),
              porcentaje_aceptacion:
                result.data.estadisticas_generales?.total_cotizaciones > 0
                  ? (
                      (result.data.estadisticas_generales?.cotizaciones_aceptadas /
                        result.data.estadisticas_generales?.total_cotizaciones) *
                      100
                    ).toFixed(1)
                  : "0.0",
            },

            cotizaciones_por_dia:
              result.data.cotizaciones_por_dia?.map((item) => ({
                ...item,
                total_dia_formatted: cotizacionesService.formatCurrency(item.total_dia),
              })) || [],

            top_clientes:
              result.data.top_clientes?.map((cliente) => ({
                ...cliente,
                total_cotizado_formatted: cotizacionesService.formatCurrency(cliente.total_cotizado),
                total_aceptado_formatted: cotizacionesService.formatCurrency(cliente.total_aceptado),
              })) || [],

            estados_cotizaciones:
              result.data.estados_cotizaciones?.map((estado) => ({
                ...estado,
                total_monto_formatted: cotizacionesService.formatCurrency(estado.total_monto),
                porcentaje_cantidad:
                  result.data.estadisticas_generales?.total_cotizaciones > 0
                    ? ((estado.cantidad / result.data.estadisticas_generales?.total_cotizaciones) * 100).toFixed(1)
                    : "0.0",
              })) || [],
          }

          setCotizacionesStats(formattedStats)
          return { success: true, data: formattedStats }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas de cotizaciones"
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

  // Obtener cotizaciones por cliente
  const getCotizacionesByClient = async (clientId, limit = 20) => {
    if (!clientId || clientId < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await cotizacionesService.getCotizacionesByClient(clientId, limit)

      if (result.success) {
        const formattedData = {
          ...result.data,
          cotizaciones:
            result.data.cotizaciones?.map((cotizacion) => ({
              ...cotizacion,
              total_formatted: cotizacionesService.formatCurrency(cotizacion.total),
              fecha_cotizacion_formatted: cotizacionesService.formatDate(cotizacion.fecha_cotizacion),
              fecha_vencimiento_formatted: cotizacion.fecha_vencimiento
                ? cotizacionesService.formatDate(cotizacion.fecha_vencimiento)
                : null,
              estado_formatted: cotizacionesService.getEstadoCotizacion(cotizacion.estado),
              is_vencida: cotizacionesService.isCotizacionVencida(cotizacion.fecha_vencimiento),
              dias_restantes: cotizacionesService.getDiasRestantes(cotizacion.fecha_vencimiento),
            })) || [],
        }

        return { success: true, data: formattedData }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener cotizaciones del cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Validar datos de cotización
  const validateCotizacionData = (cotizacionData) => {
    const errors = []

    const productErrors = cotizacionesService.validateProducts(cotizacionData.productos || [])
    errors.push(...productErrors)

    if (cotizacionData.subtotal === undefined || cotizacionData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (cotizacionData.total === undefined || cotizacionData.total <= 0) {
      errors.push("Total inválido")
    }

    if (cotizacionData.descuento !== undefined && cotizacionData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (cotizacionData.interes !== undefined && cotizacionData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    if (!cotizacionData.clienteId || cotizacionData.clienteId === 1) {
      errors.push("Debe seleccionar un cliente registrado para la cotización")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Preparar datos de cotización desde el formulario
  const prepareCotizacionDataFromForm = useCallback((formData, cartProducts, clienteSeleccionado) => {
    const productos = cartProducts.map((product) => ({
      productoId: product.id,
      cantidad: product.quantity,
      precioUnitario: product.precio_venta,
      discount_percentage: product.discount_active ? product.discount_percentage : 0,
      descripcion_personalizada: product.descripcion_personalizada || null,
    }))

    const subtotal = formData.subtotal
    let descuento = 0
    let interes = 0

    if (formData.interestDiscount > 0) {
      if (formData.isInterest) {
        interes =
          formData.interestDiscountType === "percentage"
            ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
            : Number.parseFloat(formData.interestDiscount)
      } else {
        descuento =
          formData.interestDiscountType === "percentage"
            ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
            : Number.parseFloat(formData.interestDiscount)
      }
    }

    // Calcular fecha de vencimiento
    const fechaCotizacion = new Date().toISOString().split("T")[0]
    const validezDias = formData.validezDias || 30
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + validezDias)

    return {
      clienteId: clienteSeleccionado.id,
      productos,
      subtotal,
      descuento,
      interes,
      total: formData.total,
      observaciones: formData.notes || "",
      condicionesComerciales: formData.condicionesComerciales || "",
      tiempoEntrega: formData.tiempoEntrega || "",
      fechaCotizacion: fechaCotizacion,
      fechaVencimiento: fechaVencimiento.toISOString().split("T")[0],
      validezDias: validezDias,
      selectedClient: clienteSeleccionado,
    }
  }, [])

  const calculateCotizacionTotals = useCallback((productos, descuento = 0, interes = 0) => {
    return cotizacionesService.calculateCotizacionTotals(productos, descuento, interes)
  }, [])

  const clearCotizacionInProgress = useCallback(() => {
    setCotizacionInProgress(null)
    setValidationErrors([])
  }, [])

  const retryCotizacionInProgress = useCallback(async () => {
    if (cotizacionInProgress) {
      return await createCotizacion(cotizacionInProgress)
    }
    return { success: false, message: "No hay cotización en progreso para reintentar" }
  }, [cotizacionInProgress])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      fechaInicio: "",
      fechaFin: "",
      cliente: "",
      estado: "todos",
      limit: 50,
      offset: 0,
    })
  }, [])

  const getLocalStats = useCallback(() => {
    if (!cotizaciones || cotizaciones.length === 0) return null

    const totalCotizaciones = cotizaciones.length
    const cotizacionesActivas = cotizaciones.filter((cotizacion) => cotizacion.estado === "activa").length
    const cotizacionesAceptadas = cotizaciones.filter((cotizacion) => cotizacion.estado === "aceptada").length
    const cotizacionesRechazadas = cotizaciones.filter((cotizacion) => cotizacion.estado === "rechazada").length
    const cotizacionesVencidas = cotizaciones.filter((cotizacion) => cotizacion.estado === "vencida").length
    const cotizacionesAnuladas = cotizaciones.filter((cotizacion) => cotizacion.estado === "anulada").length

    const totalCotizado = cotizaciones.reduce((sum, cotizacion) => sum + cotizacion.total, 0)
    const totalAceptado = cotizaciones
      .filter((cotizacion) => cotizacion.estado === "aceptada")
      .reduce((sum, cotizacion) => sum + cotizacion.total, 0)

    return {
      totalCotizaciones,
      cotizacionesActivas,
      cotizacionesAceptadas,
      cotizacionesRechazadas,
      cotizacionesVencidas,
      cotizacionesAnuladas,
      totalCotizado,
      totalAceptado,
      promedioCotizacion: totalCotizaciones > 0 ? totalCotizado / totalCotizaciones : 0,
      porcentajeAceptacion: totalCotizaciones > 0 ? (cotizacionesAceptadas / totalCotizaciones) * 100 : 0,
      totalCotizado_formatted: cotizacionesService.formatCurrency(totalCotizado),
      totalAceptado_formatted: cotizacionesService.formatCurrency(totalAceptado),
      promedioCotizacion_formatted: cotizacionesService.formatCurrency(
        totalCotizaciones > 0 ? totalCotizado / totalCotizaciones : 0,
      ),
    }
  }, [cotizaciones])

  const formatCurrency = useCallback((amount) => {
    return cotizacionesService.formatCurrency(amount)
  }, [])

  const formatDate = useCallback((date) => {
    return cotizacionesService.formatDate(date)
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchCotizaciones({ silent: true })
    }
  }, [filters, fetchCotizaciones])

  return {
    // Estados
    loading,
    error,
    filters,
    cotizaciones,
    selectedCotizacion,
    cotizacionesStats,
    pagination,
    cotizacionInProgress,
    validationErrors,

    // Funciones principales
    fetchCotizaciones,
    getCotizacionById,
    createCotizacion,
    updateCotizacion,
    updateCotizacionStatus,
    cancelCotizacion,
    convertToPresupuesto,
    fetchCotizacionesStats,
    getCotizacionesByClient,
    prepareCotizacionDataFromForm,

    // Validaciones
    validateCotizacionData,

    // Utilidades
    calculateCotizacionTotals,
    updateFilters,
    clearFilters,
    getLocalStats,
    formatCurrency,
    formatDate,

    // Manejo de cotización en progreso
    clearCotizacionInProgress,
    retryCotizacionInProgress,

    // Aliases para compatibilidad
    refetch: fetchCotizaciones,
  }
}

export default useCotizaciones
