import { apiClient } from "../config/api"

export const purchasesService = {
  // Obtener todas las compras con filtros y paginación
  async getPurchases(filters = {}) {
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "todos") {
          params.append(key, value)
        }
      })

      const response = await apiClient.get(`/purchases?${params.toString()}`)

      if (response.data.success) {
        const purchasesWithProviderNames = response.data.data.map((purchase) => ({
          ...purchase,
          proveedor_nombre: purchase.proveedor_nombre || "Sin Proveedor",
        }))

        return {
          success: true,
          data: purchasesWithProviderNames,
          pagination: response.data.pagination,
        }
      } else {
        return {
          success: false,
          message: response.data.message || "Error al obtener compras",
          data: [],
          pagination: null,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compras",
        error: error.response?.data,
        data: [],
        pagination: null,
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

  // Obtener una compra por ID
  async getPurchaseById(id) {
    try {
      const purchaseId = Number.parseInt(id)
      if (!id || isNaN(purchaseId) || purchaseId < 1) {
        console.error("ID de compra inválido:", id)
        return {
          success: false,
          message: "ID de compra inválido",
        }
      }

      const response = await apiClient.get(`/purchases/${purchaseId}`)

      // CORREGIDO: La respuesta del backend ya viene con la estructura correcta
      const purchaseData = response.data.data || response.data

      // Validar que la respuesta tenga los datos necesarios
      if (!purchaseData) {
        console.error("No se recibieron datos de la compra:", response.data)
        return {
          success: false,
          message: "No se recibieron datos de la compra",
        }
      }

      // CORREGIDO: Asegurar que tenga nombre de proveedor (puede ser "Sin Proveedor")
      if (!purchaseData.proveedor_nombre) {
        purchaseData.proveedor_nombre = "Sin Proveedor"
      }

      // CORREGIDO: Validar que tenga número de compra
      if (!purchaseData.numero_compra) {
        console.error("La compra no tiene número de compra:", purchaseData)
        return {
          success: false,
          message: "La compra no tiene número de compra asignado",
        }
      }

      return { success: true, data: purchaseData }
    } catch (error) {
      console.error("Error en getPurchaseById:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Error al obtener compra",
        error: error.response?.data,
      }
    }
  },

  // Crear una nueva compra
  async createPurchase(purchaseData) {
    try {
      this.validatePurchaseData(purchaseData)

      const formattedData = this.formatPurchaseDataForAPI(purchaseData)

      const response = await apiClient.post("/purchases", formattedData)

      const responseData = response.data
      const purchaseId = responseData.data?.id || responseData.id
      const numeroCompra = responseData.data?.numeroCompra || responseData.numeroCompra

      if (!purchaseId) {
        console.error("No se recibió ID de compra en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el ID de la compra creada",
        }
      }

      if (!numeroCompra) {
        console.error("No se recibió número de compra en la respuesta:", responseData)
        return {
          success: false,
          message: "Error: No se pudo obtener el número de compra",
        }
      }

      return {
        success: true,
        data: {
          ...responseData,
          id: purchaseId,
          numeroCompra: numeroCompra,
        },
        message: responseData?.message || "Compra creada exitosamente",
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

  // Recibir productos de compra
  async receivePurchaseItems(id, receiveData) {
    try {
      const response = await apiClient.post(`/purchases/${id}/receive`, receiveData)
      return {
        success: true,
        data: response.data,
        message: "Productos recibidos exitosamente",
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al recibir productos",
        error: error.response?.data,
      }
    }
  },

  // Cancelar compra
  async cancelPurchase(id, motivo) {
    try {
      const response = await apiClient.patch(`/purchases/${id}/cancel`, { motivo })
      return {
        success: true,
        data: response.data,
        message: "Compra cancelada exitosamente",
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al cancelar compra",
        error: error.response?.data,
      }
    }
  },

  // Validar datos de compra
  validatePurchaseData(purchaseData) {
    const errors = []

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

    if (!purchaseData.pagos || !Array.isArray(purchaseData.pagos) || purchaseData.pagos.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
    } else {
      purchaseData.pagos.forEach((pago, index) => {
        if (!pago.tipo) {
          errors.push(`Tipo de pago inválido en el pago ${index + 1}`)
        }
        const monto = pago.monto || pago.amount
        if (!monto || Number.parseFloat(monto) <= 0) {
          errors.push(`Monto inválido en el pago ${index + 1}`)
        }
      })

      const totalPagos = purchaseData.pagos.reduce((sum, pago) => {
        const monto = pago.monto || pago.amount
        return sum + Number.parseFloat(monto || 0)
      }, 0)

      if (Math.abs(totalPagos - purchaseData.total) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total de la compra ($${purchaseData.total.toFixed(2)})`,
        )
      }
    }

    if (purchaseData.subtotal === undefined || purchaseData.subtotal < 0) {
      errors.push("Subtotal inválido")
    }

    if (purchaseData.total === undefined || purchaseData.total <= 0) {
      errors.push("Total inválido")
    }

    if (purchaseData.descuento !== undefined && purchaseData.descuento < 0) {
      errors.push("El descuento no puede ser negativo")
    }

    if (purchaseData.interes !== undefined && purchaseData.interes < 0) {
      errors.push("El interés no puede ser negativo")
    }

    if (errors.length > 0) {
      throw new Error(errors[0])
    }

    return true
  },

  // Validar productos
  validateProducts(productos) {
    const errors = []

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      errors.push("Debe incluir al menos un producto")
      return errors
    }

    productos.forEach((producto, index) => {
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

    return errors
  },

  // Validar pagos
  validatePayments(pagos, total) {
    const errors = []

    if (!pagos || !Array.isArray(pagos) || pagos.length === 0) {
      errors.push("Debe incluir al menos un método de pago")
      return errors
    }

    pagos.forEach((pago, index) => {
      if (!pago.tipo && !pago.type) {
        errors.push(`Tipo de pago inválido en el pago ${index + 1}`)
      }
      const monto = pago.monto || pago.amount
      if (!monto || Number.parseFloat(monto) <= 0) {
        errors.push(`Monto inválido en el pago ${index + 1}`)
      }
    })

    if (total > 0) {
      const totalPagos = pagos.reduce((sum, pago) => {
        const monto = pago.monto || pago.amount
        return sum + Number.parseFloat(monto || 0)
      }, 0)

      if (Math.abs(totalPagos - total) > 0.01) {
        errors.push(
          `El total de pagos ($${totalPagos.toFixed(2)}) no coincide con el total de la compra ($${total.toFixed(2)})`,
        )
      }
    }

    return errors
  },

  // Formatear datos para envío al backend
  formatPurchaseDataForAPI(purchaseData) {
    const today = new Date().toISOString().split("T")[0]

    return {
      proveedorId: purchaseData.proveedorId || 1,
      productos: purchaseData.productos.map((producto) => ({
        productoId: Number.parseInt(producto.productoId),
        cantidad: Number.parseInt(producto.cantidad),
        precioUnitario: Number.parseFloat(producto.precioUnitario),
      })),
      subtotal: Number.parseFloat(purchaseData.subtotal),
      descuento: Number.parseFloat(purchaseData.descuento || 0),
      interes: Number.parseFloat(purchaseData.interes || 0),
      total: Number.parseFloat(purchaseData.total),
      observaciones: purchaseData.observaciones || "",
      fechaCompra: purchaseData.fechaCompra || today,
      pagos: purchaseData.pagos.map((pago) => ({
        tipo: pago.tipo,
        monto: Number.parseFloat(pago.monto),
        descripcion: pago.descripcion || pago.tipo,
      })),
      recibirInmediatamente: purchaseData.recibirInmediatamente || false,
    }
  },

  // Obtener tipos de pago disponibles
  getPaymentTypes() {
    return [
      { value: "efectivo", label: "Efectivo" },
      { value: "transferencia", label: "Transferencia" },
      { value: "tarjeta_credito", label: "Tarjeta Crédito" },
      { value: "tarjeta_debito", label: "Tarjeta Débito" },
      { value: "otro", label: "Otro" },
    ]
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

  // Obtener estado de compra formateado
  getEstadoCompra(estado) {
    const estados = {
      pendiente: "Pendiente",
      parcial: "Parcial",
      recibida: "Recibida",
      cancelada: "Cancelada",
    }
    return estados[estado] || estado
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
    if (!date) return ""
    return new Date(date).toLocaleDateString("es-AR")
  },

  // Calcular totales de compra
  calculatePurchaseTotals(productos, descuento = 0, interes = 0) {
    const subtotal = productos.reduce((sum, producto) => {
      return sum + (producto.cantidad || 0) * (producto.precioUnitario || producto.precio_costo || 0)
    }, 0)

    const total = subtotal - Number.parseFloat(descuento) + Number.parseFloat(interes)

    return {
      subtotal,
      total: Math.max(0, total),
    }
  },
}
