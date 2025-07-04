import { apiClient } from "../config/api"

export const clientsService = {
  // Obtener todos los clientes con filtros opcionales (ACTUALIZADO para estructura simplificada)
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/clientes?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener clientes",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener un cliente por ID (ACTUALIZADO para estructura simplificada)
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

  // Buscar clientes (para autocompletado) (ACTUALIZADO para estructura simplificada)
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

  // Crear un nuevo cliente (ACTUALIZADO para estructura simplificada)
  async create(clientData) {
    try {
      // Formatear datos para la nueva estructura
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

  // Actualizar un cliente (ACTUALIZADO para estructura simplificada)
  async update(id, clientData) {
    try {
      // Formatear datos para la nueva estructura
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

  // Cambiar estado de un cliente (No requiere cambios)
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

  // Eliminar un cliente (No requiere cambios)
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

  // FUNCIONES PARA CUENTA CORRIENTE ACTUALIZADAS PARA ESTRUCTURA SIMPLIFICADA

  // Obtener cuenta corriente de un cliente (ACTUALIZADO)
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

  // Obtener resumen de todas las cuentas corrientes (ACTUALIZADO)
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

  // NUEVA FUNCIÓN: Formatear datos del cliente para la API
  formatClientDataForAPI(clientData) {
    return {
      nombre: clientData.nombre,
      telefono: clientData.telefono || null,
      email: clientData.email || null,
      direccion: clientData.direccion || null,
      cuit: clientData.cuit || null,
      notas: clientData.notas || null,
      // Campos de cuenta corriente integrados
      tieneCuentaCorriente: clientData.tieneCuentaCorriente || false,
      limiteCredito: clientData.tieneCuentaCorriente ? clientData.limiteCredito || null : null,
    }
  },

  // NUEVA FUNCIÓN: Calcular saldo disponible
  calculateSaldoDisponible(saldoActual, limiteCredito) {
    if (!limiteCredito) return 999999999 // Sin límite
    return Math.max(0, limiteCredito - saldoActual)
  },

  // NUEVA FUNCIÓN: Validar CUIT
  isValidCUIT(cuit) {
    // Remover guiones y espacios
    const cleanCuit = cuit.replace(/[-\s]/g, "")

    // Verificar que tenga 11 dígitos
    if (!/^\d{11}$/.test(cleanCuit)) {
      return false
    }

    // Validar dígito verificador
    const digits = cleanCuit.split("").map(Number)
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

    let sum = 0
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * multipliers[i]
    }

    const remainder = sum % 11
    const checkDigit = remainder < 2 ? remainder : 11 - remainder

    return checkDigit === digits[10]
  },

  // Formatear moneda (No requiere cambios)
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  // NUEVA FUNCIÓN: Obtener estado de cuenta
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
