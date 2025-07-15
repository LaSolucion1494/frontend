import { apiClient } from "../config/api"

export const salesService = {
  // Obtener todas las ventas con filtros y paginación
  async getSales(filters = {}) {
    try {
      console.log("salesService.getSales called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const url = `/sales?${params.toString()}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Response received:", response.data)

      if (response.data.success) {
        const salesWithClientNames = response.data.data.map((sale) => ({
          ...sale,
          cliente_nombre: sale.cliente_nombre || "Cliente no especificado",
        }))

        console.log("Processed sales data:", salesWithClientNames.length, "sales")
        return {
          success: true,
          data: salesWithClientNames,
          pagination: response.data.pagination,
        }
      } else {
        // Verificar si la respuesta es un array directamente (compatibilidad con versión anterior)
        const salesData = Array.isArray(response.data) ? response.data : []
        if (salesData.length > 0) {
          const salesWithClientNames = salesData.map((sale) => ({
            ...sale,
            cliente_nombre: sale.cliente_nombre || "Cliente no especificado",
          }))

          console.log("Processed sales data (legacy format):", salesWithClientNames.length, "sales")
          return { success: true, data: salesWithClientNames, pagination: null }
        }

        return {
          success: false,
          message: response.data.message || "Error al obtener ventas",
          error: response.data,
          data: [],
          pagination: null,
        }
      }
    } catch (error) {
      console.error("Error in salesService.getSales:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas",
        error: error.response?.data,
        data: [],
        pagination: null,
      }
    }
  },

  // Obtener estadísticas de ventas
  async getSalesStats(filters = {}) {
    try {
      console.log("salesService.getSalesStats called with filters:", filters)

      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const url = `/sales/stats?${params.toString()}`
      console.log("Making stats request to:", url)

      const response = await apiClient.get(url)
      console.log("Stats response received:", response.data)

      // Procesar las estadísticas para asegurar que tengan la estructura correcta
      const statsData = response.data

      // Asegurar que las estadísticas tengan valores por defecto
      const processedStats = {
        totalVentas: statsData.estadisticas_generales?.total_ventas || 0,
        montoTotal: statsData.estadisticas_generales?.total_facturado || 0,
        promedioVenta: statsData.estadisticas_generales?.promedio_venta || 0,
        ventasCompletadas: statsData.estadisticas_generales?.ventas_completadas || 0,
        ventasAnuladas: statsData.estadisticas_generales?.ventas_anuladas || 0,
        ventasPendientes: statsData.estadisticas_generales?.ventas_pendientes || 0,
        ventasCuentaCorriente: statsData.estadisticas_generales?.ventas_cuenta_corriente || 0,
        totalCuentaCorriente: statsData.estadisticas_generales?.total_cuenta_corriente || 0,
        ventas_por_dia: statsData.ventas_por_dia || [],
        top_clientes: statsData.top_clientes || [],
        metodos_pago: statsData.metodos_pago || [],
      }

      console.log("Processed stats:", processedStats)
      return { success: true, data: processedStats }
    } catch (error) {
      console.error("Error in salesService.getSalesStats:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Obtener una venta por ID
  async getSaleById(id) {
    try {
      console.log("salesService.getSaleById called with ID:", id)

      const saleId = Number.parseInt(id)
      if (!id || isNaN(saleId) || saleId < 1) {
        console.error("ID de venta inválido:", id)
        return {
          success: false,
          message: "ID de venta inválido",
        }
      }

      const url = `/sales/${saleId}`
      console.log("Making request to:", url)

      const response = await apiClient.get(url)
      console.log("Sale details response:", response.data)

      const saleData = response.data

      if (!saleData.cliente_nombre) {
        console.warn("La venta no tiene nombre de cliente:", saleData)
        saleData.cliente_nombre = "Cliente no especificado"
      }

      if (!saleData.numero_factura) {
        console.error("La venta no tiene número de factura:", saleData)
        return {
          success: false,
          message: "La venta no tiene número de factura asignado",
        }
      }

      console.log("Processed sale data:", saleData)
      return { success: true, data: saleData }
    } catch (error) {
      console.error("Error in salesService.getSaleById:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener venta",
        error: error.response?.data,
      }
    }
  },

  // Crear una nueva venta
  async createSale(saleData) {
    try {
      console.log("salesService.createSale called with data:", saleData)

      const formattedData = this.formatSaleDataForAPI(saleData)
      console.log("Formatted data for API:", formattedData)

      const response = await apiClient.post("/sales", formattedData)
      console.log("Create sale response:", response.data)

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
      console.error("Error in salesService.createSale:", error)
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
      console.log("salesService.cancelSale called:", { id, motivo })

      const response = await apiClient.patch(`/sales/${id}/cancel`, { motivo })
      console.log("Cancel sale response:", response.data)

      return {
        success: true,
        data: response.data,
        message: "Venta anulada exitosamente",
      }
    } catch (error) {
      console.error("Error in salesService.cancelSale:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al anular venta",
        error: error.response?.data,
      }
    }
  },

  // NUEVO: Entregar productos de una venta pendiente
  async deliverProducts(saleId, deliveries) {
    try {
      console.log("salesService.deliverProducts called:", { saleId, deliveries })
      const response = await apiClient.patch(`/sales/${saleId}/deliver`, { deliveries })
      console.log("Deliver products response:", response.data)
      return {
        success: true,
        data: response.data,
        message: response.data.message || "Productos entregados exitosamente",
      }
    } catch (error) {
      console.error("Error in salesService.deliverProducts:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al entregar productos",
        error: error.response?.data,
      }
    }
  },

  // Obtener resumen del día
  async getTodaySalesSummary() {
    try {
      console.log("salesService.getTodaySalesSummary called")
      const response = await apiClient.get("/sales/daily-summary")
      console.log("Today sales summary response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in salesService.getTodaySalesSummary:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener resumen del día",
        error: error.response?.data,
      }
    }
  },

  // Obtener ventas por cliente
  async getSalesByClient(clientId, limit = 20) {
    try {
      console.log("salesService.getSalesByClient called with clientId:", clientId, "limit:", limit)
      const response = await apiClient.get(`/sales/client/${clientId}?limit=${limit}`)
      console.log("Sales by client response:", response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error("Error in salesService.getSalesByClient:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener ventas del cliente",
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

  // Validar pagos
  validatePayments(payments, totalSale) {
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
      if (Math.abs(totalPagos - totalSale) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total de la venta ($${totalSale.toFixed(2)})`,
        )
      }
    }
    return errors
  },

  // Formatear datos para envío al backend (simplificado)
  formatSaleDataForAPI(saleData) {
    const today = new Date().toISOString().split("T")[0]

    const tienePagoCuentaCorriente = saleData.pagos.some((pago) => pago.tipo === "cuenta_corriente")

    return {
      clienteId: saleData.clienteId || 1,
      productos: saleData.productos.map((product) => ({
        productoId: Number.parseInt(product.productoId),
        cantidad: Number.parseInt(product.cantidad),
        precioUnitario: Number.parseFloat(product.precioUnitario),
        precio_original: Number.parseFloat(product.precio_original || product.precioUnitario),
        discount_percentage: product.discount_percentage || 0,
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

  // Calcular totales de venta (simplificado)
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

  // Get sale status
  getEstadoVenta(estado) {
    switch (estado) {
      case "completada":
        return { label: "Completada", color: "green" }
      case "pendiente":
        return { label: "Pendiente", color: "yellow" }
      case "anulada":
        return { label: "Anulada", color: "red" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Get payment type
  getTipoPago(tipo) {
    switch (tipo) {
      case "efectivo":
        return { label: "Efectivo", icon: "Banknote" }
      case "tarjeta":
        return { label: "Tarjeta", icon: "CreditCard" }
      case "transferencia":
        return { label: "Transferencia", icon: "Smartphone" }
      case "cuenta_corriente":
        return { label: "Cuenta Corriente", icon: "Wallet" }
      case "otro":
        return { label: "Otro", icon: "DollarSign" }
      default:
        return { label: tipo, icon: "HelpCircle" }
    }
  },

  // Can sell on credit
  canSellOnCredit(cliente, montoVenta) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return { canSell: false, message: "El cliente no tiene cuenta corriente habilitada." }
    }

    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito === null || limiteCredito === undefined) {
      return { canSell: true, message: "Límite de crédito ilimitado." }
    }

    const nuevoSaldoPotencial = saldoActual + montoVenta

    if (nuevoSaldoPotencial > limiteCredito) {
      const disponible = limiteCredito - saldoActual
      return {
        canSell: false,
        message: `Excede el límite de crédito. Disponible: ${this.formatCurrency(disponible)}.`,
      }
    }

    return { canSell: true, message: "Puede vender a crédito." }
  },

  // Calculate available credit
  calculateAvailableCredit(cliente) {
    if (!cliente || !cliente.tiene_cuenta_corriente) {
      return 0
    }
    const saldoActual = cliente.saldo_cuenta_corriente || cliente.saldo_actual || 0
    const limiteCredito = cliente.limite_credito

    if (limiteCredito === null || limiteCredito === undefined) {
      return 999999999 // Representa un límite ilimitado
    }

    return limiteCredito - saldoActual
  },

  // Get client credit info
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
