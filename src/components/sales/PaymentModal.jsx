"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { NumericFormat } from "react-number-format"
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Calculator,
  ShoppingCart,
  X,
} from "lucide-react"
import toast from "react-hot-toast"

const PAYMENT_TYPES = [
  {
    value: "efectivo",
    label: "Efectivo",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    value: "transferencia",
    label: "Transferencia",
    icon: Smartphone,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    value: "tarjeta",
    label: "Tarjeta",
    icon: CreditCard,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    value: "cuenta_corriente",
    label: "Cuenta Corriente",
    icon: Building2,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    iconColor: "text-orange-600",
  },
  {
    value: "otro",
    label: "Otro",
    icon: CreditCard,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    iconColor: "text-gray-600",
  },
]

const PaymentModal = ({ isOpen, onClose, total, onConfirm, selectedClient = null, clients = [], loading = false }) => {
  const [payments, setPayments] = useState([])
  const [newPayment, setNewPayment] = useState({
    type: "efectivo",
    amount: "",
    description: "",
  })
  const [errors, setErrors] = useState({})

  // Obtener información del cliente seleccionado
  const clientInfo = selectedClient ? clients.find((c) => c.id === selectedClient) : null

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setPayments([])
      setNewPayment({
        type: "efectivo",
        amount: "",
        description: "",
      })
      setErrors({})
    }
  }, [isOpen, total])

  // Calcular totales
  const totalPaid = payments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount || 0), 0)
  const remaining = total - totalPaid
  const isExactAmount = Math.abs(remaining) < 0.01
  const isOverpaid = remaining < -0.01

  // Validar pagos
  const validatePayments = () => {
    const newErrors = {}

    if (payments.length === 0) {
      newErrors.general = "Debe agregar al menos un método de pago"
      setErrors(newErrors)
      return false
    }

    payments.forEach((payment, index) => {
      if (!payment.amount || payment.amount <= 0) {
        newErrors[`payment_${index}`] = "El monto debe ser mayor a 0"
      }
      if (!payment.type) {
        newErrors[`payment_type_${index}`] = "Debe seleccionar un tipo de pago"
      }
    })

    // Validar cuenta corriente
    const hasCuentaCorriente = payments.some((p) => p.type === "cuenta_corriente")
    if (hasCuentaCorriente) {
      if (!selectedClient) {
        newErrors.cuenta_corriente = "Para pagar con cuenta corriente debe seleccionar un cliente registrado"
      } else if (clientInfo && !clientInfo.tiene_cuenta_corriente) {
        newErrors.cuenta_corriente = "El cliente seleccionado no tiene cuenta corriente habilitada"
      } else if (clientInfo && clientInfo.limite_credito) {
        const montoCuentaCorriente = payments
          .filter((p) => p.type === "cuenta_corriente")
          .reduce((sum, p) => sum + p.amount, 0)

        const saldoActual = clientInfo.saldo_cuenta_corriente || 0
        const nuevoSaldo = saldoActual + montoCuentaCorriente

        if (nuevoSaldo > clientInfo.limite_credito) {
          const disponible = clientInfo.limite_credito - saldoActual
          newErrors.cuenta_corriente = `Excede el límite de crédito. Disponible: ${formatCurrency(disponible)}`
        }
      }
    }

    if (!isExactAmount && !isOverpaid) {
      newErrors.total = `Falta pagar ${formatCurrency(remaining)}`
    }

    if (isOverpaid) {
      newErrors.total = `Hay un exceso de ${formatCurrency(Math.abs(remaining))}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Agregar nuevo pago
  const addPayment = () => {
    if (!newPayment.amount || Number.parseFloat(newPayment.amount) <= 0) {
      toast.error("Ingrese un monto válido")
      return
    }

    if (!newPayment.type) {
      toast.error("Seleccione un tipo de pago")
      return
    }

    // Validaciones específicas para cuenta corriente
    if (newPayment.type === "cuenta_corriente") {
      if (!selectedClient) {
        toast.error("Para pagar con cuenta corriente debe seleccionar un cliente registrado")
        return
      }

      if (clientInfo && !clientInfo.tiene_cuenta_corriente) {
        toast.error("El cliente seleccionado no tiene cuenta corriente habilitada")
        return
      }
    }

    const payment = {
      id: Date.now(),
      type: newPayment.type,
      amount: Number.parseFloat(newPayment.amount),
      description: newPayment.description || getDefaultDescription(newPayment.type),
    }

    setPayments((prev) => [...prev, payment])
    setNewPayment({
      type: "efectivo",
      amount: "",
      description: "",
    })
    setErrors({})
  }

  // Eliminar pago
  const removePayment = (paymentId) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId))
    setErrors({})
  }

  // Actualizar pago existente
  const updatePayment = (paymentId, field, value) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? { ...payment, [field]: field === "amount" ? Number.parseFloat(value || 0) : value }
          : payment,
      ),
    )
    setErrors({})
  }

  // Obtener descripción por defecto
  const getDefaultDescription = (type) => {
    const paymentType = PAYMENT_TYPES.find((pt) => pt.value === type)
    return `Pago con ${paymentType?.label.toLowerCase() || type}`
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0)
  }

  // Obtener configuración del tipo de pago
  const getPaymentConfig = (type) => {
    return PAYMENT_TYPES.find((pt) => pt.value === type) || PAYMENT_TYPES[0]
  }

  // Manejar confirmación
  const handleConfirm = () => {
    if (!validatePayments()) {
      return
    }

    onConfirm(payments)
  }

  // Pagar el resto con efectivo
  const payRemainingWithCash = () => {
    if (remaining > 0) {
      const payment = {
        id: Date.now(),
        type: "efectivo",
        amount: remaining,
        description: "Pago del saldo restante en efectivo",
      }
      setPayments((prev) => [...prev, payment])
    }
  }

  // Ajustar el primer pago al total exacto
  const adjustToExactAmount = () => {
    if (payments.length > 0) {
      const firstPayment = payments[0]
      const otherPaymentsTotal = payments.slice(1).reduce((sum, p) => sum + p.amount, 0)
      const adjustedAmount = total - otherPaymentsTotal

      if (adjustedAmount > 0) {
        updatePayment(firstPayment.id, "amount", adjustedAmount)
      }
    }
  }

  // Manejar cierre del modal
  const handleClose = () => {
    setPayments([])
    setNewPayment({
      type: "efectivo",
      amount: "",
      description: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white shadow-xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative z-[101]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 bg-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configurar Pago de Venta</h2>
              <p className="text-sm text-slate-300 mt-1">Configure los métodos de pago para la venta</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-slate-300">Total a Pagar</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Columna izquierda */}
              <div className="space-y-6">
                {/* Nuevo Pago */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                      <Plus className="w-4 h-4 mr-2 text-slate-600" />
                      Agregar Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Tipo de pago */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Método de Pago</Label>
                      <Select
                        value={newPayment.type}
                        onValueChange={(value) => setNewPayment((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="h-10 border-slate-300 focus:border-slate-800 text-sm bg-slate-50">
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]" position="popper" sideOffset={4}>
                          {PAYMENT_TYPES.map((type) => {
                            const IconComponent = type.icon
                            const isDisabled =
                              type.value === "cuenta_corriente" &&
                              (!selectedClient || (clientInfo && !clientInfo.tiene_cuenta_corriente))

                            return (
                              <SelectItem key={type.value} value={type.value} disabled={isDisabled} className="py-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`p-1.5 rounded ${type.color}`}>
                                    <IconComponent className="w-3 h-3" />
                                  </div>
                                  <span className="text-sm">{type.label}</span>
                                  {isDisabled && <span className="text-xs text-slate-500">(No disponible)</span>}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Monto</Label>
                      <div className="relative">
                        <NumericFormat
                          value={newPayment.amount}
                          onValueChange={(values) => setNewPayment((prev) => ({ ...prev, amount: values.value }))}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          fixedDecimalScale={true}
                          allowNegative={false}
                          placeholder="0,00"
                          className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800/20"
                        />
                        <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Descripción (opcional)</Label>
                      <Input
                        value={newPayment.description}
                        onChange={(e) => setNewPayment((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder={getDefaultDescription(newPayment.type)}
                        className="h-10 border-slate-300 focus:border-slate-800 text-sm bg-slate-50"
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={addPayment}
                        className="flex-1 h-10 bg-slate-800 hover:bg-slate-700 text-white text-sm"
                        disabled={loading}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Pago
                      </Button>
                      {remaining > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setNewPayment((prev) => ({ ...prev, amount: remaining.toString() }))}
                          className="h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm px-4 bg-transparent"
                          disabled={loading}
                        >
                          Resto
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Información del Cliente */}
                {selectedClient && clientInfo && (
                  <Card className="border-slate-200 bg-slate-50 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <User className="w-4 h-4 text-slate-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">Cliente Seleccionado</p>
                          <p className="text-sm text-slate-700">{clientInfo.nombre}</p>

                          {clientInfo.tiene_cuenta_corriente && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-3 h-3 text-orange-600" />
                                <span className="text-xs font-medium text-orange-800">Cuenta Corriente Disponible</span>
                              </div>
                              <div className="mt-1 text-xs text-orange-700">
                                <div className="flex justify-between">
                                  <span>Saldo actual:</span>
                                  <span>{formatCurrency(clientInfo.saldo_cuenta_corriente || 0)}</span>
                                </div>
                                {clientInfo.limite_credito && (
                                  <>
                                    <div className="flex justify-between">
                                      <span>Límite:</span>
                                      <span>{formatCurrency(clientInfo.limite_credito)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium">
                                      <span>Disponible:</span>
                                      <span>
                                        {formatCurrency(
                                          clientInfo.limite_credito - (clientInfo.saldo_cuenta_corriente || 0),
                                        )}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Columna derecha */}
              <div className="space-y-6">
                {/* Pagos Agregados */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-slate-800">Métodos de Pago</CardTitle>
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700 text-xs">
                        {payments.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {payments.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto">
                        {payments.map((payment) => {
                          const config = getPaymentConfig(payment.type)
                          const IconComponent = config.icon

                          return (
                            <div
                              key={payment.id}
                              className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className={`p-2 rounded ${config.color}`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate">{config.label}</p>
                                    <p className="text-xs text-slate-600 truncate">{payment.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-3">
                                  <NumericFormat
                                    value={payment.amount}
                                    onValueChange={(values) => updatePayment(payment.id, "amount", values.value)}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    allowNegative={false}
                                    className="w-24 h-8 text-xs text-right border border-slate-300 rounded px-2 font-medium focus:border-slate-800 focus:outline-none bg-white"
                                    disabled={loading}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removePayment(payment.id)}
                                    disabled={loading}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 px-4">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm text-slate-600 mb-1">Sin métodos de pago</p>
                        <p className="text-xs text-slate-500">Agregue al menos un método de pago</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumen */}
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 bg-slate-50 rounded-t-lg">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center">
                      <Calculator className="w-4 h-4 mr-2 text-slate-600" />
                      Resumen de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Detalles */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Total a pagar:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(total)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Total pagado:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(totalPaid)}</span>
                      </div>
                      <Separator className="bg-slate-200" />
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">
                          {remaining > 0.01 ? "Falta pagar:" : remaining < -0.01 ? "Exceso:" : "Estado:"}
                        </span>
                        <div className="flex items-center space-x-2">
                          {isExactAmount ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-sm text-emerald-600">Completo</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className={`w-4 h-4 ${isOverpaid ? "text-red-600" : "text-amber-600"}`} />
                              <span className={`font-bold text-sm ${isOverpaid ? "text-red-600" : "text-amber-600"}`}>
                                {formatCurrency(Math.abs(remaining))}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Estado visual */}
                    <div
                      className={`p-4 rounded-lg border ${
                        isExactAmount
                          ? "bg-emerald-50 border-emerald-200"
                          : isOverpaid
                            ? "bg-red-50 border-red-200"
                            : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="text-center">
                        {isExactAmount ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        ) : (
                          <AlertCircle
                            className={`w-8 h-8 mx-auto mb-2 ${isOverpaid ? "text-red-600" : "text-amber-600"}`}
                          />
                        )}
                        <p
                          className={`font-medium text-sm ${
                            isExactAmount ? "text-emerald-800" : isOverpaid ? "text-red-800" : "text-amber-800"
                          }`}
                        >
                          {isExactAmount ? "¡Pago Completo!" : isOverpaid ? "Hay un exceso" : "Pago incompleto"}
                        </p>
                        {!isExactAmount && (
                          <p className="text-xs text-slate-600 mt-1">
                            {isOverpaid ? "Revise los montos ingresados" : "Agregue más métodos de pago"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones rápidas */}
                    {remaining > 0.01 && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={payRemainingWithCash}
                          className="w-full h-9 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                          disabled={loading}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pagar resto en efectivo
                        </Button>
                        {payments.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={adjustToExactAmount}
                            className="w-full h-9 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
                            disabled={loading}
                          >
                            <Calculator className="w-4 h-4 mr-2" />
                            Ajustar primer pago
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Errores */}
                    {Object.keys(errors).length > 0 && (
                      <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="font-medium text-red-800 text-sm">Errores de validación:</p>
                            {Object.values(errors).map((error, index) => (
                              <p key={index} className="text-xs text-red-700">
                                • {error}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-slate-300 bg-slate-100">
          <div className="text-sm text-slate-600">
            {payments.length > 0 && (
              <span>
                {payments.length} método{payments.length !== 1 ? "s" : ""} de pago • {formatCurrency(totalPaid)} pagado
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="px-6 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={loading || !isExactAmount || payments.length === 0}
              className="px-6 h-10 bg-slate-800 hover:bg-slate-700 text-white text-sm"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar Venta
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
