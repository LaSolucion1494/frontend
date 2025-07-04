import { apiClient } from "../config/api"

export const purchasesService = {
  // Obtener todas las compras con filtros
  async getPurchases(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras",
        error: error.response?.data,
        data: [],
      }
    }
  },

  // Obtener estadísticas de compras
  async getPurchaseStats(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const response = await apiClient.get(`/purchases/stats?${params.toString()}`)
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

  // Obtener estadísticas de métodos de pago
  async getPurchasePaymentStats(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          if (key === "fechaInicio" || key === "fechaFin") {
            params.append(key, value)
          }
        }
      })

      const response = await apiClient.get(`/purchases/payment-stats?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener estadísticas de pagos",
        error: error.response?.data,
        data: null,
      }
    }
  },

  // Obtener una compra por ID
  async getPurchaseById(id) {
    try {
      const response = await apiClient.get(`/purchases/${id}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compra",
        error: error.response?.data,
      }
    }
  },

  // CORREGIDO: Crear una nueva compra con cálculo correcto de totales
  async createPurchase(purchaseData) {
    try {
      // Validar datos antes de enviar
      this.validatePurchaseData(purchaseData)

      // Formatear datos para el backend
      const formattedData = this.formatPurchaseDataForAPI(purchaseData)

      const response = await apiClient.post("/purchases", formattedData)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Compra creada exitosamente",
      }
    } catch (error) {
      console.error("Error al crear compra:", error)
      console.error("Respuesta del servidor:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Error al crear compra",
        error: error.response?.data,
      }
    }
  },

  // Resto de métodos sin cambios...
  async receivePurchaseItems(purchaseId, receiveData) {
    try {
      const response = await apiClient.post(`/purchases/${purchaseId}/receive`, receiveData)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Productos recibidos exitosamente",
      }
    } catch (error) {
      console.error("Error al recibir productos:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al recibir productos",
        error: error.response?.data,
      }
    }
  },

  async updatePurchaseStatus(purchaseId, statusData) {
    try {
      const response = await apiClient.put(`/purchases/${purchaseId}/status`, statusData)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Estado actualizado exitosamente",
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al actualizar estado",
        error: error.response?.data,
      }
    }
  },

  async cancelPurchase(purchaseId) {
    try {
      const response = await apiClient.put(`/purchases/${purchaseId}/cancel`)
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Compra cancelada exitosamente",
      }
    } catch (error) {
      console.error("Error al cancelar compra:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al cancelar compra",
        error: error.response?.data,
      }
    }
  },

  async getPurchasesBySupplier(supplierId, limit = 20) {
    try {
      const response = await apiClient.get(`/purchases/supplier/${supplierId}?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras del proveedor",
        error: error.response?.data,
        data: [],
      }
    }
  },

  async getRecentPurchases(limit = 10) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        order: "fecha_compra",
        direction: "DESC",
      })

      const response = await apiClient.get(`/purchases?${params.toString()}`)
      return { success: true, data: response.data }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras recientes",
        error: error.response?.data,
        data: [],
      }
    }
  },

  async getTodayPurchasesSummary() {
    try {
      const response = await apiClient.get("/purchases/summary/today")
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

  // CORREGIDO: Validar datos de compra con cálculo correcto
  validatePurchaseData(purchaseData) {
    const errors = []

    // Validar productos
    if (!purchaseData.productos || !Array.isArray(purchaseData.productos) || purchaseData.productos.length === 0) {
      errors.push("Debe incluir al menos un producto")
    } else {
      purchaseData.productos.forEach((producto, index) => {
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

    // Validar pagos
    if (!purchaseData.pagos || !Array.isArray(purchaseData.pagos) || purchaseData.pagos.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
    } else {
      purchaseData.pagos.forEach((pago, index) => {
        if (!pago.tipo) {
          errors.push(`Tipo de pago inválido en el pago ${index + 1}`)
        }
        if (!pago.monto || pago.monto <= 0) {
          errors.push(`Monto inválido en el pago ${index + 1}`)
        }
      })

      // CORREGIDO: Validar que el total de pagos coincide con el total final
      const totalPagos = purchaseData.pagos.reduce((sum, pago) => sum + Number.parseFloat(pago.monto), 0)
      const totalFinal = purchaseData.total // Este ya viene calculado correctamente desde el formulario


      if (Math.abs(totalPagos - totalFinal) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total final de la compra ($${totalFinal.toFixed(2)})`,
        )
      }
    }

    // Validar montos
    if (purchaseData.subtotal === undefined || purchaseData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (purchaseData.total === undefined || purchaseData.total <= 0) {
      errors.push("Total inválido")
    }

    // Validar descuento e interés
    if (purchaseData.descuento !== undefined && purchaseData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (purchaseData.interes !== undefined && purchaseData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    // Validar proveedor
    if (!purchaseData.proveedorId || purchaseData.proveedorId < 1) {
      errors.push("Debe seleccionar un proveedor")
    }

    if (errors.length > 0) {
      throw new Error(errors[0])
    }

    return true
  },

  // CORREGIDO: Formatear datos para envío al backend
  formatPurchaseDataForAPI(purchaseData) {
    const today = new Date().toISOString().split("T")[0]

    // Calcular valores correctamente
    const subtotal = Number.parseFloat(purchaseData.subtotal)
    const descuento = Number.parseFloat(purchaseData.descuento || 0)
    const interes = Number.parseFloat(purchaseData.interes || 0)
    const total = Number.parseFloat(purchaseData.total)


    return {
      proveedorId: Number.parseInt(purchaseData.proveedorId),
      detalles: purchaseData.productos.map((producto) => ({
        productoId: Number.parseInt(producto.productoId),
        cantidad: Number.parseInt(producto.cantidad),
        precioUnitario: Number.parseFloat(producto.precioUnitario),
      })),
      subtotal: subtotal,
      descuento: descuento,
      interes: interes, // NUEVO: Incluir interés
      total: total,
      observaciones: purchaseData.observaciones || "",
      fechaCompra: purchaseData.fechaCompra || today,
      recibirInmediatamente: purchaseData.recibirInmediatamente || false,
      pagos: purchaseData.pagos.map((pago) => ({
        tipo: pago.tipo,
        monto: Number.parseFloat(pago.monto),
        descripcion: pago.descripcion || pago.tipo,
      })),
    }
  },

  // Obtener tipos de pago disponibles para compras
  getPaymentTypes() {
    return [
      { value: "efectivo", label: "Efectivo" },
      { value: "transferencia", label: "Transferencia" },
      { value: "tarjeta_credito", label: "Tarjeta Crédito" },
      { value: "tarjeta_debito", label: "Tarjeta Débito" },
      { value: "otro", label: "Otro" },
    ]
  },

  // CORREGIDO: Calcular totales de compra
  calculatePurchaseTotals(productos, descuento = 0, interes = 0) {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + producto.cantidad * producto.precioUnitario
    }, 0)

    const descuentoAmount = Number.parseFloat(descuento)
    const interesAmount = Number.parseFloat(interes)
    const total = subtotal - descuentoAmount + interesAmount

    return {
      subtotal: Number.parseFloat(subtotal.toFixed(2)),
      descuento: Number.parseFloat(descuentoAmount.toFixed(2)),
      interes: Number.parseFloat(interesAmount.toFixed(2)),
      total: Number.parseFloat(Math.max(0, total).toFixed(2)),
    }
  },

  // Formatear compra para mostrar en UI
  formatPurchaseForDisplay(purchase) {
    return {
      ...purchase,
      subtotal_formatted: this.formatCurrency(purchase.subtotal),
      descuento_formatted: this.formatCurrency(purchase.descuento),
      interes_formatted: this.formatCurrency(purchase.interes || 0),
      total_formatted: this.formatCurrency(purchase.total),
      estado_formatted: this.getEstadoCompra(purchase.estado),
      fecha_compra_formatted: this.formatDate(purchase.fecha_compra),
    }
  },

  // Obtener estado formateado de compra
  getEstadoCompra(estado) {
    switch (estado) {
      case "pendiente":
        return { label: "Pendiente", color: "yellow" }
      case "recibida":
        return { label: "Recibida", color: "green" }
      case "parcial":
        return { label: "Parcial", color: "blue" }
      case "cancelada":
        return { label: "Cancelada", color: "red" }
      default:
        return { label: estado, color: "gray" }
    }
  },

  // Obtener tipo de pago formateado
  getTipoPago(tipo) {
    const tipos = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      tarjeta_credito: "Tarjeta Crédito",
      tarjeta_debito: "Tarjeta Débito",
      otro: "Otro",
    }
    return tipos[tipo] || tipo
  },

  // Formatear fecha
  formatDate(dateString) {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  },

  // Formatear moneda
  formatCurrency(amount) {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  },

  // Validar productos antes de crear compra
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
    })

    return errors
  },

  // CORREGIDO: Validar métodos de pago
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

    // Verificar que el total de pagos coincida con el total final
    // Usamos una tolerancia de 0.01 para evitar problemas de redondeo
    if (Math.abs(totalPagos - total) > 0.01) {
      errors.push(`El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total final ($${total.toFixed(2)})`)
    }

    return errors
  },

  // CORREGIDO: Preparar datos de compra desde el formulario
  preparePurchaseDataFromForm(formData, cartProducts, payments, proveedorSeleccionado, recibirInmediatamente = false) {
    // Convertir productos del carrito al formato esperado por la API
    const productos = cartProducts.map((product) => ({
      productoId: product.id,
      cantidad: product.quantity,
      precioUnitario: product.precio_costo,
    }))

    // Convertir pagos al formato esperado por la API
    const pagos = payments.map((payment) => ({
      tipo: payment.type,
      monto: Number.parseFloat(payment.amount),
      descripcion: payment.description || "",
    }))

    // CORREGIDO: Calcular subtotal, descuento e interés correctamente
    const subtotal = formData.subtotal
    let descuento = 0
    let interes = 0

    if (formData.interestDiscount > 0) {
      if (formData.isInterest) {
        // Es un interés
        interes =
          formData.interestDiscountType === "percentage"
            ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
            : Number.parseFloat(formData.interestDiscount)
      } else {
        // Es un descuento
        descuento =
          formData.interestDiscountType === "percentage"
            ? (subtotal * Number.parseFloat(formData.interestDiscount)) / 100
            : Number.parseFloat(formData.interestDiscount)
      }
    }

    // IMPORTANTE: Usar el total final del formulario que ya incluye intereses/descuentos
    const totalFinal = formData.total

    // Crear objeto de compra
    return {
      proveedorId: proveedorSeleccionado?.id || 1,
      productos,
      subtotal,
      descuento,
      interes, // NUEVO: Incluir interés
      total: totalFinal,
      observaciones: formData.notes || "",
      fechaCompra: formData.fechaCompra || new Date().toISOString().split("T")[0],
      recibirInmediatamente,
      pagos,
      // Información adicional para validaciones
      selectedSupplier: proveedorSeleccionado,
    }
  },
}
