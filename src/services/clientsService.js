import { apiClient } from "../config/api"

export const clientsService = {
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })
      const response = await apiClient.get(`/clientes?${params.toString()}`)
      return { success: true, data: response.data.data, pagination: response.data.pagination }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener clientes",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  async getById(id) {
    try {
      const response = await apiClient.get(`/clientes/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cliente",
        error: error.response?.data,
      }
    }
  },

  async search(term) {
    try {
      const response = await apiClient.get(`/clientes/search?term=${encodeURIComponent(term)}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al buscar clientes",
        error: error.response?.data,
        data: [],
      }
    }
  },

  async create(clientData) {
    try {
      const formattedData = this.formatClientDataForAPI(clientData)
      const response = await apiClient.post("/clientes", formattedData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al crear cliente",
        error: error.response?.data,
      }
    }
  },

  async update(id, clientData) {
    try {
      const formattedData = this.formatClientDataForAPI(clientData)
      const response = await apiClient.put(`/clientes/${id}`, formattedData)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar cliente",
        error: error.response?.data,
      }
    }
  },

  async toggleStatus(id, activo) {
    try {
      const response = await apiClient.patch(`/clientes/${id}/toggle-status`, { activo })
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al cambiar estado del cliente",
        error: error.response?.data,
      }
    }
  },

  async delete(id) {
    try {
      const response = await apiClient.delete(`/clientes/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al eliminar cliente",
        error: error.response?.data,
      }
    }
  },

  async getCuentaCorriente(clientId, filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })
      const response = await apiClient.get(`/clientes/${clientId}/cuenta-corriente?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cuenta corriente",
        error: error.response?.data,
        data: null,
      }
    }
  },

  async getResumenCuentasCorrientes(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })
      const response = await apiClient.get(`/clientes/cuentas-corrientes/resumen?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen de cuentas corrientes",
        error: error.response?.data,
        data: { cuentas: [], resumen: {} },
      }
    }
  },

  formatClientDataForAPI(clientData) {
    return {
      nombre: clientData.nombre,
      telefono: clientData.telefono || null,
      email: clientData.email || null,
      direccion: clientData.direccion || null,
      cuit: clientData.cuit || null,
      tieneCuentaCorriente: clientData.tieneCuentaCorriente || false,
      limiteCredito: clientData.tieneCuentaCorriente ? clientData.limiteCredito || null : null,
    }
  },

  calculateSaldoDisponible(saldoActual, limiteCredito) {
    if (!limiteCredito) return 999999999
    return Math.max(0, limiteCredito - saldoActual)
  },

  // --- FUNCIÓN isValidCUIT ELIMINADA ---

  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  getEstadoCuenta(client) {
    if (!client.tiene_cuenta_corriente) {
      return { status: "sin_cuenta", label: "Sin cuenta corriente", color: "gray" }
    }
    const saldo = client.saldo_cuenta_corriente || 0
    const limite = client.limite_credito
    if (saldo <= 0.01) {
      return { status: "al_dia", label: "Al día", color: "green" }
    }
    if (limite) {
      const porcentajeUsado = (saldo / limite) * 100
      if (porcentajeUsado >= 90) {
        return { status: "limite_critico", label: "Límite crítico", color: "red" }
      } else if (porcentajeUsado >= 70) {
        return { status: "limite_alto", label: "Límite alto", color: "orange" }
      } else {
        return { status: "con_saldo", label: "Con saldo", color: "yellow" }
      }
    }
    return { status: "con_saldo", label: "Con saldo", color: "yellow" }
  },
}
