"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Trash2, Plus, Minus } from "lucide-react"

const ProductCard = ({ product, onUpdateQuantity, onRemove, onUpdatePrice, formatCurrency, config }) => {
  // Estado para los impuestos - ahora usando config
  const [impuestos, setImpuestos] = useState({
    iva_activo: true,
    ingresos_brutos_activo: true,
    iva_porcentaje: config?.iva || 21,
    ingresos_brutos_porcentaje: config?.ingresos_brutos || 0,
  })

  // Add a discount state to the component's state
  const [discount, setDiscount] = useState({
    active: false,
    percentage: 0,
  })

  const [precioCalculado, setPrecioCalculado] = useState(product.precio_venta)

  // Precio original con todos los impuestos (guardado al inicio)
  const [precioOriginal] = useState(product.precio_venta)

  // Precio base sin ningún impuesto (calculado una sola vez)
  const [precioBase, setPrecioBase] = useState(0)

  // Actualizar porcentajes cuando cambie la configuración
  useEffect(() => {
    if (config) {
      setImpuestos((prev) => ({
        ...prev,
        iva_porcentaje: config.iva || 21,
        ingresos_brutos_porcentaje: config.ingresos_brutos || 0,
      }))
    }
  }, [config])

  // Calcular el precio base (sin impuestos) al inicializar
  useEffect(() => {
    if (config) {
      const base = calcularPrecioBase(precioOriginal, config.iva || 21, config.ingresos_brutos || 0)
      setPrecioBase(base)
    }
  }, [precioOriginal, config])

  // Calcular precio base (sin impuestos)
  const calcularPrecioBase = (precioCompleto, ivaPorcentaje, ibPorcentaje) => {
    // Primero quitamos ingresos brutos, luego IVA
    const sinIB = precioCompleto / (1 + ibPorcentaje / 100)
    const sinIVA = sinIB / (1 + ivaPorcentaje / 100)
    return sinIVA
  }

  // Calcular precio final basado en toggles activos
  const calcularPrecioFinal = () => {
    // Siempre partimos del precio base (sin impuestos)
    let precioFinal = precioBase

    // Aplicar IVA si está activo
    if (impuestos.iva_activo) {
      precioFinal = precioFinal * (1 + impuestos.iva_porcentaje / 100)
    }

    // Aplicar ingresos brutos si está activo
    if (impuestos.ingresos_brutos_activo) {
      precioFinal = precioFinal * (1 + impuestos.ingresos_brutos_porcentaje / 100)
    }

    // Aplicar descuento si está activo
    if (discount.active && discount.percentage > 0) {
      precioFinal = precioFinal * (1 - discount.percentage / 100)
    }

    return Math.round(precioFinal * 100) / 100
  }

  // Recalcular precio cuando cambian los impuestos
  useEffect(() => {
    if (precioBase > 0) {
      const nuevoPrecio = calcularPrecioFinal()
      setPrecioCalculado(nuevoPrecio)

      // Actualizar el precio en el carrito
      onUpdatePrice(product.id, {
        precio_venta: nuevoPrecio,
        iva_activo: impuestos.iva_activo,
        ingresos_brutos_activo: impuestos.ingresos_brutos_activo,
        iva_porcentaje: impuestos.iva_porcentaje,
        ingresos_brutos_porcentaje: impuestos.ingresos_brutos_porcentaje,
        discount_active: discount.active,
        discount_percentage: discount.percentage,
      })
    }
  }, [impuestos.iva_activo, impuestos.ingresos_brutos_activo, discount.active, discount.percentage, precioBase])

  const toggleIva = () => {
    setImpuestos((prev) => ({
      ...prev,
      iva_activo: !prev.iva_activo,
    }))
  }

  const toggleIngresosBrutos = () => {
    setImpuestos((prev) => ({
      ...prev,
      ingresos_brutos_activo: !prev.ingresos_brutos_activo,
    }))
  }

  const toggleDiscount = () => {
    setDiscount((prev) => ({
      ...prev,
      active: !prev.active,
    }))
  }

  const updateDiscountPercentage = (e) => {
    const value = Number.parseFloat(e.target.value) || 0
    setDiscount((prev) => ({
      ...prev,
      percentage: value,
    }))
  }

  // Manejar el foco en el campo de descuento
  const handleDiscountFocus = (e) => {
    // Seleccionar todo el texto cuando se enfoca
    e.target.select()
  }

  // Calcular montos de impuestos para mostrar
  const calcularMontoIva = () => {
    const precioSinIva =
      precioBase * (impuestos.ingresos_brutos_activo ? 1 + impuestos.ingresos_brutos_porcentaje / 100 : 1)
    return precioSinIva * (impuestos.iva_porcentaje / 100)
  }

  const calcularMontoIB = () => {
    return precioBase * (impuestos.ingresos_brutos_porcentaje / 100)
  }

  const calcularMontoDescuento = () => {
    let precioSinDescuento = precioBase

    if (impuestos.iva_activo) {
      precioSinDescuento = precioSinDescuento * (1 + impuestos.iva_porcentaje / 100)
    }

    if (impuestos.ingresos_brutos_activo) {
      precioSinDescuento = precioSinDescuento * (1 + impuestos.ingresos_brutos_porcentaje / 100)
    }

    return discount.active && discount.percentage > 0 ? precioSinDescuento * (discount.percentage / 100) : 0
  }

  return (
    <div className="bg-gray-200 border border-gray-400 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header del producto */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-base leading-tight">{product.nombre}</h4>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                  <span className="font-mono">#{product.codigo}</span>
                  <span>•</span>
                  <span>{product.marca}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.categoria_nombre}
                  </Badge>
                </div>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-sm">{product.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-gray-200"
                    onClick={() => onUpdateQuantity(product.id, product.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Badges de impuestos clickeables */}
            <div className="flex items-center space-x-2 mb-3">
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer transition-all duration-200 select-none ${
                  impuestos.iva_activo
                    ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-sm"
                    : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
                }`}
                onClick={toggleIva}
              >
                IVA {impuestos.iva_porcentaje}%
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs cursor-pointer transition-all duration-200 select-none ${
                  impuestos.ingresos_brutos_activo
                    ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-sm"
                    : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
                }`}
                onClick={toggleIngresosBrutos}
              >
                I.B. {impuestos.ingresos_brutos_porcentaje}%
              </Badge>

              <Badge
                variant="outline"
                className={`text-xs cursor-pointer transition-all duration-200 select-none ${
                  discount.active
                    ? "bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-sm"
                    : "bg-gray-400 text-gray-900 border-gray-300 hover:bg-gray-300"
                }`}
                onClick={toggleDiscount}
              >
                Descuento
              </Badge>

              {discount.active && (
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discount.percentage}
                    onChange={updateDiscountPercentage}
                    onFocus={handleDiscountFocus}
                    className="w-12 h-6 text-xs border border-gray-300 rounded px-1"
                  />
                  <span className="text-xs ml-1">%</span>
                </div>
              )}
            </div>

            {/* Información de precio */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="space-y-2">
                {/* Precio unitario */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio unitario:</span>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(precioCalculado)}</div>
                </div>

                {/* Desglose de impuestos */}
                <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Precio base:</span>
                    <span>{formatCurrency(precioBase)}</span>
                  </div>

                  {impuestos.iva_activo && (
                    <div className="flex justify-between text-blue-600">
                      <span>+ IVA ({impuestos.iva_porcentaje}%):</span>
                      <span>+{formatCurrency(calcularMontoIva())}</span>
                    </div>
                  )}

                  {impuestos.ingresos_brutos_activo && impuestos.ingresos_brutos_porcentaje > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>+ I.B. ({impuestos.ingresos_brutos_porcentaje}%):</span>
                      <span>+{formatCurrency(calcularMontoIB())}</span>
                    </div>
                  )}

                  {discount.active && discount.percentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>- Descuento ({discount.percentage}%):</span>
                      <span>-{formatCurrency(calcularMontoDescuento())}</span>
                    </div>
                  )}
                </div>

                {/* Total por cantidad */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    {product.quantity} × {formatCurrency(precioCalculado)}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(product.quantity * precioCalculado)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
