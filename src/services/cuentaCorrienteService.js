import { apiClient } from "../config/api"

export const cuentaCorrienteService = {
  // Obtener resumen general de cuentas corrientes CON PAGINACIÓN
  async getResumen(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente?${params.toString()}`)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          pagination: response.data.pagination || null,
        }
      } else {
        return { success: true, data: response.data, pagination: null }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen de cuenta corriente",
        error: error.response?.data,
        data: null,
        pagination: null,
      }
    }
  },

  // Registrar un pago de cuenta corriente
  async registrarPago(pagoData) {
    try {
      const formattedData = {
        cliente_id: pagoData.cliente_id,
        monto: Number.parseFloat(pagoData.monto),
        fecha_pago: pagoData.fecha_pago || new Date().toISOString().split("T")[0],
        comprobante: pagoData.comprobante || "",
        notas: pagoData.notas || "",
      }
      const response = await apiClient.post("/cuenta-corriente/pagos", formattedData)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          message: response.data.message || "Pago registrado exitosamente",
        }
      } else {
        return {
          success: true,
          data: response.data.data,
          message: "Pago registrado exitosamente",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al registrar pago",
        error: error.response?.data,
      }
    }
  },

  // Obtener todos los pagos con filtros Y PAGINACIÓN
  async getPagos(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/pagos?${params.toString()}`)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          pagination: response.data.pagination || null,
        }
      } else {
        return { success: true, data: response.data, pagination: null }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener pagos",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Obtener pagos de un cliente específico CON PAGINACIÓN
  async getPagosByClient(clientId, filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/client/${clientId}/pagos?${params.toString()}`)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          pagination: response.data.pagination || null,
        }
      } else {
        return { success: true, data: response.data, pagination: null }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener pagos del cliente",
        error: error.response?.data,
        data: { cliente: null, pagos: [] },
        pagination: null,
      }
    }
  },

  // Obtener movimientos de cuenta corriente de un cliente CON PAGINACIÓN
  async getMovimientosByClient(clientId, filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/cuenta-corriente/client/${clientId}/movimientos?${params.toString()}`)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          pagination: response.data.pagination || null,
        }
      } else {
        return { success: true, data: response.data, pagination: null }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener movimientos del cliente",
        error: error.response?.data,
        data: { cliente: null, movimientos: [] },
        pagination: null,
      }
    }
  },

  // Obtener un pago por ID
  async getPagoById(id) {
    try {
      const response = await apiClient.get(`/cuenta-corriente/pagos/${id}`)

      if (response.data.success !== undefined) {
        return { success: response.data.success, data: response.data.data }
      } else {
        return { success: true, data: response.data }
      }
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

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          message: response.data.message || "Pago anulado exitosamente",
        }
      } else {
        return {
          success: true,
          data: response.data.data,
          message: "Pago anulado exitosamente",
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular pago",
        error: error.response?.data,
      }
    }
  },

  // Crear ajuste manual
  async crearAjuste(ajusteData) {
    try {
      const formattedData = {
        cliente_id: ajusteData.cliente_id,
        tipo: ajusteData.tipo,
        monto: Number.parseFloat(ajusteData.monto),
        concepto: ajusteData.concepto,
        notas: ajusteData.notas || "",
      }

      const response = await apiClient.post("/cuenta-corriente/ajustes", formattedData)

      if (response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          message: response.data.message || "Ajuste registrado exitosamente",
        }
      } else {
        return {
          success: true,
          data: response.data.data,
          message: "Ajuste registrado exitosamente",
        }
      }
    } catch (error) {
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

      if (response.data.success !== undefined) {
        return { success: response.data.success, data: response.data.data }
      } else {
        return { success: true, data: response.data }
      }
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

  // Formatear fecha usando tiempo local
  formatDate(date) {
    if (!date) return ""

    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return "Fecha inválida"

      return dateObj.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Error de formato"
    }
  },

  // Formatear fecha y hora usando tiempo local
  formatDateTime(date) {
    if (!date) return ""

    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return "Fecha inválida"

      return dateObj.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    } catch (error) {
      console.error("Error al formatear fecha y hora:", error)
      return "Error de formato"
    }
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

  // Obtener tipos de ajuste
  getAdjustmentTypes() {
    return [
      {
        value: "aumentar_saldo",
        label: "Aumentar Saldo",
        description: "Aumenta la deuda del cliente (ej: recargo, interés, compra)",
        color: "red",
      },
      {
        value: "disminuir_saldo",
        label: "Disminuir Saldo",
        description: "Disminuye la deuda del cliente (ej: descuento, bonificación)",
        color: "green",
      },
    ]
  },
}
