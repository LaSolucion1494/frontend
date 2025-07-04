"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Trash2, Plus, Minus, Edit3, Package, Tag, Barcode } from "lucide-react"
import { NumericFormat } from "react-number-format"

const PurchaseProductCard = ({ product, onUpdateQuantity, onRemove, onUpdatePrice, formatCurrency }) => {
  const [editingPrice, setEditingPrice] = useState(false)
  const [tempPrice, setTempPrice] = useState(product.precio_costo)

  useEffect(() => {
    setTempPrice(product.precio_costo)
  }, [product.precio_costo])

  const handlePriceEdit = () => {
    setEditingPrice(true)
  }

  const handlePriceSave = () => {
    onUpdatePrice(product.id, { precio_costo: tempPrice })
    setEditingPrice(false)
  }

  const handlePriceCancel = () => {
    setTempPrice(product.precio_costo)
    setEditingPrice(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePriceSave()
    } else if (e.key === "Escape") {
      handlePriceCancel()
    }
  }

  // Calcular precio sugerido de venta (con margen del 40%)
  const calculateSuggestedPrice = (costPrice, margin = 40) => {
    return costPrice * (1 + margin / 100)
  }

  // Calcular margen actual si existe precio de venta
  const calculateCurrentMargin = (costPrice, salePrice) => {
    if (costPrice === 0) return 0
    return ((salePrice - costPrice) / costPrice) * 100
  }

  const suggestedPrice = calculateSuggestedPrice(product.precio_costo)
  const currentMargin = product.precio_venta ? calculateCurrentMargin(product.precio_costo, product.precio_venta) : 0

  return (
    <div className="bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all duration-200 shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header del producto */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-base leading-tight mb-1">{product.nombre}</h4>
                    <div className="flex items-center space-x-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Barcode className="w-3 h-3 mr-1" />
                        <span className="font-mono">{product.codigo}</span>
                      </div>
                      {product.marca && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span>{product.marca}</span>
                          </div>
                        </>
                      )}
                      {product.categoria_nombre && (
                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-300">
                          {product.categoria_nombre}
                        </Badge>
                      )}
                    </div>
                    {/* Stock actual */}
                    <div className="flex items-center mt-2 text-xs text-slate-600">
                      <span>
                        Stock actual: <span className="font-medium">{product.stock}</span>
                      </span>
                      {product.stock_minimo && (
                        <span className="ml-2 text-slate-400">(mín: {product.stock_minimo})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center space-x-3 ml-4">
                <div className="flex items-center space-x-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-200 text-slate-600"
                    onClick={() => onUpdateQuantity(product.id, product.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center font-semibold text-sm text-slate-800">{product.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-slate-200 text-slate-600"
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

            {/* Información de precios */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-4">
                {/* Precio de costo editable */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Precio de costo:</span>
                  <div className="flex items-center space-x-2">
                    {editingPrice ? (
                      <div className="flex items-center space-x-2">
                        <NumericFormat
                          value={tempPrice}
                          onValueChange={(values) => setTempPrice(Number.parseFloat(values.value) || 0)}
                          onKeyDown={handleKeyPress}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          className="w-28 h-8 text-sm text-right border border-slate-300 rounded-md px-2 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/20"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={handlePriceSave}
                        >
                          ✓
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handlePriceCancel}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={handlePriceEdit}
                        className="flex items-center space-x-2 text-slate-800 hover:text-slate-900 font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-50 transition-colors"
                      >
                        <span>{formatCurrency(product.precio_costo)}</span>
                        <Edit3 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Precio sugerido de venta */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Precio sugerido (+40%):</span>
                  <span className="font-medium text-green-600">{formatCurrency(suggestedPrice)}</span>
                </div>

                {/* Precio actual de venta si existe */}
                {product.precio_venta && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Precio actual de venta:</span>
                    <div className="text-right">
                      <span className="font-medium text-slate-900">{formatCurrency(product.precio_venta)}</span>
                      <div className="text-xs text-blue-600">Margen: {currentMargin.toFixed(1)}%</div>
                    </div>
                  </div>
                )}

                <Separator className="bg-slate-200" />

                {/* Total por cantidad */}
                <div className="flex items-center justify-between bg-white rounded-md p-3 border border-slate-200">
                  <span className="text-sm font-medium text-slate-700">
                    {product.quantity} × {formatCurrency(product.precio_costo)}
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatCurrency(product.quantity * product.precio_costo)}
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

export default PurchaseProductCard
