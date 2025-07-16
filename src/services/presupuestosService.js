// presupuestosService.js - ACTUALIZADO PARA FUNCIONAR COMO VENTAS SIN FACTURA
import { apiClient } from "../config/api"

export const presupuestosService = {
  // Crear un nuevo presupuesto (FUNCIONA IGUAL QUE UNA VENTA)
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

  // NUEVO: Anular presupuesto
  async cancelPresupuesto(id, motivo) {
    try {
      console.log("presupuestosService.cancelPresupuesto called:", { id, motivo })

      const response = await apiClient.patch(`/presupuestos/${id}/cancel`, { motivo })
      console.log("Cancel presupuesto response:", response.data)

      return {
        success: true,
        data: response.data,
        message: "Presupuesto anulado exitosamente",
      }
    } catch (error) {
      console.error("Error in presupuestosService.cancelPresupuesto:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular presupuesto",
        error: error.response?.data,
      }
    }
  },

  // NUEVO: Entregar productos de un presupuesto pendiente
  async deliverProducts(presupuestoId, deliveries) {
    try {
      console.log("presupuestosService.deliverProducts called:", { presupuestoId, deliveries })
      const response = await apiClient.patch(`/presupuestos/${presupuestoId}/deliver`, { deliveries })
      console.log("Deliver products response:", response.data)
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Productos entregados exitosamente",
      }
    } catch (error) {
      console.error("Error in presupuestosService.deliverProducts:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al entregar productos",
        error: error.response?.data,
      }
    }
  },

  // NUEVO: Obtener estadísticas de presupuestos
  async getPresupuestosStats(filters = {}) {
    try {
      console.log("presupuestosService.getPresupuestosStats called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const url = `/presupuestos/stats?${params.toString()}`
      console.log("Making stats request to:", url)

      const response = await apiClient.get(url)
      console.log("Stats response received:", response.data)

      const statsData = response.data

      const processedStats = {
        totalPresupuestos: statsData.estadisticas_generales?.total_presupuestos || 0,
        montoTotal: statsData.estadisticas_generales?.total_facturado || 0,
        promedioPresupuesto: statsData.estadisticas_generales?.promedio_presupuesto || 0,
        presupuestosCompletados: statsData.estadisticas_generales?.presupuestos_completados || 0,
        presupuestosAnulados: statsData.estadisticas_generales?.presupuestos_anulados || 0,
        presupuestosPendientes: statsData.estadisticas_generales?.presupuestos_pendientes || 0,
        presupuestosCuentaCorriente: statsData.estadisticas_generales?.presupuestos_cuenta_corriente || 0,
        totalCuentaCorriente: statsData.estadisticas_generales?.total_cuenta_corriente || 0,
      }

      console.log("Processed stats:", processedStats)
      return { success: true, data: processedStats }
    } catch (error) {
      console.error("Error in presupuestosService.getPresupuestosStats:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
        data: null,
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

  // Formatear datos para envío al backend (IGUAL QUE VENTAS)
  formatPresupuestoDataForAPI(presupuestoData) {
    const today = new Date().toISOString().split("T")[0]

    const tienePagoCuentaCorriente = presupuestoData.pagos.some((pago) => pago.tipo === "cuenta_corriente")

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
      pagos: presupuestoData.pagos.map((pago) => ({
        tipo: pago.tipo,
        monto: Number.parseFloat(pago.monto),
        descripcion: pago.descripcion || pago.tipo,
      })),
      tieneCuentaCorriente: tienePagoCuentaCorriente,
    }
  },

  // Validar productos (IGUAL QUE VENTAS)
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

  // Validar pagos (IGUAL QUE VENTAS)
  validatePayments(payments, totalPresupuesto) {
    const errors = []
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
    } else {
      payments.forEach((pago, index) => {
        if (!pago.tipo) {
          errors.push(`Tipo de pago inválido en el pago ${index + 1}`)
        }
        if (!pago.monto || pago.monto <= 0) {
          errors.push(`Monto inválido en el pago ${index + 1}`)
        }
      })

      const totalPagos = payments.reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0)
      if (Math.abs(totalPagos - totalPresupuesto) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total del presupuesto ($${totalPresupuesto.toFixed(2)})`,
        )
      }
    }
    return errors
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

  // Calcular totales de presupuesto (IGUAL QUE VENTAS)
  calculatePresupuestoTotals(productos, descuento = 0, interes = 0) {
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

  // Obtener estado del presupuesto
  getEstadoPresupuesto(estado) {
    switch (estado) {
      case "completado":
        return { label: "Completado", color: "green" }
      case "pendiente":
        return { label: "Pendiente", color: "yellow" }
      case "anulado":
        return { label: "Anulado", color: "red" }
      case "activo":
        return { label: "Activo", color: "blue" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Funciones de cuenta corriente (IGUALES QUE VENTAS)
  canSellOnCredit(cliente, montoPresupuesto) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return { canSell: false, message: "El cliente no tiene cuenta corriente habilitada." }
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito === null || limiteCredito === undefined) {
      return { canSell: true, message: "Límite de crédito ilimitado." }
    }

    const nuevoSaldoPotencial = saldoActual + montoPresupuesto

    if (nuevoSaldoPotencial > limiteCredito) {
      const disponible = limiteCredito - saldoActual
      return {
        canSell: false,
        message: `Excede el límite de crédito. Disponible: ${this.formatCurrency(disponible)}.`,
      }
    }

    return { canSell: true, message: "Puede vender a crédito." }
  },

  calculateAvailableCredit(cliente) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return 0
    }
    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito === null || limiteCredito === undefined) {
      return 999999999
    }

    return limiteCredito - saldoActual
  },

  getClientCreditInfo(cliente) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return {
        tiene_cuenta_corriente: false,
        saldo_actual: 0,
        limite_credito: null,
        saldo_disponible: 0,
        saldo_actual_formatted: this.formatCurrency(0),
        limite_credito_formatted: "N/A",
        saldo_disponible_formatted: this.formatCurrency(0),
      }
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito
    const saldoDisponible = this.calculateAvailableCredit(cliente)

    return {
      tiene_cuenta_corriente: true,
      saldo_actual: saldoActual,
      limite_credito: limiteCredito,
      saldo_disponible: saldoDisponible,
      saldo_actual_formatted: this.formatCurrency(saldoActual),
      limite_credito_formatted:
        limiteCredito !== null && limiteCredito !== undefined ? this.formatCurrency(limiteCredito) : "Ilimitado",
      saldo_disponible_formatted: saldoDisponible === 999999999 ? "Ilimitado" : this.formatCurrency(saldoDisponible),
    }
  },
}
