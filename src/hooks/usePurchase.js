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

          // Formatear pagos
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

  // Crear una nueva compra
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

  // Cancelar una compra
  const cancelPurchase = async (purchaseId, motivo) => {
    // ADDED motivo parameter
    if (!purchaseId || purchaseId < 1) {
      toast.error("ID de compra inválido")
      return { success: false, message: "ID de compra inválido" }
    }

    setLoading(true)
    try {
      const result = await purchasesService.cancelPurchase(purchaseId, motivo) // Pass motivo

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

  // Validar datos de compra
  const validatePurchaseData = (purchaseData) => {
    const errors = []

    // Validar productos
    const productErrors = purchasesService.validateProducts(purchaseData.productos || [])
    errors.push(...productErrors)

    // Validar pagos con el total correcto (incluyendo intereses/descuentos)
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

    // Validar fecha
    if (!purchaseData.fechaCompra) {
      errors.push("La fecha de compra es requerida")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Preparar datos de compra desde el formulario
  const preparePurchaseDataFromForm = useCallback(
    (formData, cartProducts, payments, proveedorSeleccionado, recibirInmediatamente = false) => {
      // Convertir productos del carrito al formato esperado por la API
      const productos = cartProducts.map((product) => ({
        productoId: product.id,
        cantidad: product.quantity,
        precioUnitario: product.precio_costo,
      }))

      // Convertir pagos al formato esperado por la API
      const pagos = payments.map((payment) => ({
        tipo: payment.type,
        monto: Number.parseFloat(payment.amount),
        descripcion: payment.description || "",
      }))

      // Calcular subtotal, descuento e interés correctamente
      const subtotal = formData.subtotal
      let descuento = 0
      let interes = 0

      if (formData.interestDiscount > 0) {
        if (formData.isInterest) {
          // Es un interés
          interes =
            formData.interestDiscountType === "percentage" // Corrected from interestDisc to interestDiscountType
              ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100 // Parse float
              : Number.parseFloat(formData.interestDiscount) // Parse float
        } else {
          // Es un descuento
          descuento =
            formData.interestDiscountType === "percentage" // Corrected from interestDisc to interestDiscountType
              ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100 // Parse float
              : Number.parseFloat(formData.interestDiscount) // Parse float
        }
      }

      const total = subtotal - descuento + interes

      return {
        proveedorId: proveedorSeleccionado?.id || 1,
        productos,
        subtotal,
        descuento,
        interes,
        total,
        observaciones: formData.notes || "", // Corrected from observaciones to notes
        fechaCompra: formData.fechaCompra || new Date().toISOString().split("T")[0],
        pagos,
        recibirInmediatamente,
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
          setPurchaseStats(result.data)
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

  // Obtener resumen del día actual
  const fetchTodaySummary = useCallback(async (customFilters = {}) => {
    const today = new Date().toISOString().split("T")[0]
    const todayFilters = {
      fechaInicio: today,
      fechaFin: today,
      ...customFilters,
    }

    try {
      const result = await purchasesService.getPurchaseStats(todayFilters)

      if (result.success) {
        setTodaySummary(result.data)
        return { success: true, data: result.data }
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
    }
  }, [])

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      fechaInicio: "",
      fechaFin: "",
      proveedor: "",
      estado: "todos",
      limit: 50,
      offset: 0,
    }
    setFilters(clearedFilters)
    return clearedFilters
  }, [])

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setError(null)
    setValidationErrors([])
  }, [])

  // Limpiar compra seleccionada
  const clearSelectedPurchase = useCallback(() => {
    setSelectedPurchase(null)
  }, [])

  // Reintentar compra en progreso
  const retryPurchaseInProgress = useCallback(async () => {
    if (purchaseInProgress) {
      return await createPurchase(purchaseInProgress)
    }
    return { success: false, message: "No hay compra en progreso para reintentar" }
  }, [purchaseInProgress])

  // Limpiar compra en progreso
  const clearPurchaseInProgress = useCallback(() => {
    setPurchaseInProgress(null)
  }, [])

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      fetchPurchases({ silent: true })
    }
  }, [])

  return {
    // Estados
    loading,
    error,
    purchases,
    selectedPurchase,
    purchaseStats,
    todaySummary,
    pagination,
    filters,
    purchaseInProgress,
    validationErrors,

    // Funciones principales
    fetchPurchases,
    getPurchaseById,
    createPurchase,
    receivePurchaseItems,
    // updatePurchaseStatus, // REMOVED
    cancelPurchase,
    fetchPurchaseStats,
    fetchTodaySummary,

    // Utilidades
    validatePurchaseData,
    preparePurchaseDataFromForm,
    updateFilters,
    clearFilters,
    clearErrors,
    clearSelectedPurchase,
    retryPurchaseInProgress,
    clearPurchaseInProgress,

    // Funciones de formateo (re-exportadas del servicio)
    formatCurrency: purchasesService.formatCurrency,
    formatDate: purchasesService.formatDate,
    getTipoPago: purchasesService.getTipoPago,
    getEstadoCompra: purchasesService.getEstadoCompra,
    getPaymentTypes: purchasesService.getPaymentTypes,
    calculatePurchaseTotals: purchasesService.calculatePurchaseTotals,
  }
}

export default usePurchases
