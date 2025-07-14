// useSales.js - CORREGIDO PARA MANEJO CORRECTO DE IDs
"use client"

import { useState, useCallback, useEffect } from "react"
import { salesService } from "../services/salesService"
import toast from "react-hot-toast"

export const useSales = (initialFilters = {}) => {
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
  const [sales, setSales] = useState([])
  const [selectedSale, setSelectedSale] = useState(null)
  const [salesStats, setSalesStats] = useState(null)
  const [todaySummary, setTodaySummary] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })

  // Estados para el proceso de creación de venta
  const [saleInProgress, setSaleInProgress] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Obtener todas las ventas
  const fetchSales = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await salesService.getSales(finalFilters)

        if (result.success) {
          const formattedSales = result.data.map((sale) => ({
            ...sale,
            subtotal_formatted: salesService.formatCurrency(sale.subtotal),
            descuento_formatted: salesService.formatCurrency(sale.descuento),
            interes_formatted: salesService.formatCurrency(sale.interes),
            total_formatted: salesService.formatCurrency(sale.total),
            fecha_venta_formatted: salesService.formatDate(sale.fecha_venta),
            fecha_creacion_formatted: salesService.formatDate(sale.fecha_creacion),
            hora_creacion_formatted: new Date(sale.fecha_creacion).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            estado_formatted: salesService.getEstadoVenta(sale.estado),
            cuenta_corriente_info: sale.tiene_cuenta_corriente
              ? {
                  usado: true,
                  monto_cc: sale.pagos?.find((p) => p.tipo === "cuenta_corriente")?.monto || 0,
                  monto_cc_formatted: salesService.formatCurrency(
                    sale.pagos?.find((p) => p.tipo === "cuenta_corriente")?.monto || 0,
                  ),
                }
              : { usado: false },
          }))

          setSales(formattedSales)

          if (result.pagination) {
            setPagination(result.pagination)
          }

          return { success: true, data: formattedSales }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar ventas"
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

  // CORREGIDO: Obtener una venta por ID con validación mejorada
  const getSaleById = async (id) => {
    // CORREGIDO: Validación más robusta del ID
    const saleId = Number.parseInt(id)
    if (!id || isNaN(saleId) || saleId < 1) {
      console.error("ID de venta inválido:", id)
      toast.error("ID de venta inválido")
      return { success: false, message: "ID de venta inválido" }
    }

    setLoading(true)
    try {
      const result = await salesService.getSaleById(saleId)

      if (result.success) {
        const formattedSale = {
          ...result.data,
          subtotal_formatted: salesService.formatCurrency(result.data.subtotal),
          descuento_formatted: salesService.formatCurrency(result.data.descuento),
          interes_formatted: salesService.formatCurrency(result.data.interes),
          total_formatted: salesService.formatCurrency(result.data.total),
          fecha_venta_formatted: salesService.formatDate(result.data.fecha_venta),
          hora_venta_formatted: new Date(result.data.fecha_venta).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          estado_formatted: salesService.getEstadoVenta(result.data.estado),

          detalles:
            result.data.detalles?.map((detalle) => ({
              ...detalle,
              precio_unitario_formatted: salesService.formatCurrency(detalle.precio_unitario),
              subtotal_formatted: salesService.formatCurrency(detalle.subtotal),
            })) || [],

          pagos:
            result.data.pagos?.map((pago) => ({
              ...pago,
              monto_formatted: salesService.formatCurrency(pago.monto),
              tipo_formatted: salesService.getTipoPago(pago.tipo_pago),
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

        setSelectedSale(formattedSale)

        return { success: true, data: formattedSale }
      } else {
        console.error("Error al obtener venta:", result.message)
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error("Error en getSaleById:", error)
      const message = "Error al obtener venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // CORREGIDO: Crear una nueva venta con mejor manejo de respuesta
  const createSale = async (saleData) => {
    setLoading(true)
    setValidationErrors([])

    try {
      // Use the local validation wrapper
      const validation = validateSaleData(saleData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0], errors: validation.errors }
      }

      const tienePagoCuentaCorriente = saleData.pagos?.some((pago) => pago.tipo === "cuenta_corriente")
      if (tienePagoCuentaCorriente && saleData.selectedClient) {
        // Use the local validation wrapper
        const creditValidation = validateCreditSale(saleData.selectedClient, saleData)
        if (!creditValidation.isValid) {
          setValidationErrors(creditValidation.errors)
          toast.error(creditValidation.errors[0])
          return { success: false, message: creditValidation.errors[0], errors: creditValidation.errors }
        }
      }

      setSaleInProgress(saleData)

      const result = await salesService.createSale(saleData)

      if (result.success) {
        // CORREGIDO: Verificar que tenemos un ID válido antes de continuar
        const saleId = result.data?.data?.id || result.data?.id
        if (!saleId) {
          console.error("No se recibió ID de venta válido:", result.data)
          toast.error("Error: No se pudo obtener el ID de la venta creada")
          return { success: false, message: "Error: No se pudo obtener el ID de la venta creada" }
        }

        toast.success(result.message || "Venta creada exitosamente")

        setSaleInProgress(null)
        setValidationErrors([])

        // CORREGIDO: Recargar datos en paralelo sin esperar
        Promise.all([
          fetchSales({ silent: true }),
          fetchTodaySummary({ silent: true }),
          salesStats ? fetchSalesStats({ silent: true }) : Promise.resolve(),
        ]).catch((error) => {
          console.warn("Error al recargar datos después de crear venta:", error)
        })

        return {
          success: true,
          data: {
            ...result.data,
            id: saleId, // Asegurar que el ID esté disponible
          },
          message: result.message,
        }
      } else {
        console.error("Error al crear venta:", result.message)
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
          errors: result.errors || [],
        }
      }
    } catch (error) {
      console.error("Error en createSale:", error)
      const message = error.message || "Error al crear venta"
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

  // Anular una venta
  const cancelSale = async (id, motivo) => {
    if (!motivo || motivo.trim().length === 0) {
      toast.error("El motivo de anulación es obligatorio")
      return { success: false, message: "El motivo de anulación es obligatorio" }
    }

    setLoading(true)
    try {
      const result = await salesService.cancelSale(id, motivo.trim())

      if (result.success) {
        toast.success(result.message || "Venta anulada exitosamente")

        await Promise.all([
          fetchSales({ silent: true }),
          fetchTodaySummary({ silent: true }),
          salesStats ? fetchSalesStats({ silent: true }) : Promise.resolve(),
        ])

        if (selectedSale && selectedSale.id === id) {
          await getSaleById(id)
        }

        return { success: true, data: result.data }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = error.message || "Error al anular venta"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Obtener estadísticas de ventas
  const fetchSalesStats = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await salesService.getSalesStats(finalFilters)

        if (result.success) {
          const formattedStats = {
            ...result.data,
            estadisticas_generales: {
              ...result.data.estadisticas_generales,
              total_facturado_formatted: salesService.formatCurrency(
                result.data.estadisticas_generales?.total_facturado || 0,
              ),
              promedio_venta_formatted: salesService.formatCurrency(
                result.data.estadisticas_generales?.promedio_venta || 0,
              ),
              total_cuenta_corriente_formatted: salesService.formatCurrency(
                result.data.estadisticas_generales?.total_cuenta_corriente || 0,
              ),
              porcentaje_cuenta_corriente:
                result.data.estadisticas_generales?.total_ventas > 0
                  ? (
                      (result.data.estadisticas_generales?.ventas_cuenta_corriente /
                        result.data.estadisticas_generales?.total_ventas) *
                      100
                    ).toFixed(1)
                  : "0.0",
            },

            ventas_por_dia:
              result.data.ventas_por_dia?.map((item) => ({
                ...item,
                total_dia_formatted: salesService.formatCurrency(item.total_dia),
              })) || [],

            top_clientes:
              result.data.top_clientes?.map((cliente) => ({
                ...cliente,
                total_comprado_formatted: salesService.formatCurrency(cliente.total_comprado),
              })) || [],

            metodos_pago:
              result.data.metodos_pago?.map((metodo) => ({
                ...metodo,
                total_monto_formatted: salesService.formatCurrency(metodo.total_monto),
                es_cuenta_corriente: metodo.tipo_pago === "cuenta_corriente",
                porcentaje_uso:
                  result.data.estadisticas_generales?.total_ventas > 0
                    ? ((metodo.cantidad_usos / result.data.estadisticas_generales?.total_ventas) * 100).toFixed(1)
                    : "0.0",
              })) || [],
          }

          setSalesStats(formattedStats)
          return { success: true, data: formattedStats }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas de ventas"
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

  // Obtener resumen del día
  const fetchTodaySummary = useCallback(async (customFilters = {}) => {
    setLoading(true)
    try {
      const result = await salesService.getTodaySalesSummary()

      if (result.success) {
        const formattedSummary = {
          ...result.data,
          resumen: {
            ...result.data.resumen,
            total_facturado_formatted: salesService.formatCurrency(result.data.resumen?.total_facturado || 0),
            total_cuenta_corriente_formatted: salesService.formatCurrency(
              result.data.resumen?.total_cuenta_corriente || 0,
            ),
            porcentaje_cuenta_corriente:
              result.data.resumen?.total_ventas > 0
                ? ((result.data.resumen?.ventas_cuenta_corriente / result.data.resumen?.total_ventas) * 100).toFixed(1)
                : "0.0",
          },

          metodos_pago:
            result.data.metodos_pago?.map((metodo) => ({
              ...metodo,
              total_formatted: salesService.formatCurrency(metodo.total),
              es_cuenta_corriente: metodo.tipo_pago === "cuenta_corriente",
            })) || [],

          productos_mas_vendidos:
            result.data.productos_mas_vendidos?.map((producto) => ({
              ...producto,
              total_vendido_formatted: salesService.formatCurrency(producto.total_vendido),
            })) || [],
        }

        setTodaySummary(formattedSummary)
        return { success: true, data: formattedSummary }
      } else {
        if (!customFilters.silent) {
          toast.error(result.message)
        }
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener resumen del día"
      if (!customFilters.silent) {
        toast.error(message)
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener ventas por cliente
  const getSalesByClient = async (clientId, limit = 20) => {
    if (!clientId || clientId < 1) {
      toast.error("ID de cliente inválido")
      return { success: false, message: "ID de cliente inválido" }
    }

    setLoading(true)
    try {
      const result = await salesService.getSalesByClient(clientId, limit)

      if (result.success) {
        const formattedData = {
          ...result.data,
          ventas:
            result.data.ventas?.map((sale) => ({
              ...sale,
              total_formatted: salesService.formatCurrency(sale.total),
              fecha_venta_formatted: salesService.formatDate(sale.fecha_venta),
              estado_formatted: salesService.getEstadoVenta(sale.estado),
              uso_cuenta_corriente: sale.tiene_cuenta_corriente
                ? {
                    usado: true,
                    icono: "credit-card",
                    tooltip: "Venta con cuenta corriente",
                  }
                : { usado: false },
            })) || [],
        }

        return { success: true, data: formattedData }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener ventas del cliente"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Validar datos de venta (LOCAL WRAPPER)
  const validateSaleData = (saleData) => {
    const errors = []

    const productErrors = salesService.validateProducts(saleData.productos || [])
    errors.push(...productErrors)

    const paymentErrors = salesService.validatePayments(saleData.pagos || [], saleData.total || 0)
    errors.push(...paymentErrors)

    if (saleData.subtotal === undefined || saleData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (saleData.total === undefined || saleData.total <= 0) {
      errors.push("Total inválido")
    }

    if (saleData.descuento !== undefined && saleData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (saleData.interes !== undefined && saleData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    const tienePagoCuentaCorriente = saleData.pagos?.some((pago) => pago.tipo === "cuenta_corriente")
    if (tienePagoCuentaCorriente) {
      if (!saleData.clienteId || saleData.clienteId === 1) {
        errors.push("Para pagar con cuenta corriente debe seleccionar un cliente registrado")
      }

      if (saleData.selectedClient && !saleData.selectedClient.tiene_cuenta_corriente) {
        errors.push("El cliente seleccionado no tiene cuenta corriente habilitada")
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Validar venta con cuenta corriente (LOCAL WRAPPER)
  const validateCreditSale = (cliente, saleData) => {
    const errors = []

    const montoCuentaCorriente =
      saleData.pagos
        ?.filter((pago) => pago.tipo === "cuenta_corriente")
        .reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0) || 0

    const creditCheck = salesService.canSellOnCredit(cliente, montoCuentaCorriente)

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

  // Funciones específicas para cuenta corriente
  const canSellOnCredit = useCallback((cliente, montoVenta) => {
    return salesService.canSellOnCredit(cliente, montoVenta)
  }, [])

  const calculateAvailableCredit = useCallback((cliente) => {
    return salesService.calculateAvailableCredit(cliente)
  }, [])

  const getClientCreditInfo = useCallback((cliente) => {
    return salesService.getClientCreditInfo(cliente)
  }, [])

  const calculateSaleTotals = useCallback((productos, descuento = 0, interes = 0) => {
    return salesService.calculateSaleTotals(productos, descuento, interes)
  }, [])

  // Preparar datos de venta desde el formulario
  const prepareSaleDataFromForm = useCallback((formData, cartProducts, payments, clienteSeleccionado) => {
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
      fechaVenta: new Date().toISOString().split("T")[0],
      pagos,
      selectedClient: clienteSeleccionado.id !== 1 ? clienteSeleccionado : null,
    }
  }, [])

  const getPaymentTypes = useCallback(() => {
    return salesService.getPaymentTypes()
  }, [])

  const clearSaleInProgress = useCallback(() => {
    setSaleInProgress(null)
    setValidationErrors([])
  }, [])

  const retrySaleInProgress = useCallback(async () => {
    if (saleInProgress) {
      return await createSale(saleInProgress)
    }
    return { success: false, message: "No hay venta en progreso para reintentar" }
  }, [saleInProgress])

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
    if (!sales || sales.length === 0) return null

    const totalVentas = sales.length
    const ventasCompletadas = sales.filter((sale) => sale.estado === "completada").length
    const ventasAnuladas = sales.filter((sale) => sale.estado === "anulada").length

    const ventasConCC = sales.filter((sale) => sale.tiene_cuenta_corriente).length
    const totalFacturado = sales
      .filter((sale) => sale.estado === "completada")
      .reduce((sum, sale) => sum + sale.total, 0)

    const totalCuentaCorriente = sales
      .filter((sale) => sale.estado === "completada" && sale.tiene_cuenta_corriente)
      .reduce((sum, sale) => sum + sale.total, 0)

    return {
      totalVentas,
      ventasCompletadas,
      ventasAnuladas,
      ventasPendientes: totalVentas - ventasCompletadas - ventasAnuladas,
      ventasConCC,
      ventasSinCC: totalVentas - ventasConCC,
      totalFacturado,
      totalCuentaCorriente,
      promedioVenta: ventasCompletadas > 0 ? totalFacturado / ventasCompletadas : 0,
      porcentajeCuentaCorriente: totalVentas > 0 ? (ventasConCC / totalVentas) * 100 : 0,
      totalFacturado_formatted: salesService.formatCurrency(totalFacturado),
      totalCuentaCorriente_formatted: salesService.formatCurrency(totalCuentaCorriente),
      promedioVenta_formatted: salesService.formatCurrency(
        ventasCompletadas > 0 ? totalFacturado / ventasCompletadas : 0,
      ),
    }
  }, [sales])

  const formatCurrency = useCallback((amount) => {
    return salesService.formatCurrency(amount)
  }, [])

  const formatDate = useCallback((date) => {
    return salesService.formatDate(date)
  }, [])

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchSales({ silent: true })
    }
  }, [filters, fetchSales])

  return {
    // Estados
    loading,
    error,
    filters,
    sales,
    selectedSale,
    salesStats,
    todaySummary,
    pagination,
    saleInProgress,
    validationErrors,

    // Funciones principales
    fetchSales,
    getSaleById,
    createSale,
    cancelSale,
    fetchSalesStats,
    fetchTodaySummary,
    getSalesByClient,
    prepareSaleDataFromForm,

    // Validaciones (now wrappers for salesService)
    validateSaleData,
    validateCreditSale,

    // Funciones específicas de cuenta corriente
    canSellOnCredit,
    calculateAvailableCredit,
    getClientCreditInfo,

    // Utilidades
    calculateSaleTotals,
    getPaymentTypes,
    updateFilters,
    clearFilters,
    getLocalStats,
    formatCurrency,
    formatDate,

    // Manejo de venta en progreso
    clearSaleInProgress,
    retrySaleInProgress,

    // Aliases para compatibilidad
    refetch: fetchSales,
  }
}

export default useSales
