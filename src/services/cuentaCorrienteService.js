// cuentaCorrienteService.js - SERVICIO COMPLETO Y CORREGIDO
import { apiClient } from "../config/api"

export const cuentaCorrienteService = {
  // Obtener resumen general de cuentas corrientes
  async getResumen(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen de cuenta corriente",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Registrar un pago de cuenta corriente
  async registrarPago(pagoData) {
    try {
      // Formatear datos para el backend
      const formattedData = {
        cliente_id: pagoData.cliente_id,
        monto: Number.parseFloat(pagoData.monto),
        fecha_pago: pagoData.fecha || new Date().toISOString().split("T")[0],
        comprobante: pagoData.comprobante || "",
        notas: pagoData.notas || "",
      }
      const response = await apiClient.post("/cuenta-corriente/pagos", formattedData)
      return {
        success: true,
        data: response.data.data,
        message: "Pago registrado exitosamente",
      }
    } catch (error) {
      console.error("Error al registrar pago:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al registrar pago",
        error: error.response?.data,
      }
    }
  },

  // Obtener todos los pagos con filtros
  async getPagos(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/pagos?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener pagos",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener pagos de un cliente específico
  async getPagosByClient(clientId, filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/client/${clientId}/pagos?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener pagos del cliente",
        error: error.response?.data,
        data: { cliente: null, pagos: [] },
      }
    }
  },

  // Obtener movimientos de cuenta corriente de un cliente
  async getMovimientosByClient(clientId, filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/client/${clientId}/movimientos?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos del cliente",
        error: error.response?.data,
        data: { cliente: null, movimientos: [] },
      }
    }
  },

  // Obtener un pago por ID
  async getPagoById(id) {
    try {
      const response = await apiClient.get(`/cuenta-corriente/pagos/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener pago",
        error: error.response?.data,
      }
    }
  },

  // Anular un pago
  async anularPago(id, motivo) {
    try {
      const response = await apiClient.patch(`/cuenta-corriente/pagos/${id}/anular`, { motivo })
      return {
        success: true,
        data: response.data.data,
        message: "Pago anulado exitosamente",
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular pago",
        error: error.response?.data,
      }
    }
  },

  // Crear ajuste manual de cuenta corriente
  async crearAjuste(ajusteData) {
    try {
      // Formatear datos para el backend
      const formattedData = {
        cliente_id: ajusteData.cliente_id,
        tipo: ajusteData.tipo,
        monto: Number.parseFloat(ajusteData.monto),
        concepto: ajusteData.concepto,
        notas: ajusteData.notas || "",
      }
      const response = await apiClient.post("/cuenta-corriente/ajustes", formattedData)
      return {
        success: true,
        data: response.data.data,
        message: "Ajuste registrado exitosamente",
      }
    } catch (error) {
      console.error("Error al crear ajuste:", error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear ajuste",
        error: error.response?.data,
      }
    }
  },

  // Obtener estadísticas de cuenta corriente
  async getEstadisticas(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/stats?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Formatear moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  // Formatear fecha
  formatDate(date) {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },

  // Formatear fecha y hora
  formatDateTime(date) {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  // Obtener tipos de pago disponibles
  getPaymentTypes() {
    return [
      { value: "efectivo", label: "Efectivo" },
      { value: "tarjeta", label: "Tarjeta" },
      { value: "transferencia", label: "Transferencia" },
      { value: "otro", label: "Otro" },
    ]
  },

  // Obtener tipos de ajuste disponibles
  getAdjustmentTypes() {
    return [
      { value: "debito", label: "Débito (Aumenta deuda)" },
      { value: "credito", label: "Crédito (Reduce deuda)" },
    ]
  },

  // Obtener estado formateado de pago
  getEstadoPago(estado) {
    switch (estado) {
      case "activo":
        return { label: "Activo", color: "green" }
      case "anulado":
        return { label: "Anulado", color: "red" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Obtener tipo formateado de movimiento
  getTipoMovimiento(tipo) {
    switch (tipo) {
      case "debito":
        return { label: "Débito", color: "red", description: "Aumenta la deuda" }
      case "credito":
        return { label: "Crédito", color: "green", description: "Reduce la deuda" }
      default:
        return { label: tipo, color: "gray", description: "" }
    }
  },

  // Obtener concepto formateado de movimiento
  getConceptoMovimiento(concepto) {
    switch (concepto) {
      case "venta":
        return { label: "Venta", icon: "shopping-cart" }
      case "pago":
        return { label: "Pago", icon: "credit-card" }
      case "nota_debito":
        return { label: "Nota de Débito", icon: "file-plus" }
      case "nota_credito":
        return { label: "Nota de Crédito", icon: "file-minus" }
      default:
        return { label: concepto, icon: "file-text" }
    }
  },
}
