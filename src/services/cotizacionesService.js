import { apiClient } from "../config/api"

export const cotizacionesService = {
  // Obtener todas las cotizaciones con filtros y paginación
  async getCotizaciones(filters = {}) {
    try {
      console.log("cotizacionesService.getCotizaciones called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const url = `/cotizaciones?${params.toString()}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Response received:", response.data)

      if (response.data.success) {
        const cotizacionesWithClientNames = response.data.data.map((cotizacion) => ({
          ...cotizacion,
          cliente_nombre: cotizacion.cliente_nombre || "Cliente no especificado",
        }))

        console.log("Processed cotizaciones data:", cotizacionesWithClientNames.length, "cotizaciones")
        return {
          success: true,
          data: cotizacionesWithClientNames,
          pagination: response.data.pagination,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener cotizaciones",
          error: response.data,
          data: [],
          pagination: null,
        }
      }
    } catch (error) {
      console.error("Error in cotizacionesService.getCotizaciones:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cotizaciones",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Obtener estadísticas de cotizaciones
  async getCotizacionesStats(filters = {}) {
    try {
      console.log("cotizacionesService.getCotizacionesStats called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const url = `/cotizaciones/stats?${params.toString()}`
      console.log("Making stats request to:", url)

      const response = await apiClient.get(url)
      console.log("Stats response received:", response.data)

      const statsData = response.data

      const processedStats = {
        totalCotizaciones: statsData.estadisticas_generales?.total_cotizaciones || 0,
        totalCotizado: statsData.estadisticas_generales?.total_cotizado || 0,
        promedioCotizacion: statsData.estadisticas_generales?.promedio_cotizacion || 0,
        cotizacionesActivas: statsData.estadisticas_generales?.cotizaciones_activas || 0,
        cotizacionesAceptadas: statsData.estadisticas_generales?.cotizaciones_aceptadas || 0,
        cotizacionesRechazadas: statsData.estadisticas_generales?.cotizaciones_rechazadas || 0,
        cotizacionesVencidas: statsData.estadisticas_generales?.cotizaciones_vencidas || 0,
        cotizacionesAnuladas: statsData.estadisticas_generales?.cotizaciones_anuladas || 0,
        totalAceptado: statsData.estadisticas_generales?.total_aceptado || 0,
        cotizaciones_por_dia: statsData.cotizaciones_por_dia || [],
        top_clientes: statsData.top_clientes || [],
        estados_cotizaciones: statsData.estados_cotizaciones || [],
      }

      console.log("Processed stats:", processedStats)
      return { success: true, data: processedStats }
    } catch (error) {
      console.error("Error in cotizacionesService.getCotizacionesStats:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Obtener una cotización por ID
  async getCotizacionById(id) {
    try {
      console.log("cotizacionesService.getCotizacionById called with ID:", id)

      const cotizacionId = Number.parseInt(id)
      if (!id || isNaN(cotizacionId) || cotizacionId < 1) {
        console.error("ID de cotización inválido:", id)
        return {
          success: false,
          message: "ID de cotización inválido",
        }
      }

      const url = `/cotizaciones/${cotizacionId}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Cotizacion details response:", response.data)

      const cotizacionData = response.data

      if (!cotizacionData.cliente_nombre) {
        console.warn("La cotización no tiene nombre de cliente:", cotizacionData)
        cotizacionData.cliente_nombre = "Cliente no especificado"
      }

      if (!cotizacionData.numero_cotizacion) {
        console.error("La cotización no tiene número de cotización:", cotizacionData)
        return {
          success: false,
          message: "La cotización no tiene número de cotización asignado",
        }
      }

      console.log("Processed cotizacion data:", cotizacionData)
      return { success: true, data: cotizacionData }
    } catch (error) {
      console.error("Error in cotizacionesService.getCotizacionById:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cotización",
        error: error.response?.data,
      }
    }
  },

  // Crear una nueva cotización
  async createCotizacion(cotizacionData) {
    try {
      console.log("cotizacionesService.createCotizacion called with data:", cotizacionData)

      const formattedData = this.formatCotizacionDataForAPI(cotizacionData)
      console.log("Formatted data for API:", formattedData)

      const response = await apiClient.post("/cotizaciones", formattedData)
      console.log("Create cotizacion response:", response.data)

      const responseData = response.data
      const cotizacionId = responseData.data?.id || responseData.id
      const numeroCotizacion = responseData.data?.numeroCotizacion || responseData.numeroCotizacion

      if (!cotizacionId) {
        console.error("No se recibió ID de cotización en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el ID de la cotización creada",
        }
      }

      if (!numeroCotizacion) {
        console.error("No se recibió número de cotización en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el número de cotización",
        }
      }

      return {
        success: true,
        data: {
          ...responseData,
          id: cotizacionId,
          numeroCotizacion: numeroCotizacion,
        },
        message: responseData?.message || "Cotización creada exitosamente",
      }
    } catch (error) {
      console.error("Error in cotizacionesService.createCotizacion:", error)
      console.error("Respuesta del servidor:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear cotización",
        error: error.response?.data,
      }
    }
  },

  // Actualizar cotización
  async updateCotizacion(id, updateData) {
    try {
      console.log("cotizacionesService.updateCotizacion called:", { id, updateData })

      const response = await apiClient.put(`/cotizaciones/${id}`, updateData)
      console.log("Update cotizacion response:", response.data)

      return {
        success: true,
        data: response.data,
        message: "Cotización actualizada exitosamente",
      }
    } catch (error) {
      console.error("Error in cotizacionesService.updateCotizacion:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar cotización",
        error: error.response?.data,
      }
    }
  },

  // Actualizar estado de cotización
  async updateCotizacionStatus(id, estado, motivo = "") {
    try {
      console.log("cotizacionesService.updateCotizacionStatus called:", { id, estado, motivo })

      const response = await apiClient.patch(`/cotizaciones/${id}/status`, { estado, motivo })
      console.log("Update status response:", response.data)

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Estado actualizado exitosamente",
      }
    } catch (error) {
      console.error("Error in cotizacionesService.updateCotizacionStatus:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar estado",
        error: error.response?.data,
      }
    }
  },

  // Anular cotización
  async cancelCotizacion(id, motivo) {
    try {
      console.log("cotizacionesService.cancelCotizacion called:", { id, motivo })

      const response = await apiClient.patch(`/cotizaciones/${id}/cancel`, { motivo })
      console.log("Cancel cotizacion response:", response.data)

      return {
        success: true,
        data: response.data,
        message: "Cotización anulada exitosamente",
      }
    } catch (error) {
      console.error("Error in cotizacionesService.cancelCotizacion:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular cotización",
        error: error.response?.data,
      }
    }
  },

  // Convertir cotización a presupuesto
  async convertToPresupuesto(id) {
    try {
      console.log("cotizacionesService.convertToPresupuesto called with ID:", id)

      const response = await apiClient.post(`/cotizaciones/${id}/convert-to-presupuesto`)
      console.log("Convert to presupuesto response:", response.data)

      return {
        success: true,
        data: response.data,
        message: response.data.message || "Cotización convertida a presupuesto exitosamente",
      }
    } catch (error) {
      console.error("Error in cotizacionesService.convertToPresupuesto:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al convertir cotización",
        error: error.response?.data,
      }
    }
  },

  // Obtener cotizaciones por cliente
  async getCotizacionesByClient(clientId, limit = 20) {
    try {
      console.log("cotizacionesService.getCotizacionesByClient called with clientId:", clientId, "limit:", limit)
      const response = await apiClient.get(`/cotizaciones/client/${clientId}?limit=${limit}`)
      console.log("Cotizaciones by client response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in cotizacionesService.getCotizacionesByClient:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener cotizaciones del cliente",
        error: error.response?.data,
      }
    }
  },

  // Validar productos
  validateProducts(products) {
    const errors = []
    if (!products || !Array.isArray(products) || products.length === 0) {
      errors.push("Debe incluir al menos un producto")
    } else {
      products.forEach((producto, index) => {
        if (!producto.productoId || producto.productoId < 1) {
          errors.push(`Producto inválido en la posición ${index + 1}`)
        }
        if (!producto.cantidad || producto.cantidad < 1) {
          errors.push(`Cantidad inválida en el producto ${index + 1}`)
        }
        if (producto.precioUnitario === undefined || producto.precioUnitario < 0) {
          errors.push(`Precio unitario inválido en el producto ${index + 1}`)
        }
      })
    }
    return errors
  },

  // Formatear datos para envío al backend
  formatCotizacionDataForAPI(cotizacionData) {
    const today = new Date().toISOString().split("T")[0]

    return {
      clienteId: cotizacionData.clienteId || 1,
      productos: cotizacionData.productos.map((product) => ({
        productoId: Number.parseInt(product.productoId),
        cantidad: Number.parseInt(product.cantidad),
        precioUnitario: Number.parseFloat(product.precioUnitario),
        precio_original: Number.parseFloat(product.precio_original || product.precioUnitario),
        discount_percentage: product.discount_active ? product.discount_percentage : 0,
        descripcion_personalizada: product.descripcion_personalizada || null,
      })),
      subtotal: Number.parseFloat(cotizacionData.subtotal),
      descuento: Number.parseFloat(cotizacionData.descuento || 0),
      interes: Number.parseFloat(cotizacionData.interes || 0),
      total: Number.parseFloat(cotizacionData.total),
      observaciones: cotizacionData.observaciones || "",
      condicionesComerciales: cotizacionData.condicionesComerciales || "",
      tiempoEntrega: cotizacionData.tiempoEntrega || "",
      fechaCotizacion: cotizacionData.fechaCotizacion || today,
      fechaVencimiento: cotizacionData.fechaVencimiento || null,
      validezDias: Number.parseInt(cotizacionData.validezDias || 30),
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

  // Calcular totales de cotización
  calculateCotizacionTotals(productos, descuento = 0, interes = 0) {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + producto.cantidad * producto.precioUnitario
    }, 0)

    const total = subtotal + interes - descuento

    return {
      subtotal: Number.parseFloat(subtotal.toFixed(2)),
      descuento: Number.parseFloat(descuento.toFixed(2)),
      interes: Number.parseFloat(interes.toFixed(2)),
      total: Number.parseFloat(Math.max(0, total).toFixed(2)),
    }
  },

  // Get cotizacion status
  getEstadoCotizacion(estado) {
    switch (estado) {
      case "activa":
        return { label: "Activa", color: "blue" }
      case "aceptada":
        return { label: "Aceptada", color: "green" }
      case "rechazada":
        return { label: "Rechazada", color: "red" }
      case "vencida":
        return { label: "Vencida", color: "orange" }
      case "anulada":
        return { label: "Anulada", color: "gray" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Verificar si cotización está vencida
  isCotizacionVencida(fechaVencimiento) {
    if (!fechaVencimiento) return false
    const today = new Date()
    const vencimiento = new Date(fechaVencimiento)
    return vencimiento < today
  },

  // Calcular días restantes
  getDiasRestantes(fechaVencimiento) {
    if (!fechaVencimiento) return null
    const today = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diffTime = vencimiento - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  },
}
