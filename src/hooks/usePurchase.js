"use client"

import { useState, useCallback, useEffect } from "react"
import { purchasesService } from "../services/purchasesService"
import toast from "react-hot-toast"

export const usePurchases = (initialFilters = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    fechaInicio: "",
    fechaFin: "",
    proveedor: "",
    estado: "todos",
    limit: 50,
    offset: 0,
    ...initialFilters,
  })

  // Estados para diferentes tipos de datos
  const [purchases, setPurchases] = useState([])
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [purchaseStats, setPurchaseStats] = useState(null)
  const [todaySummary, setTodaySummary] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  })

  // Estados para el proceso de creación de compra
  const [purchaseInProgress, setPurchaseInProgress] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  // Obtener todas las compras
  const fetchPurchases = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      setError(null)

      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await purchasesService.getPurchases(finalFilters)

        if (result.success) {
          // Formatear compras con información adicional
          const formattedPurchases = result.data.map((purchase) => ({
            ...purchase,
            // Formateo para UI
            subtotal_formatted: purchasesService.formatCurrency(purchase.subtotal),
            descuento_formatted: purchasesService.formatCurrency(purchase.descuento),
            total_formatted: purchasesService.formatCurrency(purchase.total),
            fecha_compra_formatted: purchasesService.formatDate(purchase.fecha_compra),
            estado_formatted: purchasesService.getEstadoCompra(purchase.estado),
          }))

          setPurchases(formattedPurchases)

          if (result.pagination) {
            setPagination(result.pagination)
          }

          return { success: true, data: formattedPurchases }
        } else {
          setError(result.message)
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al cargar compras"
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

  // Obtener una compra por ID
  const getPurchaseById = async (id) => {
    if (!id || id < 1) {
      toast.error("ID de compra inválido")
      return { success: false, message: "ID de compra inválido" }
    }

    setLoading(true)
    try {
      const result = await purchasesService.getPurchaseById(id)

      if (result.success) {
        // Formatear compra completa
        const formattedPurchase = {
          ...result.data,
          // Formateo básico
          subtotal_formatted: purchasesService.formatCurrency(result.data.subtotal),
          descuento_formatted: purchasesService.formatCurrency(result.data.descuento),
          total_formatted: purchasesService.formatCurrency(result.data.total),
          fecha_compra_formatted: purchasesService.formatDate(result.data.fecha_compra),
          estado_formatted: purchasesService.getEstadoCompra(result.data.estado),

          // Formatear detalles
          detalles:
            result.data.detalles?.map((detalle) => ({
              ...detalle,
              precio_unitario_formatted: purchasesService.formatCurrency(detalle.precio_unitario),
              subtotal_formatted: purchasesService.formatCurrency(detalle.subtotal),
            })) || [],

          // NUEVO: Formatear pagos
          pagos:
            result.data.pagos?.map((pago) => ({
              ...pago,
              monto_formatted: purchasesService.formatCurrency(pago.monto),
              tipo_formatted: purchasesService.getTipoPago(pago.tipo_pago),
            })) || [],
        }

        setSelectedPurchase(formattedPurchase)
        return { success: true, data: formattedPurchase }
      } else {
        toast.error(result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      const message = "Error al obtener compra"
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  // Crear una nueva compra (ACTUALIZADO para manejar múltiples pagos)
  const createPurchase = async (purchaseData) => {
    setLoading(true)
    setValidationErrors([])

    try {
      // Validaciones
      const validation = validatePurchaseData(purchaseData)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        toast.error(validation.errors[0])
        return { success: false, message: validation.errors[0], errors: validation.errors }
      }

      // Guardar compra en progreso para posibles reintentos
      setPurchaseInProgress(purchaseData)

      const result = await purchasesService.createPurchase(purchaseData)

      if (result.success) {
        // Mostrar mensaje apropiado según si se recibió inmediatamente o no
        const message = purchaseData.recibirInmediatamente
          ? "Compra creada y productos recibidos exitosamente"
          : "Compra creada exitosamente"

        toast.success(result.message || message)

        // Limpiar compra en progreso
        setPurchaseInProgress(null)
        setValidationErrors([])

        // Recargar datos relevantes
        await Promise.all([
          fetchPurchases({ silent: true }),
          fetchTodaySummary({ silent: true }),
          purchaseStats ? fetchPurchaseStats({ silent: true }) : Promise.resolve(),
        ])

        return {
          success: true,
          data: result.data,
          message: result.message,
        }
      } else {
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
          errors: result.errors || [],
        }
      }
    } catch (error) {
      const message = error.message || "Error al crear compra"
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

  // Recibir productos de una compra
  const receivePurchaseItems = async (purchaseId, receiveData) => {
    if (!purchaseId || purchaseId < 1) {
      toast.error("ID de compra inválido")
      return { success: false, message: "ID de compra inválido" }
    }

    setLoading(true)
    try {
      const result = await purchasesService.receivePurchaseItems(purchaseId, receiveData)

      if (result.success) {
        toast.success(result.message || "Productos recibidos exitosamente")

        // Recargar datos relevantes
        await Promise.all([
          fetchPurchases({ silent: true }),
          fetchTodaySummary({ silent: true }),
          purchaseStats ? fetchPurchaseStats({ silent: true }) : Promise.resolve(),
        ])

        return {
          success: true,
          data: result.data,
          message: result.message,
        }
      } else {
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
        }
      }
    } catch (error) {
      const message = error.message || "Error al recibir productos"
      toast.error(message)
      return {
        success: false,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar estado de una compra
  const updatePurchaseStatus = async (purchaseId, statusData) => {
    if (!purchaseId || purchaseId < 1) {
      toast.error("ID de compra inválido")
      return { success: false, message: "ID de compra inválido" }
    }

    setLoading(true)
    try {
      const result = await purchasesService.updatePurchaseStatus(purchaseId, statusData)

      if (result.success) {
        toast.success(result.message || "Estado actualizado exitosamente")

        // Recargar datos relevantes
        await Promise.all([
          fetchPurchases({ silent: true }),
          fetchTodaySummary({ silent: true }),
          purchaseStats ? fetchPurchaseStats({ silent: true }) : Promise.resolve(),
        ])

        return {
          success: true,
          data: result.data,
          message: result.message,
        }
      } else {
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
        }
      }
    } catch (error) {
      const message = error.message || "Error al actualizar estado"
      toast.error(message)
      return {
        success: false,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  // Cancelar una compra
  const cancelPurchase = async (purchaseId) => {
    if (!purchaseId || purchaseId < 1) {
      toast.error("ID de compra inválido")
      return { success: false, message: "ID de compra inválido" }
    }

    setLoading(true)
    try {
      const result = await purchasesService.cancelPurchase(purchaseId)

      if (result.success) {
        toast.success(result.message || "Compra cancelada exitosamente")

        // Recargar datos relevantes
        await Promise.all([
          fetchPurchases({ silent: true }),
          fetchTodaySummary({ silent: true }),
          purchaseStats ? fetchPurchaseStats({ silent: true }) : Promise.resolve(),
        ])

        return {
          success: true,
          data: result.data,
          message: result.message,
        }
      } else {
        toast.error(result.message)
        return {
          success: false,
          message: result.message,
        }
      }
    } catch (error) {
      const message = error.message || "Error al cancelar compra"
      toast.error(message)
      return {
        success: false,
        message,
      }
    } finally {
      setLoading(false)
    }
  }

  // Validar datos de compra (ACTUALIZADO para incluir validación de pagos mejorada)
  const validatePurchaseData = (purchaseData) => {
    const errors = []

    // Validar productos
    const productErrors = purchasesService.validateProducts(purchaseData.productos || [])
    errors.push(...productErrors)

    // ACTUALIZADO: Validar pagos con el total correcto (incluyendo intereses/descuentos)
    const paymentErrors = purchasesService.validatePayments(purchaseData.pagos || [], purchaseData.total || 0)
    errors.push(...paymentErrors)

    // Validar montos básicos
    if (purchaseData.subtotal === undefined || purchaseData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (purchaseData.total === undefined || purchaseData.total <= 0) {
      errors.push("Total inválido")
    }

    if (purchaseData.descuento !== undefined && purchaseData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (purchaseData.interes !== undefined && purchaseData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    // Validar proveedor
    if (!purchaseData.proveedorId || purchaseData.proveedorId < 1) {
      errors.push("Debe seleccionar un proveedor")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Preparar datos de compra desde el formulario (ACTUALIZADO para múltiples pagos y cálculo correcto)
  const preparePurchaseDataFromForm = useCallback(
    (formData, cartProducts, payments, proveedorSeleccionado, recibirInmediatamente = false) => {
      // Convertir productos del carrito al formato esperado por la API
      const productos = cartProducts.map((product) => ({
        productoId: product.id,
        cantidad: product.quantity,
        precioUnitario: product.precio_costo,
      }))

      // ACTUALIZADO: Convertir pagos al formato esperado por la API
      const pagos = payments.map((payment) => ({
        tipo: payment.type,
        monto: Number.parseFloat(payment.amount),
        descripcion: payment.description || "",
      }))

      // CORREGIDO: Calcular subtotal, descuento e interés correctamente
      const subtotal = formData.subtotal
      let descuento = 0
      let interes = 0

      if (formData.interestDiscount > 0) {
        if (formData.isInterest) {
          // Es un interés
          interes =
            formData.interestDiscountType === "percentage"
              ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
              : Number.parseFloat(formData.interestDiscount)
        } else {
          // Es un descuento
          descuento =
            formData.interestDiscountType === "percentage"
              ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
              : Number.parseFloat(formData.interestDiscount)
        }
      }

      // IMPORTANTE: Usar el total final del formulario que ya incluye intereses/descuentos
      const totalFinal = formData.total

      // Crear objeto de compra
      return {
        proveedorId: proveedorSeleccionado?.id || 1,
        productos,
        subtotal,
        descuento,
        interes,
        total: totalFinal, // Este es el total final que incluye intereses/descuentos
        observaciones: formData.notes || "",
        fechaCompra: formData.fechaCompra || new Date().toISOString().split("T")[0],
        recibirInmediatamente,
        pagos, // NUEVO: Incluir pagos
        // Información adicional para validaciones
        selectedSupplier: proveedorSeleccionado,
      }
    },
    [],
  )

  // Obtener estadísticas de compras
  const fetchPurchaseStats = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await purchasesService.getPurchaseStats(finalFilters)

        if (result.success) {
          const formattedStats = {
            ...result.data,
            // Formatear estadísticas generales
            estadisticas_generales: {
              ...result.data.estadisticas_generales,
              total_comprado_formatted: purchasesService.formatCurrency(
                result.data.estadisticas_generales?.total_comprado || 0,
              ),
              promedio_compra_formatted: purchasesService.formatCurrency(
                result.data.estadisticas_generales?.promedio_compra || 0,
              ),
            },
          }

          setPurchaseStats(formattedStats)
          return { success: true, data: formattedStats }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas de compras"
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
      const result = await purchasesService.getTodayPurchasesSummary()

      if (result.success) {
        const formattedSummary = {
          ...result.data,
          resumen: {
            ...result.data.resumen,
            total_comprado_formatted: purchasesService.formatCurrency(result.data.resumen?.total_comprado || 0),
          },
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

  // NUEVA: Obtener estadísticas de métodos de pago
  const fetchPaymentStats = useCallback(
    async (customFilters = {}) => {
      setLoading(true)
      try {
        const finalFilters = { ...filters, ...customFilters }
        const result = await purchasesService.getPurchasePaymentStats(finalFilters)

        if (result.success) {
          return { success: true, data: result.data }
        } else {
          if (!customFilters.silent) {
            toast.error(result.message)
          }
          return { success: false, message: result.message }
        }
      } catch (error) {
        const message = "Error al obtener estadísticas de métodos de pago"
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

  // Calcular totales de compra
  const calculatePurchaseTotals = useCallback((productos, descuento = 0, interes = 0) => {
    return purchasesService.calculatePurchaseTotals(productos, descuento, interes)
  }, [])

  // Obtener tipos de pago disponibles (sin cuenta corriente para compras)
  const getPaymentTypes = useCallback(() => {
    return purchasesService.getPaymentTypes()
  }, [])

  // Limpiar compra en progreso
  const clearPurchaseInProgress = useCallback(() => {
    setPurchaseInProgress(null)
    setValidationErrors([])
  }, [])

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      fechaInicio: "",
      fechaFin: "",
      proveedor: "",
      estado: "todos",
      limit: 50,
      offset: 0,
    })
  }, [])

  // Calcular estadísticas locales
  const getLocalStats = useCallback(() => {
    if (!purchases || purchases.length === 0) return null

    const totalCompras = purchases.length
    const comprasCompletadas = purchases.filter((purchase) => purchase.estado === "recibida").length
    const comprasPendientes = purchases.filter((purchase) => purchase.estado === "pendiente").length
    const comprasCanceladas = purchases.filter((purchase) => purchase.estado === "cancelada").length

    const totalComprado = purchases
      .filter((purchase) => purchase.estado === "recibida")
      .reduce((sum, purchase) => sum + purchase.total, 0)

    return {
      totalCompras,
      comprasCompletadas,
      comprasPendientes,
      comprasCanceladas,
      totalComprado,
      promedioCompra: comprasCompletadas > 0 ? totalComprado / comprasCompletadas : 0,
      // Formateo para UI
      totalComprado_formatted: purchasesService.formatCurrency(totalComprado),
      promedioCompra_formatted: purchasesService.formatCurrency(
        comprasCompletadas > 0 ? totalComprado / comprasCompletadas : 0,
      ),
    }
  }, [purchases])

  // Formatear moneda
  const formatCurrency = useCallback((amount) => {
    return purchasesService.formatCurrency(amount)
  }, [])

  // Formatear fecha
  const formatDate = useCallback((date) => {
    return purchasesService.formatDate(date)
  }, [])

  // NUEVA: Validar pagos antes de confirmar
  const validatePaymentsBeforeConfirm = useCallback((payments, total) => {
    const errors = purchasesService.validatePayments(payments, total)
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [])

  // NUEVA: Calcular total de pagos
  const calculatePaymentsTotal = useCallback((payments) => {
    return payments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || 0), 0)
  }, [])

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchPurchases({ silent: true })
    }
  }, [filters, fetchPurchases])

  return {
    // Estados
    loading,
    error,
    filters,
    purchases,
    selectedPurchase,
    purchaseStats,
    todaySummary,
    pagination,
    purchaseInProgress,
    validationErrors,

    // Funciones principales
    fetchPurchases,
    getPurchaseById,
    createPurchase,
    receivePurchaseItems,
    updatePurchaseStatus,
    cancelPurchase,
    fetchPurchaseStats,
    fetchTodaySummary,
    fetchPaymentStats, // NUEVA
    preparePurchaseDataFromForm,

    // Validaciones
    validatePurchaseData,
    validatePaymentsBeforeConfirm, // NUEVA

    // Utilidades
    calculatePurchaseTotals,
    calculatePaymentsTotal, // NUEVA
    getPaymentTypes,
    updateFilters,
    clearFilters,
    getLocalStats,
    formatCurrency,
    formatDate,

    // Manejo de compra en progreso
    clearPurchaseInProgress,

    // Aliases para compatibilidad
    refetch: fetchPurchases,
  }
}

export default usePurchases
