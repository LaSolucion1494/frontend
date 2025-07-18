"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Separator } from "../ui/separator"
import { Trash2, Plus, Minus, Edit3, Package, Tag, Barcode, Check, X, AlertTriangle } from "lucide-react"
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
    // Solo actualizar en el carrito, no en la base de datos
    onUpdatePrice(product.id, {
      precio_costo: tempPrice,
    })
    setEditingPrice(false)
  }

  const handlePriceCancel = () => {
    setTempPrice(product.precio_costo)
    setEditingPrice(false)
  }

  const handlePriceChange = (value) => {
    setTempPrice(value)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePriceSave()
    } else if (e.key === "Escape") {
      handlePriceCancel()
    }
  }

  // Verificar si el precio ha sido modificado
  const priceModified = product.precio_costo !== (product.precio_costo_original || product.precio_costo)

  // Stock mínimo configurado
  const stockMinimo = product.stock_minimo_config || product.stock_minimo || 5

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
                            <Tag className="w-3 w-3 mr-1" />
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
                      <span className="ml-2 text-slate-400">(mín {stockMinimo})</span>
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

            {/* Información de precio simplificada */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-4">
                {/* Precio de costo editable */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-700">Precio de costo:</span>
                    {priceModified && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Modificado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {editingPrice ? (
                      <div className="flex items-center space-x-2">
                        <NumericFormat
                          value={tempPrice}
                          onValueChange={(values) => handlePriceChange(Number.parseFloat(values.value) || 0)}
                          onKeyDown={handleKeyPress}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          className="w-32 h-8 text-sm text-right border border-slate-300 rounded-md px-2 focus:border-slate-800 focus:ring-1 focus:ring-slate-800/20"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={handlePriceSave}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handlePriceCancel}
                        >
                          <X className="h-3 w-3" />
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

                {/* Información sobre actualización de precios */}
                {priceModified && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                    <div className="flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      <span>El precio se actualizará en el stock al confirmar la compra</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseProductCard
