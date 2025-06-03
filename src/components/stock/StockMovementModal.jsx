"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent } from "../ui/card"
import { RefreshCw, Plus, Minus, Save, X, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

const MOVEMENT_TYPES = [
  {
    value: "entrada",
    label: "Entrada de Stock",
    icon: Plus,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "salida",
    label: "Salida de Stock",
    icon: Minus,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    value: "ajuste",
    label: "Ajuste de Inventario",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
]

const StockMovementModal = ({ isOpen, onClose, product, onStockUpdate }) => {
  const [movementType, setMovementType] = useState("entrada")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (isOpen) {
      setMovementType("entrada")
      setQuantity("")
      setReason("")
      setNotes("")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()

    const quantityNum = Number(quantity) || 0
    let newStock = product.stock

    switch (movementType) {
      case "entrada":
        newStock = product.stock + quantityNum
        break
      case "salida":
        newStock = Math.max(0, product.stock - quantityNum)
        break
      case "ajuste":
        newStock = quantityNum
        break
    }

    const movement = {
      type: movementType,
      quantity: quantityNum,
      reason,
      notes,
      date: new Date().toISOString(),
      previousStock: product.stock,
      newStock,
    }

    onStockUpdate(product.id, newStock, movement)
  }

  const handleQuantityChange = (e) => {
    const value = e.target.value
    // Permitir solo números y string vacío
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value)
    }
  }

  const handleQuantityFocus = (e) => {
    // Si el valor es "0", limpiar el campo al hacer focus
    if (e.target.value === "0") {
      setQuantity("")
    }
  }

  const handleClose = () => {
    setMovementType("entrada")
    setQuantity("")
    setReason("")
    setNotes("")
    onClose()
  }

  const getNewStock = () => {
    const quantityNum = Number(quantity) || 0
    switch (movementType) {
      case "entrada":
        return product?.stock + quantityNum
      case "salida":
        return Math.max(0, (product?.stock || 0) - quantityNum)
      case "ajuste":
        return quantityNum
      default:
        return product?.stock || 0
    }
  }

  const getDifference = () => {
    return getNewStock() - (product?.stock || 0)
  }

  const isValidQuantity = () => {
    const quantityNum = Number(quantity) || 0
    if (movementType === "salida") {
      return quantityNum <= product.stock && quantityNum > 0
    }
    return quantityNum > 0 || (movementType === "ajuste" && quantityNum >= 0)
  }

  if (!product || !isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Movimiento de Stock</h2>
              <p className="text-sm text-slate-300 mt-1">Gestiona el inventario del producto {product.codigo}</p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <div className="space-y-6">
              {/* Información del producto */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg">{product.nombre}</h3>
                      <p className="text-sm text-slate-600 mb-1">{product.descripcion}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-slate-500">Stock actual:</span>
                        <span className="font-bold text-slate-900 text-lg">{product.stock} unidades</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tipo de movimiento */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">Tipo de Movimiento</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MOVEMENT_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = movementType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setMovementType(type.value)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          isSelected
                            ? `${type.borderColor} ${type.bgColor} shadow-md`
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-white" : type.bgColor}`}>
                            <Icon className={`w-6 h-6 ${type.color}`} />
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? type.color : "text-slate-700"}`}>
                            {type.label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Cantidad y Motivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                    {movementType === "ajuste" ? "Nuevo Stock *" : "Cantidad *"}
                  </Label>
                  <Input
                    id="quantity"
                    type="text"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onFocus={handleQuantityFocus}
                    placeholder={movementType === "ajuste" ? "Stock final" : "Cantidad"}
                    className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                    required
                  />
                  {movementType === "salida" && Number(quantity) > product.stock && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      No puedes retirar más stock del disponible
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium text-slate-700">
                    Motivo *
                  </Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo del movimiento"
                    className="h-11 bg-slate-50 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20"
                    required
                  />
                </div>
              </div>

              {/* Resumen del movimiento */}
              {quantity && Number(quantity) > 0 && (
                <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Resumen del Movimiento
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Stock Actual */}
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Stock Actual</div>
                        <div className="text-2xl font-bold text-slate-900">{product.stock}</div>
                      </div>

                      {/* Nuevo Stock */}
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1">Nuevo Stock</div>
                        <div className="text-2xl font-bold text-blue-600">{getNewStock()}</div>
                      </div>

                      {/* Diferencia */}
                      <div className="bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 mb-1 flex items-center">
                          {getDifference() > 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : getDifference() < 0 ? (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          ) : null}
                          Diferencia
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            getDifference() > 0
                              ? "text-green-600"
                              : getDifference() < 0
                                ? "text-red-600"
                                : "text-slate-600"
                          }`}
                        >
                          {getDifference() > 0 ? "+" : ""}
                          {getDifference()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValidQuantity() || !reason.trim()}
              className="bg-slate-800 hover:bg-slate-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Confirmar Movimiento
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockMovementModal
