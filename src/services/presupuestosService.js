import { apiClient } from "../config/api"

export const presupuestosService = {
  // Crear un nuevo presupuesto
  async createPresupuesto(presupuestoData) {
    try {
      console.log("presupuestosService.createPresupuesto called with data:", presupuestoData)

      const formattedData = this.formatPresupuestoDataForAPI(presupuestoData)
      console.log("Formatted data for API:", formattedData)

      const response = await apiClient.post("/presupuestos", formattedData)
      console.log("Create presupuesto response:", response.data)

      const responseData = response.data
      const presupuestoId = responseData.data?.id || responseData.id
      const numeroPresupuesto = responseData.data?.numeroPresupuesto || responseData.numeroPresupuesto

      if (!presupuestoId) {
        console.error("No se recibió ID de presupuesto en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el ID del presupuesto creado",
        }
      }

      if (!numeroPresupuesto) {
        console.error("No se recibió número de presupuesto en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el número de presupuesto",
        }
      }

      return {
        success: true,
        data: {
          ...responseData,
          id: presupuestoId,
          numeroPresupuesto: numeroPresupuesto,
        },
        message: responseData?.message || "Presupuesto creado exitosamente",
      }
    } catch (error) {
      console.error("Error in presupuestosService.createPresupuesto:", error)
      console.error("Respuesta del servidor:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear presupuesto",
        error: error.response?.data,
      }
    }
  },

  // Obtener un presupuesto por ID
  async getPresupuestoById(id) {
    try {
      console.log("presupuestosService.getPresupuestoById called with ID:", id)

      const presupuestoId = Number.parseInt(id)
      if (!id || isNaN(presupuestoId) || presupuestoId < 1) {
        console.error("ID de presupuesto inválido:", id)
        return {
          success: false,
          message: "ID de presupuesto inválido",
        }
      }

      const url = `/presupuestos/${presupuestoId}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Presupuesto details response:", response.data)

      const presupuestoData = response.data

      if (!presupuestoData.cliente_nombre) {
        console.warn("El presupuesto no tiene nombre de cliente:", presupuestoData)
        presupuestoData.cliente_nombre = "Cliente no especificado"
      }

      if (!presupuestoData.numero_presupuesto) {
        console.error("El presupuesto no tiene número asignado:", presupuestoData)
        return {
          success: false,
          message: "El presupuesto no tiene número asignado",
        }
      }

      console.log("Processed presupuesto data:", presupuestoData)
      return { success: true, data: presupuestoData }
    } catch (error) {
      console.error("Error in presupuestosService.getPresupuestoById:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener presupuesto",
        error: error.response?.data,
      }
    }
  },

  // Obtener todos los presupuestos con filtros
  async getPresupuestos(filters = {}) {
    try {
      console.log("presupuestosService.getPresupuestos called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const url = `/presupuestos?${params.toString()}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Response received:", response.data)

      if (response.data.success) {
        const presupuestosWithClientNames = response.data.data.map((presupuesto) => ({
          ...presupuesto,
          cliente_nombre: presupuesto.cliente_nombre || "Cliente no especificado",
        }))

        console.log("Processed presupuestos data:", presupuestosWithClientNames.length, "presupuestos")
        return {
          success: true,
          data: presupuestosWithClientNames,
          pagination: response.data.pagination,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener presupuestos",
          error: response.data,
          data: [],
          pagination: null,
        }
      }
    } catch (error) {
      console.error("Error in presupuestosService.getPresupuestos:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener presupuestos",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Actualizar estado del presupuesto
  async updatePresupuestoEstado(id, estado, observaciones = "") {
    try {
      console.log("presupuestosService.updatePresupuestoEstado called:", { id, estado, observaciones })

      const response = await apiClient.patch(`/presupuestos/${id}/estado`, { estado, observaciones })
      console.log("Update estado response:", response.data)

      return {
        success: true,
        data: response.data,
        message: "Estado actualizado exitosamente",
      }
    } catch (error) {
      console.error("Error in presupuestosService.updatePresupuestoEstado:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar estado",
        error: error.response?.data,
      }
    }
  },

  // Formatear datos para envío al backend
  formatPresupuestoDataForAPI(presupuestoData) {
    const today = new Date().toISOString().split("T")[0]

    return {
      clienteId: presupuestoData.clienteId || 1,
      productos: presupuestoData.productos.map((product) => ({
        productoId: Number.parseInt(product.productoId),
        cantidad: Number.parseInt(product.cantidad),
        precioUnitario: Number.parseFloat(product.precioUnitario),
        precio_original: Number.parseFloat(product.precio_original || product.precioUnitario),
        discount_percentage: product.discount_active ? product.discount_percentage : 0,
      })),
      subtotal: Number.parseFloat(presupuestoData.subtotal),
      descuento: Number.parseFloat(presupuestoData.descuento || 0),
      interes: Number.parseFloat(presupuestoData.interes || 0),
      total: Number.parseFloat(presupuestoData.total),
      observaciones: presupuestoData.observaciones || "",
      fechaPresupuesto: presupuestoData.fechaPresupuesto || today,
      validezDias: presupuestoData.validezDias || 30,
      pagos: presupuestoData.pagos.map((pago) => ({
        tipo: pago.tipo,
        monto: Number.parseFloat(pago.monto),
        descripcion: pago.descripcion || pago.tipo,
      })),
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

  // Obtener estado del presupuesto
  getEstadoPresupuesto(estado) {
    switch (estado) {
      case "activo":
        return { label: "Activo", color: "green" }
      case "convertido":
        return { label: "Convertido", color: "blue" }
      case "vencido":
        return { label: "Vencido", color: "red" }
      case "cancelado":
        return { label: "Cancelado", color: "gray" }
      default:
        return { label: estado, color: "gray" }
    }
  },
}
