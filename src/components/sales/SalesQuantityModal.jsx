"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plus, Minus, ShoppingCart, X, Barcode, Tag, AlertTriangle } from "lucide-react"

const SalesQuantityModal = ({ isOpen, onClose, onConfirm, product, loading = false }) => {
  const [quantity, setQuantity] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const inputRef = useRef(null)

  // Resetear cantidad cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity("1")
      setIsInputFocused(false)
      // Enfocar el input después de un pequeño delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select() // Seleccionar todo el texto para facilitar el reemplazo
        }
      }, 100)
    }
  }, [isOpen])

  const handleConfirm = () => {
    const qty = Number.parseInt(quantity) || 1
    if (qty > 0) {
      onConfirm(product, qty)
      onClose()
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity.toString())
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    // Permitir campo vacío temporalmente o números válidos
    if (value === "" || (!isNaN(value) && Number.parseInt(value) >= 0)) {
      setQuantity(value)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    // Seleccionar todo el texto cuando se enfoca
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    // Si el campo está vacío, poner 1 por defecto
    if (quantity === "" || Number.parseInt(quantity) < 1) {
      setQuantity("1")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleConfirm()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  // Obtener estado del stock
  const getStockStatus = (product) => {
    const stockMinimo = product.stock_minimo || 5

    if (product.stock <= 0) {
      return {
        status: "sin-stock",
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Sin stock",
        icon: AlertTriangle,
      }
    } else if (product.stock <= stockMinimo) {
      return {
        status: "stock-bajo",
        color: "bg-orange-100 text-orange-800 border-orange-200",
        text: "Stock bajo",
        icon: Package,
      }
    } else {
      return {
        status: "disponible",
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Disponible",
        icon: Package,
      }
    }
  }

  if (!isOpen || !product) return null

  const stockStatus = getStockStatus(product)
  const StatusIcon = stockStatus.icon
  const precioVenta = product.precio_venta || 0
  const stockMinimo = product.stock_minimo || 5
  const qty = Number.parseInt(quantity) || 1
  const totalPrice = qty * precioVenta

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold">Agregar al Carrito</h3>
              <p className="text-sm text-slate-300">Especifique la cantidad</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del producto */}
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 text-lg leading-tight">{product.nombre}</h4>
              <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                {product.codigo && (
                  <div className="flex items-center">
                    <Barcode className="h-3 w-3 mr-1" />
                    <span className="font-mono">{product.codigo}</span>
                  </div>
                )}
                {product.marca && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>{product.marca}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stock y precio */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge className={`text-xs border ${stockStatus.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {stockStatus.text}
                </Badge>
                <span className="text-sm text-slate-600">
                  Stock: <span className="font-medium">{product.stock}</span>
                  <span className="text-slate-400"> (mín: {stockMinimo})</span>
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm text-slate-900">Precio: {formatCurrency(precioVenta)}</div>
              </div>
            </div>
          </div>

          {/* Selector de cantidad mejorado */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Cantidad a agregar:</label>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
                onClick={() => handleQuantityChange(Math.max(1, qty - 1))}
                disabled={qty <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyPress}
                  className="text-center font-semibold text-lg"
                  placeholder="1"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
                onClick={() => handleQuantityChange(qty + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Sugerencias rápidas */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Rápido:</span>
              {[2, 5, 10, 20].map((suggestedQty) => (
                <Button
                  key={suggestedQty}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs bg-transparent"
                  onClick={() => setQuantity(suggestedQty.toString())}
                >
                  {suggestedQty}
                </Button>
              ))}
            </div>

            {/* Información adicional para productos sin stock */}
            {product.stock <= 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>Este producto no tiene stock disponible</span>
                </div>
              </div>
            )}

            {/* Advertencia si se intenta vender más del stock disponible */}
            {product.stock > 0 && qty > product.stock && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span>La cantidad supera el stock disponible ({product.stock} unidades)</span>
                </div>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {qty} × {formatCurrency(precioVenta)}
              </span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 bg-slate-50 border-t border-slate-200">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={loading || qty < 1} className="bg-slate-800 hover:bg-slate-700">
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Agregando...
              </div>
            ) : (
              <div className="flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Agregar al Carrito
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SalesQuantityModal
