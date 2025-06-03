"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { CreditCard, DollarSign, ArrowLeft, Receipt, User, ShoppingCart } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

const PAYMENT_TYPES = [
  { value: "efectivo", label: "Efectivo", icon: DollarSign },
  { value: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { value: "transferencia", label: "Transferencia", icon: CreditCard },
  { value: "otro", label: "Otro", icon: CreditCard },
]

const PaymentSection = ({
  cartItems,
  client,
  subtotal,
  paymentData,
  onPaymentDataChange,
  onProcessSale,
  onBack,
  loading,
}) => {
  const [errors, setErrors] = useState({})
  const subtotalValue = Number(subtotal) || 0

  const handlePaymentChange = (field, value) => {
    onPaymentDataChange((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar errores
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const descuentoValue = Number(paymentData.descuento) || 0

    if (descuentoValue < 0) {
      newErrors.descuento = "El descuento no puede ser negativo"
    }

    if (descuentoValue > subtotalValue) {
      newErrors.descuento = "El descuento no puede ser mayor al subtotal"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onProcessSale()
    }
  }

  const descuentoValue = Number(paymentData.descuento) || 0
  const total = Math.max(0, subtotalValue - descuentoValue)

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Configurar Pago</h3>
            <p className="text-sm text-slate-600">Revisa los detalles y configura el método de pago</p>
          </div>
          <Button variant="outline" onClick={onBack} disabled={loading}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen de la venta */}
          <div className="space-y-4">
            {/* Cliente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{client.nombre}</p>
                  {client.telefono && <p className="text-sm text-slate-600">{client.telefono}</p>}
                  {client.email && <p className="text-sm text-slate-600">{client.email}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Productos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Productos ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.producto_id}
                      className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.producto_nombre}</p>
                        <p className="text-xs text-slate-500">
                          {item.cantidad} × {formatCurrency(Number(item.precio_unitario) || 0)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(Number(item.subtotal) || 0)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuración de pago */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Tipo de pago */}
                <div className="space-y-2">
                  <Label htmlFor="tipoPago">Tipo de pago</Label>
                  <Select
                    value={paymentData.tipoPago}
                    onValueChange={(value) => handlePaymentChange("tipoPago", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <type.icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Descuento */}
                <div className="space-y-2">
                  <Label htmlFor="descuento">Descuento</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    max={subtotalValue.toString()}
                    step="0.01"
                    value={paymentData.descuento || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
                      handlePaymentChange("descuento", value)
                    }}
                    placeholder="0.00"
                    className={errors.descuento ? "border-red-500" : ""}
                  />
                  {errors.descuento && <p className="text-sm text-red-600">{errors.descuento}</p>}
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                  <Textarea
                    id="observaciones"
                    value={paymentData.observaciones || ""}
                    onChange={(e) => handlePaymentChange("observaciones", e.target.value)}
                    placeholder="Notas adicionales sobre la venta..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totales */}
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotalValue)}</span>
                  </div>

                  {descuentoValue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Descuento:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(descuentoValue)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón procesar venta */}
            <Button
              onClick={handleSubmit}
              disabled={loading || total <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando venta...
                </div>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Procesar Venta - {formatCurrency(total)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSection
