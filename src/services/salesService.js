import { apiClient } from "../config/api"

export const salesService = {
  // Obtener todas las ventas con filtros
  async getSales(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/sales?${params.toString()}`)

      // Asegurarse de que cada venta tenga un nombre de cliente
      const salesWithClientNames = response.data.map((sale) => ({
        ...sale,
        cliente_nombre: sale.cliente_nombre || "Cliente no especificado",
      }))

      return { success: true, data: salesWithClientNames }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener estadísticas de ventas
  async getSalesStats(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const response = await apiClient.get(`/sales/stats?${params.toString()}`)
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

  // CORREGIDO: Obtener una venta por ID con mejor manejo de errores y logging
  async getSaleById(id) {
    try {
      const saleId = Number.parseInt(id)
      if (!id || isNaN(saleId) || saleId < 1) {
        console.error("ID de venta inválido:", id)
        return {
          success: false,
          message: "ID de venta inválido",
        }
      }

      const response = await apiClient.get(`/sales/${saleId}`)

      // Asegurarse de que la respuesta incluye el nombre del cliente
      if (!response.data.cliente_nombre) {
        console.warn("La venta no tiene nombre de cliente:", response.data)
        response.data.cliente_nombre = "Cliente no especificado"
      }

      // CORREGIDO: Verificar que la respuesta contiene el número de factura
      if (!response.data.numero_factura) {
        console.error("La venta no tiene número de factura:", response.data)
        return {
          success: false,
          message: "La venta no tiene número de factura asignado",
        }
      }

      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error en getSaleById:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener venta",
        error: error.response?.data,
      }
    }
  },

  // CORREGIDO: Crear una nueva venta con mejor manejo de respuesta y logging
  async createSale(saleData) {
    try {
      this.validateSaleData(saleData)

      const formattedData = this.formatSaleDataForAPI(saleData)

      const response = await apiClient.post("/sales", formattedData)

      // CORREGIDO: Verificar que la respuesta contiene el número de factura
      const responseData = response.data
      const saleId = responseData.data?.id || responseData.id
      const numeroFactura = responseData.data?.numeroFactura || responseData.numeroFactura

      if (!saleId) {
        console.error("No se recibió ID de venta en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el ID de la venta creada",
        }
      }

      if (!numeroFactura) {
        console.error("No se recibió número de factura en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el número de factura",
        }
      }

      return {
        success: true,
        data: {
          ...responseData,
          id: saleId,
          numeroFactura: numeroFactura,
        },
        message: responseData?.message || "Venta creada exitosamente",
      }
    } catch (error) {
      console.error("Error al crear venta:", error)
      console.error("Respuesta del servidor:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear venta",
        error: error.response?.data,
      }
    }
  },

  // Anular una venta
  async cancelSale(id, motivo) {
    try {
      const response = await apiClient.patch(`/sales/${id}/cancel`, { motivo })
      return {
        success: true,
        data: response.data,
        message: "Venta anulada exitosamente",
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular venta",
        error: error.response?.data,
      }
    }
  },

  // Obtener ventas por cliente
  async getSalesByClient(clientId, limit = 20) {
    try {
      const response = await apiClient.get(`/sales/client/${clientId}?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas del cliente",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener ventas recientes
  async getRecentSales(limit = 10) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        order: "fecha_venta",
        direction: "DESC",
      })

      const response = await apiClient.get(`/sales?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas recientes",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener ventas por rango de fechas
  async getSalesByDateRange(startDate, endDate, additionalFilters = {}) {
    try {
      const filters = {
        fecha_inicio: startDate,
        fecha_fin: endDate,
        ...additionalFilters,
      }

      return await this.getSales(filters)
    } catch (error) {
      return {
        success: false,
        message: "Error al obtener ventas por rango de fechas",
        data: [],
      }
    }
  },

  // Obtener resumen de ventas del día
  async getTodaySalesSummary() {
    try {
      const response = await apiClient.get("/sales/summary/today")
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen del día",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Validar datos de venta
  validateSaleData(saleData) {
    const errors = []

    if (!saleData.productos || !Array.isArray(saleData.productos) || saleData.productos.length === 0) {
      errors.push("Debe incluir al menos un producto")
    } else {
      saleData.productos.forEach((producto, index) => {
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

    if (!saleData.pagos || !Array.isArray(saleData.pagos) || saleData.pagos.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
    } else {
      saleData.pagos.forEach((pago, index) => {
        if (!pago.tipo) {
          errors.push(`Tipo de pago inválido en el pago ${index + 1}`)
        }
        if (!pago.monto || pago.monto <= 0) {
          errors.push(`Monto inválido en el pago ${index + 1}`)
        }
      })

      const totalPagos = saleData.pagos.reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0)
      if (Math.abs(totalPagos - saleData.total) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total de la venta ($${saleData.total.toFixed(2)})`,
        )
      }
    }

    if (saleData.subtotal === undefined || saleData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (saleData.total === undefined || saleData.total <= 0) {
      errors.push("Total inválido")
    }

    if (saleData.descuento !== undefined && saleData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (saleData.interes !== undefined && saleData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    const tienePagoCuentaCorriente = saleData.pagos?.some((pago) => pago.tipo === "cuenta_corriente")
    if (tienePagoCuentaCorriente) {
      if (!saleData.clienteId || saleData.clienteId === 1) {
        errors.push("Para pagar con cuenta corriente debe seleccionar un cliente registrado")
      }

      if (saleData.selectedClient && !saleData.selectedClient.tiene_cuenta_corriente) {
        errors.push("El cliente seleccionado no tiene cuenta corriente habilitada")
      }

      if (saleData.selectedClient && saleData.selectedClient.limite_credito) {
        const montoCuentaCorriente = saleData.pagos
          .filter((pago) => pago.tipo === "cuenta_corriente")
          .reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0)

        const saldoActual = saleData.selectedClient.saldo_cuenta_corriente || saleData.selectedClient.saldo_actual || 0
        const nuevoSaldo = saldoActual + montoCuentaCorriente

        if (nuevoSaldo > saleData.selectedClient.limite_credito) {
          const disponible = saleData.selectedClient.limite_credito - saldoActual
          errors.push(`El monto excede el límite de crédito disponible. Disponible: $${disponible.toFixed(2)}`)
        }
      }

      if (saleData.selectedClient && saleData.selectedClient.saldo_disponible !== undefined) {
        const montoCuentaCorriente = saleData.pagos
          .filter((pago) => pago.tipo === "cuenta_corriente")
          .reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0)

        if (montoCuentaCorriente > saleData.selectedClient.saldo_disponible) {
          errors.push(
            `El monto excede el saldo disponible en cuenta corriente: $${saleData.selectedClient.saldo_disponible.toFixed(2)}`,
          )
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(errors[0])
    }

    return true
  },

  // Formatear datos para envío al backend
  formatSaleDataForAPI(saleData) {
    const today = new Date().toISOString().split("T")[0]

    const tienePagoCuentaCorriente = saleData.pagos.some((pago) => pago.tipo === "cuenta_corriente")

    return {
      clienteId: saleData.clienteId || 1,
      productos: saleData.productos.map((producto) => ({
        productoId: Number.parseInt(producto.productoId),
        cantidad: Number.parseInt(producto.cantidad),
        precioUnitario: Number.parseFloat(producto.precioUnitario),
        precio_original: Number.parseFloat(producto.precio_original || producto.precioUnitario),
        discount_percentage: producto.discount_percentage || 0,
      })),
      subtotal: Number.parseFloat(saleData.subtotal),
      descuento: Number.parseFloat(saleData.descuento || 0),
      interes: Number.parseFloat(saleData.interes || 0),
      total: Number.parseFloat(saleData.total),
      observaciones: saleData.observaciones || "",
      fechaVenta: saleData.fechaVenta || today,
      pagos: saleData.pagos.map((pago) => ({
        tipo: pago.tipo,
        monto: Number.parseFloat(pago.monto),
        descripcion: pago.descripcion || pago.tipo,
      })),
      tieneCuentaCorriente: tienePagoCuentaCorriente,
    }
  },

  // Obtener tipos de pago disponibles
  getPaymentTypes() {
    return [
      { value: "efectivo", label: "Efectivo" },
      { value: "tarjeta", label: "Tarjeta" },
      { value: "transferencia", label: "Transferencia" },
      { value: "cuenta_corriente", label: "Cuenta Corriente" },
      { value: "otro", label: "Otro" },
    ]
  },

  // Obtener tipo de pago formateado
  getTipoPago(tipo) {
    const tipos = {
      efectivo: "Efectivo",
      tarjeta: "Tarjeta",
      transferencia: "Transferencia",
      cuenta_corriente: "Cuenta Corriente",
      otro: "Otro",
    }
    return tipos[tipo] || tipo
  },

  // Calcular totales de venta
  calculateSaleTotals(productos, descuento = 0, interes = 0) {
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

  // Formatear venta para mostrar en UI
  formatSaleForDisplay(sale) {
    return {
      ...sale,
      subtotal_formatted: this.formatCurrency(sale.subtotal),
      descuento_formatted: this.formatCurrency(sale.descuento),
      interes_formatted: this.formatCurrency(sale.interes),
      total_formatted: this.formatCurrency(sale.total),
      estado_formatted: this.getEstadoVenta(sale.estado),
      fecha_venta_formatted: this.formatDate(sale.fecha_venta),
    }
  },

  // Obtener estado formateado de venta
  getEstadoVenta(estado) {
    switch (estado) {
      case "completada":
        return { label: "Completada", color: "green" }
      case "anulada":
        return { label: "Anulada", color: "red" }
      case "pendiente":
        return { label: "Pendiente", color: "yellow" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Formatear fecha
  formatDate(dateString) {
    if (!dateString) return ""

    const date = new Date(dateString)
    // Asegurarse de usar la fecha exacta sin ajustes de zona horaria
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  },

  // Formatear hora
  formatTime(dateString) {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  // Formatear moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  // Formatear fecha de creación
  formatCreationDate(dateString) {
    if (!dateString) return ""

    const date = new Date(dateString)
    // Asegurarse de usar la fecha exacta sin ajustes de zona horaria
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  },

  // Formatear hora de creación
  formatCreationTime(dateString) {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  // Formatear fecha y hora de creación
  formatCreationDateTime(dateString) {
    if (!dateString) return ""

    return `${this.formatCreationDate(dateString)} ${this.formatCreationTime(dateString)}`
  },

  // Verificar si un cliente puede realizar una venta con cuenta corriente
  canSellOnCredit(cliente, montoVenta) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return {
        can: false,
        reason: "El cliente no tiene cuenta corriente habilitada",
      }
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito) {
      const nuevoSaldo = saldoActual + Number.parseFloat(montoVenta)

      if (nuevoSaldo > limiteCredito) {
        const disponible = limiteCredito - saldoActual
        return {
          can: false,
          reason: `El monto excede el límite de crédito. Disponible: ${this.formatCurrency(disponible)}`,
          disponible: disponible,
        }
      }
    }

    return { can: true }
  },

  // Calcular saldo disponible para cuenta corriente
  calculateAvailableCredit(cliente) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return 0
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (!limiteCredito) {
      return 999999999 // Sin límite
    }

    return Math.max(0, limiteCredito - saldoActual)
  },

  // Obtener información de cuenta corriente del cliente
  getClientCreditInfo(cliente) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return {
        hasCredit: false,
        currentBalance: 0,
        creditLimit: 0,
        availableCredit: 0,
        status: "sin_cuenta",
      }
    }

    const currentBalance = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const creditLimit = cliente.limite_credito || 0
    const availableCredit = this.calculateAvailableCredit(cliente)

    let status = "al_dia"
    if (currentBalance > 0) {
      if (creditLimit && currentBalance / creditLimit >= 0.9) {
        status = "limite_critico"
      } else if (creditLimit && currentBalance / creditLimit >= 0.7) {
        status = "limite_alto"
      } else {
        status = "con_saldo"
      }
    }

    return {
      hasCredit: true,
      currentBalance,
      creditLimit,
      availableCredit,
      status,
      currentBalance_formatted: this.formatCurrency(currentBalance),
      creditLimit_formatted: creditLimit ? this.formatCurrency(creditLimit) : "Sin límite",
      availableCredit_formatted: availableCredit === 999999999 ? "Sin límite" : this.formatCurrency(availableCredit),
    }
  },

  // Validar productos antes de crear venta
  validateProducts(productos) {
    const errors = []

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      errors.push("Debe incluir al menos un producto")
      return errors
    }

    productos.forEach((producto, index) => {
      if (!producto.productoId) {
        errors.push(`Debe seleccionar un producto en la posición ${index + 1}`)
      }

      if (!producto.cantidad || producto.cantidad <= 0) {
        errors.push(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`)
      }

      if (producto.precioUnitario === undefined || producto.precioUnitario < 0) {
        errors.push(`El precio unitario no puede ser negativo en el producto ${index + 1}`)
      }

      if (producto.stock !== undefined && producto.cantidad > producto.stock) {
        errors.push(
          `Stock insuficiente para ${producto.nombre || `producto ${index + 1}`}. Disponible: ${producto.stock}`,
        )
      }
    })

    return errors
  },

  // Validar métodos de pago
  validatePayments(pagos, total) {
    const errors = []

    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
      return errors
    }

    let totalPagos = 0

    pagos.forEach((pago, index) => {
      if (!pago.tipo) {
        errors.push(`Debe seleccionar un tipo de pago en el pago ${index + 1}`)
      }

      if (!pago.monto || pago.monto <= 0) {
        errors.push(`El monto debe ser mayor a 0 en el pago ${index + 1}`)
      }

      totalPagos += Number.parseFloat(pago.monto || 0)
    })

    if (Math.abs(totalPagos - total) > 0.01) {
      errors.push(
        `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total de la venta ($${total.toFixed(2)})`,
      )
    }

    return errors
  },
}
