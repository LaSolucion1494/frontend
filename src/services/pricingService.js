import { API_URL } from "../config"

class PricingService {
  // Obtener configuración de precios
  async getPricingConfig() {
    try {
      const response = await fetch(`${API_URL}/config`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener configuración de precios")
      }

      const config = await response.json()
      return {
        rentabilidad: config.rentabilidad || 40,
        iva: config.iva || 21,
        ingresos_brutos: config.ingresos_brutos || 0,
        otros_impuestos: config.otros_impuestos || 0,
        stock_minimo: config.stock_minimo || 5,
      }
    } catch (error) {
      console.error("Error obteniendo configuración:", error)
      // Devolver configuración por defecto
      return {
        rentabilidad: 40,
        iva: 21,
        ingresos_brutos: 0,
        otros_impuestos: 0,
        stock_minimo: 5,
      }
    }
  }

  // Calcular precio de venta
  calculateSalePrice(costPrice, config) {
    if (!costPrice || costPrice <= 0) return 0

    try {
      const rentabilidad = config.rentabilidad || 40
      const iva = config.iva || 21
      const ingresosBrutos = config.ingresos_brutos || 0
      const otrosImpuestos = config.otros_impuestos || 0

      // Calcular rentabilidad sobre el costo
      const rentabilidadMonto = costPrice * (rentabilidad / 100)

      // Calcular impuestos sobre el costo
      const ingresosBrutosMonto = costPrice * (ingresosBrutos / 100)
      const otrosImpuestosMonto = costPrice * (otrosImpuestos / 100)

      // Precio neto (sin IVA)
      const precioNeto = costPrice + rentabilidadMonto + ingresosBrutosMonto + otrosImpuestosMonto

      // IVA sobre precio neto
      const ivaMonto = precioNeto * (iva / 100)

      // Precio final
      const precioFinal = precioNeto + ivaMonto

      return Math.round(precioFinal * 100) / 100
    } catch (error) {
      console.error("Error calculando precio:", error)
      return 0
    }
  }

  // Obtener desglose detallado del precio
  getPriceBreakdown(costPrice, config) {
    if (!costPrice || costPrice <= 0) {
      return {
        costo: 0,
        rentabilidad: 0,
        ingresosBrutos: 0,
        otrosImpuestos: 0,
        precioNeto: 0,
        iva: 0,
        precioFinal: 0,
      }
    }

    const rentabilidad = config.rentabilidad || 40
    const iva = config.iva || 21
    const ingresosBrutos = config.ingresos_brutos || 0
    const otrosImpuestos = config.otros_impuestos || 0

    const rentabilidadMonto = costPrice * (rentabilidad / 100)
    const ingresosBrutosMonto = costPrice * (ingresosBrutos / 100)
    const otrosImpuestosMonto = costPrice * (otrosImpuestos / 100)
    const precioNeto = costPrice + rentabilidadMonto + ingresosBrutosMonto + otrosImpuestosMonto
    const ivaMonto = precioNeto * (iva / 100)
    const precioFinal = precioNeto + ivaMonto

    return {
      costo: Math.round(costPrice * 100) / 100,
      rentabilidad: Math.round(rentabilidadMonto * 100) / 100,
      ingresosBrutos: Math.round(ingresosBrutosMonto * 100) / 100,
      otrosImpuestos: Math.round(otrosImpuestosMonto * 100) / 100,
      precioNeto: Math.round(precioNeto * 100) / 100,
      iva: Math.round(ivaMonto * 100) / 100,
      precioFinal: Math.round(precioFinal * 100) / 100,
    }
  }

  // Actualizar precio de producto
  async updateProductPrice(productId, newCostPrice, newSalePrice) {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/price`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          precio_costo: newCostPrice,
          precio_venta: newSalePrice,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar precio del producto")
      }

      return await response.json()
    } catch (error) {
      console.error("Error actualizando precio:", error)
      throw error
    }
  }
}

export default new PricingService()
