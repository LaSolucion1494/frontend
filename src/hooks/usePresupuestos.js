"use client"

import { useState, useCallback } from "react"
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
            fecha_vencimiento_formatted: presupuesto.fecha_vencimiento
              ? presupuestosService.formatDate(presupuesto.fecha_vencimiento)
              : null,
            fecha_creacion_formatted: presupuestosService.formatDate(presupuesto.fecha_creacion),
            estado_formatted: presupuestosService.getEstadoPresupuesto(presupuesto.estado),
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
          fecha_vencimiento_formatted: result.data.fecha_vencimiento
            ? presupuestosService.formatDate(result.data.fecha_vencimiento)
            : null,
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
            })) || [],
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

  // Crear un nuevo presupuesto
  const createPresupuesto = async (presupuestoData) => {
    setLoading(true)
    setValidationErrors([])

    try {
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
        Promise.all([fetchPresupuestos({ silent: true })]).catch((error) => {
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
      validezDias: 30,
      pagos,
      selectedClient: clienteSeleccionado.id !== 1 ? clienteSeleccionado : null,
    }
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

  const formatCurrency = useCallback((amount) => {
    return presupuestosService.formatCurrency(amount)
  }, [])

  const formatDate = useCallback((date) => {
    return presupuestosService.formatDate(date)
  }, [])

  return {
    // Estados
    loading,
    error,
    filters,
    presupuestos,
    selectedPresupuesto,
    pagination,
    presupuestoInProgress,
    validationErrors,

    // Funciones principales
    fetchPresupuestos,
    getPresupuestoById,
    createPresupuesto,
    updatePresupuestoEstado,
    preparePresupuestoDataFromForm,

    // Utilidades
    updateFilters,
    clearFilters,
    formatCurrency,
    formatDate,

    // Aliases para compatibilidad
    refetch: fetchPresupuestos,
  }
}

export default usePresupuestos
