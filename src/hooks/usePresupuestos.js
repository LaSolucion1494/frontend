// usePresupuestos.js - ACTUALIZADO PARA FUNCIONAR COMO VENTAS SIN FACTURA
"use client"

import { useState, useCallback, useEffect } from "react"
import { presupuestosService } from "../services/presupuestosService"
import toast from "react-hot-toast"

export const usePresupuestos = (initialFilters = {}) => {
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
  const [presupuestos, setPresupuestos] = useState([])
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null)
  const [presupuestosStats, setPresupuestosStats] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })

  // Estados para el proceso de creación de presupuesto
  const [presupuestoInProgress, setPresupuestoInProgress] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Obtener todos los presupuestos
  const fetchPresupuestos = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await presupuestosService.getPresupuestos(finalFilters)

        if (result.success) {
          const formattedPresupuestos = result.data.map((presupuesto) => ({
            ...presupuesto,
            subtotal_formatted: presupuestosService.formatCurrency(presupuesto.subtotal),
            descuento_formatted: presupuestosService.formatCurrency(presupuesto.descuento),
            interes_formatted: presupuestosService.formatCurrency(presupuesto.interes),
            total_formatted: presupuestosService.formatCurrency(presupuesto.total),
            fecha_presupuesto_formatted: presupuestosService.formatDate(presupuesto.fecha_presupuesto),
            fecha_creacion_formatted: presupuestosService.formatDate(presupuesto.fecha_creacion),
            hora_creacion_formatted: new Date(presupuesto.fecha_creacion).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            estado_formatted: presupuestosService.getEstadoPresupuesto(presupuesto.estado),
            cuenta_corriente_info: presupuesto.tiene_cuenta_corriente
              ? {
                  usado: true,
                  monto_cc: presupuesto.pagos?.find((p) => p.tipo === "cuenta_corriente")?.monto || 0,
                  monto_cc_formatted: presupuestosService.formatCurrency(
                    presupuesto.pagos?.find((p) => p.tipo === "cuenta_corriente")?.monto || 0,
                  ),
                }
              : { usado: false },
          }))

          setPresupuestos(formattedPresupuestos)

          if (result.pagination) {
            setPagination(result.pagination)
          }

          return { success: true, data: formattedPresupuestos }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar presupuestos"
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

  // Obtener un presupuesto por ID
  const getPresupuestoById = async (id) => {
    const presupuestoId = Number.parseInt(id)
    if (!id || isNaN(presupuestoId) || presupuestoId < 1) {
      console.error("ID de presupuesto inválido:", id)
      toast.error("ID de presupuesto inválido")
      return { success: false, message: "ID de presupuesto inválido" }
    }

    setLoading(true)
    try {
      const result = await presupuestosService.getPresupuestoById(presupuestoId)

      if (result.success) {
        const formattedPresupuesto = {
          ...result.data,
          subtotal_formatted: presupuestosService.formatCurrency(result.data.subtotal),
          descuento_formatted: presupuestosService.formatCurrency(result.data.descuento),
          interes_formatted: presupuestosService.formatCurrency(result.data.interes),
          total_formatted: presupuestosService.formatCurrency(result.data.total),
          fecha_presupuesto_formatted: presupuestosService.formatDate(result.data.fecha_presupuesto),
          hora_presupuesto_formatted: new Date(result.data.fecha_presupuesto).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          estado_formatted: presupuestosService.getEstadoPresupuesto(result.data.estado),

          detalles:
            result.data.detalles?.map((detalle) => ({
              ...detalle,
              precio_unitario_formatted: presupuestosService.formatCurrency(detalle.precio_unitario),
              subtotal_formatted: presupuestosService.formatCurrency(detalle.subtotal),
            })) || [],

          pagos:
            result.data.pagos?.map((pago) => ({
              ...pago,
              monto_formatted: presupuestosService.formatCurrency(pago.monto),
              tipo_formatted: this.getTipoPago(pago.tipo_pago),
              es_cuenta_corriente: pago.tipo_pago === "cuenta_corriente",
              movimiento_info: pago.movimiento_cuenta_id
                ? {
                    id: pago.movimiento_cuenta_id,
                    numero: pago.movimiento_numero,
                    descripcion: pago.movimiento_descripcion,
                  }
                : null,
            })) || [],

          cuenta_corriente_summary: result.data.tiene_cuenta_corriente
            ? {
                usado: true,
                pagos_cc: result.data.pagos?.filter((p) => p.tipo === "cuenta_corriente") || [],
                total_cc: result.data.pagos
                  ?.filter((p) => p.tipo === "cuenta_corriente")
                  .reduce((sum, p) => sum + p.monto, 0),
                movimiento_principal_id: result.data.movimiento_cuenta_id,
              }
            : { usado: false },
        }

        setSelectedPresupuesto(formattedPresupuesto)
        return { success: true, data: formattedPresupuesto }
      } else {
        console.error("Error al obtener presupuesto:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error en getPresupuestoById:", error)
      const message = "Error al obtener presupuesto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Crear un nuevo presupuesto (FUNCIONA IGUAL QUE UNA VENTA)
  const createPresupuesto = async (presupuestoData) => {
    setLoading(true)
    setValidationErrors([])

    try {
      // Usar las mismas validaciones que las ventas
      const validation = validatePresupuestoData(presupuestoData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0], errors: validation.errors }
      }

      const tienePagoCuentaCorriente = presupuestoData.pagos?.some((pago) => pago.tipo === "cuenta_corriente")
      if (tienePagoCuentaCorriente && presupuestoData.selectedClient) {
        const creditValidation = validateCreditPresupuesto(presupuestoData.selectedClient, presupuestoData)
        if (!creditValidation.isValid) {
          setValidationErrors(creditValidation.errors)
          toast.error(creditValidation.errors[0])
          return { success: false, message: creditValidation.errors[0], errors: creditValidation.errors }
        }
      }

      setPresupuestoInProgress(presupuestoData)

      const result = await presupuestosService.createPresupuesto(presupuestoData)

      if (result.success) {
        const presupuestoId = result.data?.data?.id || result.data?.id
        if (!presupuestoId) {
          console.error("No se recibió ID de presupuesto válido:", result.data)
          toast.error("Error: No se pudo obtener el ID del presupuesto creado")
          return { success: false, message: "Error: No se pudo obtener el ID del presupuesto creado" }
        }

        toast.success(result.message || "Presupuesto creado exitosamente")

        setPresupuestoInProgress(null)
        setValidationErrors([])

        // Recargar datos
        Promise.all([
          fetchPresupuestos({ silent: true }),
          presupuestosStats ? fetchPresupuestosStats({ silent: true }) : Promise.resolve(),
        ]).catch((error) => {
          console.warn("Error al recargar datos después de crear presupuesto:", error)
        })

        return {
          success: true,
          data: {
            ...result.data,
            id: presupuestoId,
          },
          message: result.message,
        }
      } else {
        console.error("Error al crear presupuesto:", result.message)
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
          errors: result.errors || [],
        }
      }
    } catch (error) {
      console.error("Error en createPresupuesto:", error)
      const message = error.message || "Error al crear presupuesto"
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

  // NUEVO: Anular un presupuesto
  const cancelPresupuesto = async (id, motivo) => {
    if (!motivo || motivo.trim().length === 0) {
      toast.error("El motivo de anulación es obligatorio")
      return { success: false, message: "El motivo de anulación es obligatorio" }
    }

    setLoading(true)
    try {
      const result = await presupuestosService.cancelPresupuesto(id, motivo.trim())

      if (result.success) {
        toast.success(result.message || "Presupuesto anulado exitosamente")

        await Promise.all([
          fetchPresupuestos({ silent: true }),
          presupuestosStats ? fetchPresupuestosStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedPresupuesto && selectedPresupuesto.id === id) {
          await getPresupuestoById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al anular presupuesto"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // NUEVO: Entregar productos de un presupuesto pendiente
  const deliverProducts = async (presupuestoId, deliveries) => {
    setLoading(true)
    try {
      const result = await presupuestosService.deliverProducts(presupuestoId, deliveries)
      if (result.success) {
        toast.success(result.message)
        // Refrescar el presupuesto seleccionado si es el que se está entregando
        if (selectedPresupuesto && selectedPresupuesto.id === presupuestoId) {
          await getPresupuestoById(presupuestoId)
        }
        // Refrescar la lista de presupuestos y estadísticas
        await Promise.all([
          fetchPresupuestos({ silent: true }),
          presupuestosStats ? fetchPresupuestosStats({ silent: true }) : Promise.resolve(),
        ])
        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al entregar productos"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // NUEVO: Obtener estadísticas de presupuestos
  const fetchPresupuestosStats = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await presupuestosService.getPresupuestosStats(finalFilters)

        if (result.success) {
          const formattedStats = {
            ...result.data,
            estadisticas_generales: {
              ...result.data.estadisticas_generales,
              total_facturado_formatted: presupuestosService.formatCurrency(
                result.data.estadisticas_generales?.total_facturado || 0,
              ),
              promedio_presupuesto_formatted: presupuestosService.formatCurrency(
                result.data.estadisticas_generales?.promedio_presupuesto || 0,
              ),
              total_cuenta_corriente_formatted: presupuestosService.formatCurrency(
                result.data.estadisticas_generales?.total_cuenta_corriente || 0,
              ),
              porcentaje_cuenta_corriente:
                result.data.estadisticas_generales?.total_presupuestos > 0
                  ? (
                      (result.data.estadisticas_generales?.presupuestos_cuenta_corriente /
                        result.data.estadisticas_generales?.total_presupuestos) *
                      100
                    ).toFixed(1)
                  : "0.0",
            },
          }

          setPresupuestosStats(formattedStats)
          return { success: true, data: formattedStats }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas de presupuestos"
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

  // Actualizar estado del presupuesto
  const updatePresupuestoEstado = async (id, estado, observaciones = "") => {
    setLoading(true)
    try {
      const result = await presupuestosService.updatePresupuestoEstado(id, estado, observaciones)

      if (result.success) {
        toast.success(result.message || "Estado actualizado exitosamente")

        await Promise.all([fetchPresupuestos({ silent: true })])

        if (selectedPresupuesto && selectedPresupuesto.id === id) {
          await getPresupuestoById(id)
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

  // Validar datos de presupuesto (IGUAL QUE VENTAS)
  const validatePresupuestoData = (presupuestoData) => {
    const errors = []

    const productErrors = presupuestosService.validateProducts(presupuestoData.productos || [])
    errors.push(...productErrors)

    const paymentErrors = presupuestosService.validatePayments(presupuestoData.pagos || [], presupuestoData.total || 0)
    errors.push(...paymentErrors)

    if (presupuestoData.subtotal === undefined || presupuestoData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (presupuestoData.total === undefined || presupuestoData.total <= 0) {
      errors.push("Total inválido")
    }

    if (presupuestoData.descuento !== undefined && presupuestoData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (presupuestoData.interes !== undefined && presupuestoData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    const tienePagoCuentaCorriente = presupuestoData.pagos?.some((pago) => pago.tipo === "cuenta_corriente")
    if (tienePagoCuentaCorriente) {
      if (!presupuestoData.clienteId || presupuestoData.clienteId === 1) {
        errors.push("Para pagar con cuenta corriente debe seleccionar un cliente registrado")
      }

      if (presupuestoData.selectedClient && !presupuestoData.selectedClient.tiene_cuenta_corriente) {
        errors.push("El cliente seleccionado no tiene cuenta corriente habilitada")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Validar presupuesto con cuenta corriente (IGUAL QUE VENTAS)
  const validateCreditPresupuesto = (cliente, presupuestoData) => {
    const errors = []

    const montoCuentaCorriente =
      presupuestoData.pagos
        ?.filter((pago) => pago.tipo === "cuenta_corriente")
        .reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0) || 0

    const creditCheck = presupuestosService.canSellOnCredit(cliente, montoCuentaCorriente)

    if (!creditCheck.canSell) {
      errors.push(creditCheck.message)
    }

    if (!montoCuentaCorriente || montoCuentaCorriente <= 0) {
      errors.push("El monto de cuenta corriente debe ser mayor a 0")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Preparar datos de presupuesto desde el formulario
  const preparePresupuestoDataFromForm = useCallback((formData, cartProducts, payments, clienteSeleccionado) => {
    const productos = cartProducts.map((product) => ({
      productoId: product.id,
      cantidad: product.quantity,
      precioUnitario: product.precio_venta,
      discount_percentage: product.discount_active ? product.discount_percentage : 0,
    }))

    const pagos = payments.map((payment) => ({
      tipo: payment.type,
      monto: Number.parseFloat(payment.amount),
      descripcion: payment.description || "",
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

    return {
      clienteId: clienteSeleccionado.id || 1,
      productos,
      subtotal,
      descuento,
      interes,
      total: formData.total,
      observaciones: formData.notes || "",
      fechaPresupuesto: new Date().toISOString().split("T")[0],
      pagos,
      selectedClient: clienteSeleccionado.id !== 1 ? clienteSeleccionado : null,
    }
  }, [])

  // Funciones específicas para cuenta corriente (IGUALES QUE VENTAS)
  const canSellOnCredit = useCallback((cliente, montoPresupuesto) => {
    return presupuestosService.canSellOnCredit(cliente, montoPresupuesto)
  }, [])

  const calculateAvailableCredit = useCallback((cliente) => {
    return presupuestosService.calculateAvailableCredit(cliente)
  }, [])

  const getClientCreditInfo = useCallback((cliente) => {
    return presupuestosService.getClientCreditInfo(cliente)
  }, [])

  const calculatePresupuestoTotals = useCallback((productos, descuento = 0, interes = 0) => {
    return presupuestosService.calculatePresupuestoTotals(productos, descuento, interes)
  }, [])


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
    if (!presupuestos || presupuestos.length === 0) return null

    const totalPresupuestos = presupuestos.length
    const presupuestosCompletados = presupuestos.filter((presupuesto) => presupuesto.estado === "completado").length
    const presupuestosAnulados = presupuestos.filter((presupuesto) => presupuesto.estado === "anulado").length
    const presupuestosPendientes = presupuestos.filter((presupuesto) => presupuesto.estado === "pendiente").length

    const presupuestosConCC = presupuestos.filter((presupuesto) => presupuesto.tiene_cuenta_corriente).length
    const totalFacturado = presupuestos
      .filter((presupuesto) => presupuesto.estado === "completado")
      .reduce((sum, presupuesto) => sum + presupuesto.total, 0)

    const totalCuentaCorriente = presupuestos
      .filter((presupuesto) => presupuesto.estado === "completado" && presupuesto.tiene_cuenta_corriente)
      .reduce((sum, presupuesto) => sum + presupuesto.total, 0)

    return {
      totalPresupuestos,
      presupuestosCompletados,
      presupuestosAnulados,
      presupuestosPendientes,
      presupuestosConCC,
      presupuestosSinCC: totalPresupuestos - presupuestosConCC,
      totalFacturado,
      totalCuentaCorriente,
      promedioPresupuesto: presupuestosCompletados > 0 ? totalFacturado / presupuestosCompletados : 0,
      porcentajeCuentaCorriente: totalPresupuestos > 0 ? (presupuestosConCC / totalPresupuestos) * 100 : 0,
      totalFacturado_formatted: presupuestosService.formatCurrency(totalFacturado),
      totalCuentaCorriente_formatted: presupuestosService.formatCurrency(totalCuentaCorriente),
      promedioPresupuesto_formatted: presupuestosService.formatCurrency(
        presupuestosCompletados > 0 ? totalFacturado / presupuestosCompletados : 0,
      ),
    }
  }, [presupuestos])

  const formatCurrency = useCallback((amount) => {
    return presupuestosService.formatCurrency(amount)
  }, [])

  const formatDate = useCallback((date) => {
    return presupuestosService.formatDate(date)
  }, [])

  const clearPresupuestoInProgress = useCallback(() => {
    setPresupuestoInProgress(null)
    setValidationErrors([])
  }, [])

  const retryPresupuestoInProgress = useCallback(async () => {
    if (presupuestoInProgress) {
      return await createPresupuesto(presupuestoInProgress)
    }
    return { success: false, message: "No hay presupuesto en progreso para reintentar" }
  }, [presupuestoInProgress])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchPresupuestos({ silent: true })
    }
  }, [filters, fetchPresupuestos])

  return {
    // Estados
    loading,
    error,
    filters,
    presupuestos,
    selectedPresupuesto,
    presupuestosStats,
    pagination,
    presupuestoInProgress,
    validationErrors,

    // Funciones principales
    fetchPresupuestos,
    getPresupuestoById,
    createPresupuesto,
    cancelPresupuesto, // Nueva función
    deliverProducts, // Nueva función
    fetchPresupuestosStats, // Nueva función
    updatePresupuestoEstado,
    preparePresupuestoDataFromForm,

    // Validaciones
    validatePresupuestoData,
    validateCreditPresupuesto,

    // Funciones específicas de cuenta corriente
    canSellOnCredit,
    calculateAvailableCredit,
    getClientCreditInfo,

    // Utilidades
    calculatePresupuestoTotals,
    updateFilters,
    clearFilters,
    getLocalStats,
    formatCurrency,
    formatDate,

    // Manejo de presupuesto en progreso
    clearPresupuestoInProgress,
    retryPresupuestoInProgress,

    // Aliases para compatibilidad
    refetch: fetchPresupuestos,
  }
}

export default usePresupuestos
