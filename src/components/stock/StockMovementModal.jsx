"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  RefreshCw,
  Plus,
  Minus,
  Save,
  X,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calculator,
  Activity,
} from "lucide-react"

const MOVEMENT_TYPES = [
  {
    value: "entrada",
    label: "Entrada de Stock",
    icon: Plus,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Agregar productos al inventario",
  },
  {
    value: "salida",
    label: "Salida de Stock",
    icon: Minus,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Retirar productos del inventario",
  },
  {
    value: "ajuste",
    label: "Ajuste de Inventario",
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Corregir el stock actual",
  },
]

const StockMovementModal = ({ isOpen, onClose, product, onStockUpdate, loading = false }) => {
  const [movementType, setMovementType] = useState("entrada")
  const [quantity, setQuantity] = useState("")
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setMovementType("entrada")
      setQuantity("")
      setReason("")
      setNotes("")
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors = {}
    const quantityNum = Number(quantity) || 0

    // Validar cantidad
    if (!quantity || quantityNum <= 0) {
      if (movementType === "ajuste" && quantityNum === 0) {
        // Permitir 0 para ajustes
      } else {
        newErrors.quantity = "La cantidad debe ser mayor a 0"
      }
    }

    // Validar salida de stock
    if (movementType === "salida" && quantityNum > product.stock) {
      newErrors.quantity = "No puedes retirar más stock del disponible"
    }

    // Validar motivo
    if (!reason.trim()) {
      newErrors.reason = "El motivo es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

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
      reason: reason.trim(),
      notes: notes.trim() || null,
      date: new Date().toISOString(),
      previousStock: product.stock,
      newStock,
    }

    await onStockUpdate(product.id, newStock, movement)
  }

  const handleQuantityChange = (e) => {
    const value = e.target.value
    // Permitir solo números y string vacío
    if (value === "" || /^\d+$/.test(value)) {
      setQuantity(value)
      // Limpiar error si existe
      if (errors.quantity) {
        setErrors((prev) => ({ ...prev, quantity: undefined }))
      }
    }
  }

  const handleQuantityFocus = (e) => {
    // Si el valor es "0", limpiar el campo al hacer focus
    if (e.target.value === "0") {
      setQuantity("")
    }
  }

  const handleReasonChange = (e) => {
    setReason(e.target.value)
    // Limpiar error si existe
    if (errors.reason) {
      setErrors((prev) => ({ ...prev, reason: undefined }))
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMovementType("entrada")
      setQuantity("")
      setReason("")
      setNotes("")
      setErrors({})
      onClose()
    }
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

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: "Sin stock", color: "text-red-600", bgColor: "bg-red-50" }
    }
    if (stock <= 5) {
      return { text: "Stock bajo", color: "text-orange-600", bgColor: "bg-orange-50" }
    }
    return { text: "Stock normal", color: "text-green-600", bgColor: "bg-green-50" }
  }

  if (!product || !isOpen) return null

  const currentType = MOVEMENT_TYPES.find((type) => type.value === movementType)
  const newStock = getNewStock()
  const difference = getDifference()
  const newStockStatus = getStockStatus(newStock)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-4xl h-[86vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
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
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <div className="space-y-6">
              {/* Hero Section - Información del producto */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">{product.nombre}</h3>
                    <p className="text-slate-600 mt-1">
                      {product.descripcion && product.descripcion !== "Sin Descripción"
                        ? product.descripcion
                        : "Sin descripción"}
                    </p>
                    <div className="flex items-center space-x-6 mt-3 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span>Código:</span>
                        <span className="font-mono font-semibold text-slate-900">{product.codigo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>Stock actual:</span>
                        <span className="font-bold text-slate-900 text-lg">{product.stock} unidades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tipo de movimiento */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Tipo de Movimiento</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MOVEMENT_TYPES.map((type) => {
                    const Icon = type.icon
                    const isSelected = movementType === type.value
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setMovementType(type.value)}
                        disabled={loading}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          isSelected
                            ? `${type.borderColor} ${type.bgColor} shadow-md`
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`p-3 rounded-lg ${isSelected ? "bg-white" : type.bgColor}`}>
                            <Icon className={`w-6 h-6 ${type.color}`} />
                          </div>
                          <div className="text-center">
                            <span className={`text-sm font-medium block ${isSelected ? type.color : "text-slate-700"}`}>
                              {type.label}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 block">{type.description}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Formulario de movimiento */}
              <div className="bg-white rounded-lg border border-slate-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Calculator className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Detalles del Movimiento</h3>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cantidad */}
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm font-medium text-slate-900">
                        {movementType === "ajuste" ? "Nuevo Stock" : "Cantidad"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="text"
                        value={quantity}
                        onChange={handleQuantityChange}
                        onFocus={handleQuantityFocus}
                        placeholder={movementType === "ajuste" ? "Stock final" : "Cantidad"}
                        className={`bg-slate-50 ${errors.quantity ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                        disabled={loading}
                      />
                      {errors.quantity && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{errors.quantity}</span>
                        </div>
                      )}
                    </div>

                    {/* Motivo */}
                    <div className="space-y-2">
                      <Label htmlFor="reason" className="text-sm font-medium text-slate-900">
                        Motivo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="reason"
                        value={reason}
                        onChange={handleReasonChange}
                        placeholder="Motivo del movimiento"
                        className={`bg-slate-50 ${errors.reason ? "border-red-500 focus:border-red-500" : "border-slate-800"}`}
                        disabled={loading}
                      />
                      {errors.reason && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{errors.reason}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notas adicionales */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-slate-900">
                      Notas Adicionales
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Información adicional sobre el movimiento (opcional)"
                      rows={3}
                      className="bg-slate-50 border-slate-800"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Resumen del movimiento */}
              {quantity &&
                Number(quantity) >= 0 &&
                ((movementType !== "entrada" && movementType !== "salida") || Number(quantity) > 0) && (
                  <div className="bg-white rounded-lg border border-slate-800 p-6">
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <Calculator className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">Resumen del Movimiento</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Información del movimiento */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`p-2 rounded-lg ${currentType.bgColor}`}>
                            <currentType.icon className={`w-5 h-5 ${currentType.color}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{currentType.label}</h4>
                            <p className="text-sm text-slate-600">{currentType.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Métricas del cambio */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Stock Actual */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="text-sm text-slate-600 mb-1">Stock Actual</div>
                          <div className="text-2xl font-bold text-slate-900">{product.stock}</div>
                          <div className="text-xs text-slate-500 mt-1">unidades</div>
                        </div>

                        {/* Nuevo Stock */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="text-sm text-slate-600 mb-1">Nuevo Stock</div>
                          <div className={`text-2xl font-bold ${newStockStatus.color}`}>{newStock}</div>
                          <div
                            className={`text-xs mt-1 px-2 py-1 rounded-full ${newStockStatus.bgColor} ${newStockStatus.color}`}
                          >
                            {newStockStatus.text}
                          </div>
                        </div>

                        {/* Diferencia */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="text-sm text-slate-600 mb-1 flex items-center">
                            {difference > 0 ? (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            ) : difference < 0 ? (
                              <TrendingDown className="w-4 h-4 mr-1" />
                            ) : null}
                            Diferencia
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              difference > 0 ? "text-green-600" : difference < 0 ? "text-red-600" : "text-slate-600"
                            }`}
                          >
                            {difference > 0 ? "+" : ""}
                            {difference}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {difference > 0 ? "Incremento" : difference < 0 ? "Reducción" : "Sin cambios"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-slate-300 bg-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-800 text-slate-700 hover:bg-slate-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Confirmar Movimiento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockMovementModal
