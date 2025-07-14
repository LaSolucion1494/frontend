import { apiClient } from "../config/api"

export const cashClosingService = {
  // Obtener datos para el cierre de caja pendiente
  async getPendingCashClosingData(startDate, startTime, endDate, endTime, tipoCierre) {
    try {
      const response = await apiClient.get("/cash-closing/pending", {
        params: {
          fechaInicio: startDate,
          horaInicio: startTime,
          fechaFin: endDate,
          horaFin: endTime,
          tipoCierre: tipoCierre,
        },
      })
      return { success: true, data: response.data.data, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener datos para cierre de caja",
        error: error.response?.data,
      }
    }
  },

  // Realizar un cierre de caja
  async createCashClosing(closingData) {
    try {
      const response = await apiClient.post("/cash-closing", closingData)
      return { success: true, data: response.data.data, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al realizar cierre de caja",
        error: error.response?.data,
      }
    }
  },

  // Obtener historial de cierres de caja
  async getCashClosings(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value)
        }
      })
      const response = await apiClient.get(`/cash-closing?${params.toString()}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener historial de cierres de caja",
        error: error.response?.data,
      }
    }
  },

  // Obtener detalles de un cierre de caja por ID
  async getCashClosingById(id) {
    try {
      const response = await apiClient.get(`/cash-closing/${id}`)
      return { success: true, data: response.data.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener detalles del cierre de caja",
        error: error.response?.data,
      }
    }
  },

  // Funciones de utilidad
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR")
  },

  formatDateTime(isoString) {
    if (!isoString) return { date: "", time: "" }
    const date = new Date(isoString)
    return {
      date: date.toLocaleDateString("es-AR"),
      time: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    }
  },

  getPaymentMethodLabel(method) {
    const labels = {
      efectivo: "Efectivo",
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
      cuenta_corriente: "Cuenta Corriente",
      otro: "Otro",
      tarjeta_credito: "Tarjeta Crédito",
      tarjeta_debito: "Tarjeta Débito",
    }
    return labels[method] || method
  },

  getMovementTypeLabel(type) {
    const labels = {
      venta: "Venta",
      compra: "Compra",
      pago_cliente: "Pago Cliente",
      ajuste_ingreso: "Ajuste Ingreso",
      ajuste_egreso: "Ajuste Egreso",
    }
    return labels[type] || type
  },

  getClosingTypeLabel(type) {
    const labels = {
      ventas_only: "Solo Ventas",
      full: "Ventas y Compras",
    }
    return labels[type] || type
  },
}
