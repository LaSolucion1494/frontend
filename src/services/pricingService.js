import { API_URL } from "../config"

class PricingService {
  // Obtener configuración de precios desde el endpoint de configuración general
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

      // Mapear y validar la configuración
      const pricingConfig = {
        rentabilidad: this.parseNumber(config.rentabilidad, 40),
        iva: this.parseNumber(config.iva, 21),
        ingresos_brutos: this.parseNumber(config.ingresos_brutos, 0),
        otros_impuestos: this.parseNumber(config.otros_impuestos, 0),
        stock_minimo: this.parseNumber(config.stock_minimo_default, 5),
      }

      console.log("Configuración de precios obtenida:", pricingConfig)
      return pricingConfig
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

  // Función auxiliar para parsear números de forma segura
  parseNumber(value, defaultValue) {
    if (value === null || value === undefined || value === "") {
      return defaultValue
    }

    const parsed = Number(value)
    if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) {
      console.warn(`Valor inválido para configuración: ${value}, usando valor por defecto: ${defaultValue}`)
      return defaultValue
    }

    return parsed
  }

  // Calcular precio de venta con LÓGICA ACTUALIZADA DE OTROS IMPUESTOS INCLUIDOS
  calculateSalePrice(costPrice, config) {
    if (!costPrice || costPrice <= 0) return 0

    try {
      const rentabilidad = this.parseNumber(config?.rentabilidad, 40)
      const iva = this.parseNumber(config?.iva, 21)
      const ingresosBrutos = this.parseNumber(config?.ingresos_brutos, 0)
      const otrosImpuestos = this.parseNumber(config?.otros_impuestos, 0)

      console.log("Calculando precio con configuración:", { rentabilidad, iva, ingresosBrutos, otrosImpuestos })

      // LÓGICA DE CÁLCULO ACTUALIZADA:

      // 1. Calcular IVA directamente sobre el costo base
      const ivaMonto = costPrice * (iva / 100)

      // 2. Calcular ingresos brutos directamente sobre el costo base
      const ingresosBrutosMonto = costPrice * (ingresosBrutos / 100)

      // 3. Sumar costo + IVA + ingresos brutos = precio nuevo
      const precioNuevo = costPrice + ivaMonto + ingresosBrutosMonto

      // 4. Calcular rentabilidad sobre el precio nuevo
      const rentabilidadMonto = precioNuevo * (rentabilidad / 100)

      // 5. Sumar rentabilidad al precio nuevo
      const precioConRentabilidad = precioNuevo + rentabilidadMonto

      // 6. Aplicar otros impuestos INCLUIDOS en el precio final
      let precioFinal = precioConRentabilidad

      if (otrosImpuestos > 0 && otrosImpuestos < 100) {
        // Fórmula: precio / (1 - (otros_impuestos / 100))
        const divisor = 1 - otrosImpuestos / 100
        precioFinal = precioConRentabilidad / divisor
      }

      const resultado = Math.round(precioFinal * 100) / 100
      console.log("Precio calculado:", { costPrice, precioFinal: resultado })

      return resultado
    } catch (error) {
      console.error("Error calculando precio:", error)
      return 0
    }
  }

  // Obtener desglose detallado del precio con LÓGICA ACTUALIZADA DE OTROS IMPUESTOS INCLUIDOS
  getPriceBreakdown(costPrice, config) {
    if (!costPrice || costPrice <= 0) {
      return {
        costo: 0,
        iva: 0,
        ingresosBrutos: 0,
        precioNuevo: 0,
        rentabilidad: 0,
        precioConRentabilidad: 0,
        otrosImpuestosIncluidos: 0,
        precioFinal: 0,
      }
    }

    const rentabilidad = this.parseNumber(config?.rentabilidad, 40)
    const iva = this.parseNumber(config?.iva, 21)
    const ingresosBrutos = this.parseNumber(config?.ingresos_brutos, 0)
    const otrosImpuestos = this.parseNumber(config?.otros_impuestos, 0)

    // LÓGICA DE CÁLCULO ACTUALIZADA CON DESGLOSE DETALLADO:

    // 1. Calcular IVA directamente sobre el costo base
    const ivaMonto = costPrice * (iva / 100)

    // 2. Calcular ingresos brutos directamente sobre el costo base
    const ingresosBrutosMonto = costPrice * (ingresosBrutos / 100)

    // 3. Sumar costo + IVA + ingresos brutos = precio nuevo
    const precioNuevo = costPrice + ivaMonto + ingresosBrutosMonto

    // 4. Calcular rentabilidad sobre el precio nuevo
    const rentabilidadMonto = precioNuevo * (rentabilidad / 100)

    // 5. Sumar rentabilidad al precio nuevo
    const precioConRentabilidad = precioNuevo + rentabilidadMonto

    // 6. Aplicar otros impuestos INCLUIDOS en el precio final
    let precioFinal = precioConRentabilidad
    let otrosImpuestosIncluidos = 0

    if (otrosImpuestos > 0 && otrosImpuestos < 100) {
      // Fórmula: precio / (1 - (otros_impuestos / 100))
      const divisor = 1 - otrosImpuestos / 100
      precioFinal = precioConRentabilidad / divisor

      // Calcular el monto de otros impuestos incluidos
      otrosImpuestosIncluidos = precioFinal - precioConRentabilidad
    }

    return {
      costo: Math.round(costPrice * 100) / 100,
      iva: Math.round(ivaMonto * 100) / 100,
      ingresosBrutos: Math.round(ingresosBrutosMonto * 100) / 100,
      precioNuevo: Math.round(precioNuevo * 100) / 100,
      rentabilidad: Math.round(rentabilidadMonto * 100) / 100,
      precioConRentabilidad: Math.round(precioConRentabilidad * 100) / 100,
      otrosImpuestosIncluidos: Math.round(otrosImpuestosIncluidos * 100) / 100,
      precioFinal: Math.round(precioFinal * 100) / 100,
    }
  }

  // Actualizar precio de producto
  async updateProductPrice(productId, newCostPrice, newSalePrice) {
    try {
      const response = await fetch(`${API_URL}/products/${productId}/prices`, {
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
