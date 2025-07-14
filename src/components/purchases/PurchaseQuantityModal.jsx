"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plus, Minus, ShoppingCart, X, Barcode, Tag, AlertTriangle, TrendingUp } from "lucide-react"

const PurchaseQuantityModal = ({ isOpen, onClose, onConfirm, product, loading = false }) => {
  const [quantity, setQuantity] = useState(1)

  // Resetear cantidad cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(product, quantity)
      onClose()
    }
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
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
    const stockMinimo = product.stock_minimo_config || product.stock_minimo || 5

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
        icon: TrendingUp,
      }
    } else {
      return {
        status: "stock-ok",
        color: "bg-green-100 text-green-800 border-green-200",
        text: "Stock OK",
        icon: Package,
      }
    }
  }

  if (!isOpen || !product) return null

  const stockStatus = getStockStatus(product)
  const StatusIcon = stockStatus.icon
  const precioCosto = product.precio_costo || product.precioCosto || 0
  const stockMinimo = product.stock_minimo_config || product.stock_minimo || 5
  const totalCost = quantity * precioCosto

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
                <div className="font-medium text-sm text-slate-900">Costo: {formatCurrency(precioCosto)}</div>
              </div>
            </div>
          </div>

          {/* Selector de cantidad */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Cantidad a agregar:</label>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                  onKeyDown={handleKeyPress}
                  className="text-center font-semibold text-lg"
                  min="1"
                  autoFocus
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 bg-transparent"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Sugerencias rápidas */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Rápido:</span>
              {[5, 10, 20, 50].map((suggestedQty) => (
                <Button
                  key={suggestedQty}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs bg-transparent"
                  onClick={() => setQuantity(suggestedQty)}
                >
                  {suggestedQty}
                </Button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                {quantity} × {formatCurrency(precioCosto)}
              </span>
              <span className="text-lg font-bold text-slate-900">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          {/* Advertencia de stock bajo */}
          {product.stock <= stockMinimo && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center text-orange-700">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm">Este producto necesita reposición</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 bg-slate-50 border-t border-slate-200">
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || quantity < 1}
            className="bg-slate-800 hover:bg-slate-700"
          >
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

export default PurchaseQuantityModal
