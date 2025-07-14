"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Trash2, Plus, Minus } from "lucide-react"

const ProductCard = ({ product, onUpdateQuantity, onRemove, onUpdatePrice, formatCurrency, config }) => {
  // Estado simplificado - solo para descuento automático
  const [discount, setDiscount] = useState({
    active: false,
  })

  const [precioCalculado, setPrecioCalculado] = useState(product.precio_venta)
  const [precioOriginal] = useState(product.precio_venta)

  // Calcular precio con descuento automático basado en "otros impuestos"
  const calcularPrecioConDescuento = () => {
    if (!discount.active || !config?.otros_impuestos) {
      return precioOriginal
    }

    // Calcular el precio sin "otros impuestos"
    const otrosImpuestosPorcentaje = Number.parseFloat(config.otros_impuestos) || 0
    const precioSinOtrosImpuestos = precioOriginal / (1 + otrosImpuestosPorcentaje / 100)

    return Math.round(precioSinOtrosImpuestos * 100) / 100
  }

  // Recalcular precio cuando cambia el descuento
  useEffect(() => {
    const nuevoPrecio = calcularPrecioConDescuento()
    setPrecioCalculado(nuevoPrecio)

    // Actualizar el precio en el carrito
    onUpdatePrice(product.id, {
      precio_venta: nuevoPrecio,
      discount_active: discount.active,
      discount_percentage: discount.active ? config?.otros_impuestos || 0 : 0,
    })
  }, [discount.active, precioOriginal, config?.otros_impuestos])

  const toggleDiscount = () => {
    setDiscount((prev) => ({
      active: !prev.active,
    }))
  }

  // Calcular el monto del descuento para mostrar
  const calcularMontoDescuento = () => {
    if (!discount.active || !config?.otros_impuestos) {
      return 0
    }

    const otrosImpuestosPorcentaje = Number.parseFloat(config.otros_impuestos) || 0
    return precioOriginal - precioCalculado
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

            {/* Toggle de descuento automático */}
            <div className="flex items-center space-x-2 mb-3">
              <Badge
                variant="outline"
                className={`text-xs cursor-pointer transition-all duration-200 select-none ${
                  discount.active
                    ? "bg-green-600 text-white border-green-600 hover:bg-green-700 shadow-sm"
                    : "bg-gray-400 text-gray-900 border-gray-300 hover:bg-gray-300"
                }`}
                onClick={toggleDiscount}
              >
                Descuento {config?.otros_impuestos ? `(${config.otros_impuestos}%)` : ""}
              </Badge>

              {discount.active && (
                <span className="text-xs text-green-600 font-medium">Precio sin otros impuestos</span>
              )}
            </div>

            {/* Información de precio simplificada */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="space-y-2">
                {/* Precio unitario */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precio unitario:</span>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(precioCalculado)}</div>
                </div>

                {/* Mostrar descuento aplicado si está activo */}
                {discount.active && calcularMontoDescuento() > 0 && (
                  <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>Precio original:</span>
                      <span>{formatCurrency(precioOriginal)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>- Descuento aplicado:</span>
                      <span>-{formatCurrency(calcularMontoDescuento())}</span>
                    </div>
                  </div>
                )}

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
